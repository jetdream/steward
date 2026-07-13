#!/usr/bin/env node
/**
 * docs-check — the documentation graph lint.
 *
 * Implements: DCX-1 v2, DCX-2 v5, DCX-3 v5, DCX-4 v5, DCX-5 v1, DCX-6 v1,
 * DCX-7 v2, DCX-8 v2, DCX-9 v1, DCX-10 v2, DCX-11 v2, DCX-12 v1, DCX-13 v3,
 * DCX-14 v2 (docs/specs/dcx-docs-check.yaml). DCX-15 lives in
 * scripts/test-docs-check.mjs.
 * Parsing and graph construction live in scripts/lib/docs-graph.mjs (shared
 * with the Claude Code hooks).
 *
 * Zero dependencies. Usage: node scripts/docs-check.mjs [--json]
 * Exit code: 0 = no errors (reports allowed), 1 = errors found.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildGraph, ROOT, DOCS } from './lib/docs-graph.mjs';

const { files, defs, refs, registry, errors } = buildGraph();
const rel = (f) => relative(ROOT, f);
const err = (file, line, msg) => errors.push(`${rel(file)}:${line} ${msg}`);

// ---- DCX-2: prefix ownership --------------------------------------------
// Filename-owned namespaces: IDs defined only by file names, never by items
// entries or prefix claims — a phantom items-map "ADR" would bypass DCX-11.
const FILENAME_OWNED = new Set(['ADR']);
const owners = new Map();
for (const [file, f] of files) {
  const pfx = f.data?.prefix;
  if (!pfx) continue;
  for (const p of Array.isArray(pfx) ? pfx : [pfx]) {
    if (FILENAME_OWNED.has(p)) err(file, 1, `DCX-2: prefix ${p} is filename-owned (adr/NNNN-slug.md) and cannot be claimed by a register`);
    if (!registry.has(p)) err(file, 1, `DCX-2: prefix ${p} claimed but not registered in docs/CLAUDE.md`);
    if (owners.has(p)) err(file, 1, `DCX-2: prefix ${p} already owned by ${rel(owners.get(p))}`);
    else owners.set(p, file);
  }
}
for (const [id, d] of defs) {
  if (d.kind === 'adr') continue;
  const prefix = id.split('-')[0];
  if (FILENAME_OWNED.has(prefix)) err(d.file, d.line, `DCX-2: ${id} must be defined by an adr/NNNN-slug.md filename, not an items entry`);
  if (!registry.has(prefix)) err(d.file, d.line, `DCX-2: ${id} defined under unregistered prefix ${prefix} — register it in docs/CLAUDE.md first`);
  const owner = owners.get(prefix);
  if (!owner) err(d.file, d.line, `DCX-2: ${id} defined but no file claims prefix ${prefix} — the ownership invariant must not silently vanish`);
  else if (d.file !== owner) err(d.file, d.line, `DCX-2: ${id} defined outside owning file ${rel(owner)}`);
}

// ---- DCX-3 + DCX-5: references resolve; pins are fresh --------------------
const staleIds = new Set();
for (const r of refs) {
  if (!registry.has(r.prefix)) {
    err(r.file, r.line, `DCX-3: unregistered prefix in "${r.id}" — register it in docs/CLAUDE.md or rename`);
    continue;
  }
  const d = defs.get(r.id);
  if (!d) {
    err(r.file, r.line, `DCX-3: reference to undefined ID ${r.id}`);
  } else if (r.pin !== null && r.pin !== d.version) {
    err(r.file, r.line, `DCX-5: stale pin ${r.id} v${r.pin} (current: v${d.version})`);
    staleIds.add(r.id);
  }
}
for (const id of staleIds) {
  const sites = refs.filter((r) => r.id === id).map((r) => `${rel(r.file)}:${r.line}`);
  console.error(`cascade for ${id}: revisit ${sites.length} citing site(s):\n  ${sites.join('\n  ')}`);
}

// ---- DCX-4: schema validity by kind ---------------------------------------
const REGISTER_KINDS = new Set(['requirements', 'goals', 'principles', 'assumptions', 'risks', 'open-questions', 'inconsistencies', 'learnings']);
const DOC_STATUS = new Set(['draft', 'approved', 'superseded']);
const SPEC_STATUS = new Set(['draft', 'approved', 'implemented', 'superseded']);
const PRIORITIES = new Set(['P0', 'P1', 'P2']);
const ITEM_STATUS = new Set(['open', 'resolved']);

for (const [file, f] of files) {
  const { data } = f;
  if (!data) continue; // markdown

  if (REGISTER_KINDS.has(data.kind)) {
    if (!data.prefix) err(file, 1, 'DCX-4: register missing prefix');
    if (!data.title) err(file, 1, 'DCX-4: register missing title');
    if (!DOC_STATUS.has(data.status)) err(file, 1, `DCX-4: invalid status "${data.status}"`);
    if (typeof data.items !== 'object') err(file, 1, 'DCX-4: register missing items map');
    if (data.kind === 'requirements' && !Array.isArray(data.serves)) err(file, 1, 'DCX-4: requirements register missing serves list');
  } else if (data.kind === 'spec') {
    if (!SPEC_STATUS.has(data.status)) err(file, 1, `DCX-4: invalid spec status "${data.status}"`);
    if (!Array.isArray(data.implements)) err(file, 1, 'DCX-4: spec missing implements list');
    for (const p of data['depends-on'] ?? []) {
      if (!registry.has(p)) err(file, 1, `DCX-4: depends-on has unregistered prefix "${p}"`);
    }
    // `behavior:` keys are references to register-defined requirement IDs.
    for (const id of Object.keys(data.behavior ?? {})) {
      if (!defs.has(id)) err(file, f.keyLines.get(`behavior.${id}`) ?? 1, `DCX-3: behavior key references undefined ID ${id}`);
    }
  } else if (data.kind === 'glossary') {
    if (typeof data.terms !== 'object') err(file, 1, 'DCX-4: glossary missing terms map');
  } else if (data.kind === 'architecture') {
    if (!data.title) err(file, 1, 'DCX-4: architecture doc needs a title');
    if (!['sketch', 'approved', 'superseded'].includes(data.status)) err(file, 1, `DCX-4: invalid architecture status "${data.status}"`);
  } else {
    err(file, 1, `DCX-4: unknown kind "${data.kind}"`);
  }
}

// ---- DCX-11..13: design edge, design section, challenge record ------------
for (const [file, f] of files) {
  if (f.data?.kind !== 'spec' || !['approved', 'implemented'].includes(f.data.status)) continue;
  const scope = f.data['design-scope'];
  const cb = f.data['constrained-by'];
  if (!['local', 'cross-cutting'].includes(scope)) {
    err(file, 1, 'DCX-11: approved spec needs design-scope local|cross-cutting');
  }
  if (scope === 'cross-cutting' && (!Array.isArray(cb) || cb.length === 0)) {
    err(file, 1, 'DCX-11: cross-cutting spec needs a non-empty constrained-by list');
  }
  for (const entry of Array.isArray(cb) ? cb : []) {
    if (/^ADR-\d{4}$/.test(entry)) {
      const adr = defs.get(entry);
      if (!adr) err(file, 1, `DCX-11: constrained-by cites undefined ${entry}`);
      else if (adr.kind !== 'adr') err(file, 1, `DCX-11: ${entry} is not a filename-defined decision record — a phantom ADR cannot constrain a spec`);
      else if (adr.meta?.status !== 'accepted') err(file, 1, `DCX-11: ${entry} has status "${adr.meta?.status}" — only accepted ADRs may constrain a spec (superseding cascades here)`);
    } else {
      const target = files.get(join(ROOT, entry));
      if (!target) err(file, 1, `DCX-11: constrained-by path not found: ${entry}`);
      else if (target.data?.kind !== 'architecture') err(file, 1, `DCX-11: ${entry} is kind "${target.data?.kind}" — only architecture docs may constrain a spec by path`);
      else if (target.data?.status !== 'approved') err(file, 1, `DCX-11: ${entry} has status "${target.data?.status}" — architecture must be approved before specs build on it`);
    }
  }
  if (!String(f.data.design ?? '').trim()) {
    err(file, 1, 'DCX-12: approved spec needs a non-empty design section');
  }
  const ch = f.data.challenge;
  if (typeof ch !== 'object' || ch.verdict !== 'pass' || !ch.date || !ch.by || !String(ch.summary ?? '').trim() || !ch.record) {
    err(file, 1, 'DCX-13: approved spec needs an Architect Challenger record (challenge: date/by/verdict: pass/summary/record)');
  } else {
    // A verdict without evidence is not a verdict: the record must live in
    // the append-only evidence directory, be a challenge-record, name this
    // spec, and agree on the verdict — in frontmatter AND in the verbatim
    // body's VERDICT line (the laziest forgery flips wrapper metadata).
    const recFile = files.get(join(ROOT, ch.record));
    // Compare the RESOLVED path so `..` traversal cannot dress an outside
    // file in the right-looking prefix.
    if (!relative(ROOT, join(ROOT, String(ch.record))).startsWith('docs/specs/challenges/')) err(file, 1, `DCX-13: challenge record must live under docs/specs/challenges/ (got ${ch.record})`);
    else if (!recFile) err(file, 1, `DCX-13: challenge record not found: ${ch.record}`);
    else if (recFile.fm?.kind !== 'challenge-record') err(file, 1, `DCX-13: ${ch.record} is not a challenge-record`);
    else {
      if (recFile.fm.spec !== f.rel) err(file, 1, `DCX-13: ${ch.record} names spec "${recFile.fm.spec}", not ${f.rel}`);
      if (recFile.fm.verdict !== ch.verdict) err(file, 1, `DCX-13: verdict mismatch — block says "${ch.verdict}", record says "${recFile.fm.verdict}"`);
      if (!recFile.lines.some((l) => l.trim() === `VERDICT: ${ch.verdict}`)) err(file, 1, `DCX-13: ${ch.record} body has no "VERDICT: ${ch.verdict}" line — evidence disagrees with the wrapper`);
    }
  }
}

// ---- DCX-14: pre-commit repo gate ------------------------------------------
const gateCandidates = ['.husky/pre-commit', '.githooks/pre-commit'];
const gate = gateCandidates.find((p) => {
  try {
    // Must reference docs-check.mjs on a non-comment line — a commented-out
    // invocation is not a gate.
    return readFileSync(join(ROOT, p), 'utf8').split('\n')
      .some((l) => !l.trim().startsWith('#') && l.includes('docs-check.mjs'));
  } catch { return false; }
});
if (!gate) errors.push(`${gateCandidates[0]}:0 DCX-14: no pre-commit hook running docs-check found (${gateCandidates.join(' or ')})`);

// Item-level validation for every defined item (DCX-4).
for (const [id, d] of defs) {
  if (d.kind === 'adr') continue;
  const m = d.meta ?? {};
  const at = (msg) => err(d.file, d.line, msg);
  if (!Number.isInteger(Number(m.v)) || m.v === '') at(`DCX-4: ${id} needs a numeric v (version)`);
  if (!m.statement && !m.rule) at(`DCX-4: ${id} needs a statement (or rule)`);
  if (d.kind === 'requirements' && !PRIORITIES.has(m.priority)) at(`DCX-4: ${id} needs priority P0|P1|P2`);
  if ((d.kind === 'open-questions' || d.kind === 'inconsistencies') && !ITEM_STATUS.has(m.status)) at(`DCX-4: ${id} needs status open|resolved`);
  if (d.kind === 'learnings') {
    if (!['gotcha', 'dead-end', 'pattern'].includes(m.type)) at(`DCX-4: ${id} needs type gotcha|dead-end|pattern`);
    if (!Array.isArray(m.scope)) at(`DCX-4: ${id} needs a scope list`);
  }
  if (m.flexibility && !['hard', 'preference'].includes(m.flexibility)) at(`DCX-4: ${id} has invalid flexibility "${m.flexibility}"`);
  for (const key of ['serves', 'depends']) {
    if (m[key] && !Array.isArray(m[key])) at(`DCX-4: ${id} field ${key} must be a list`);
  }
}

// Challenge-record frontmatter and approval-provenance shapes (DCX-4).
for (const [file, f] of files) {
  if (f.fm?.kind === 'challenge-record') {
    if (!f.rel.startsWith('docs/specs/challenges/')) err(file, 1, 'DCX-4: challenge-record outside docs/specs/challenges/ — the reference exemption is bound to that directory');
    for (const field of ['spec', 'round', 'date']) {
      if (!f.fm[field]) err(file, 1, `DCX-4: challenge-record missing ${field}`);
    }
    if (!['pass', 'fail'].includes(f.fm.verdict)) err(file, 1, 'DCX-4: challenge-record verdict must be pass|fail');
  }
  const approved = f.data?.approved ?? f.fm?.approved;
  if (approved && (typeof approved !== 'object' || !approved.date || !approved.by)) {
    err(file, 1, 'DCX-4: approved block needs date and by');
  }
}

// ---- DCX-7: folder hygiene — CLAUDE.md present, no invisible extensions ----
(function checkDirs(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  if (!entries.some((e) => e.name === 'CLAUDE.md')) err(join(dir, 'CLAUDE.md'), 0, 'DCX-7: missing CLAUDE.md in this folder');
  for (const e of entries) {
    if (e.isDirectory()) checkDirs(join(dir, e.name));
    else if (!/\.(md|yaml)$/.test(e.name)) err(join(dir, e.name), 0, `DCX-7: unexpected extension under docs/ — only .yaml and .md are lintable (rename or move)`);
  }
})(DOCS);

// ---- DCX-6: P0/P1 coverage by non-superseded specs (informational) --------
const implemented = new Set();
for (const [, f] of files) {
  if (f.data?.kind === 'spec' && f.data.status !== 'superseded') {
    for (const id of f.data.implements ?? []) implemented.add(id);
  }
}
const uncovered = [...defs.entries()]
  .filter(([id, d]) => d.kind === 'requirements' && ['P0', 'P1'].includes(d.meta?.priority) && !implemented.has(id))
  .map(([id, d]) => `${id} (${d.meta.priority})`);

// ---- DCX-8: open inconsistencies + spec open-questions (informational) -----
const openInc = [...defs.entries()]
  .filter(([id, d]) => id.startsWith('INC-') && d.meta?.status !== 'resolved')
  .map(([id]) => id);
const openQuestionsBySpec = [...files.values()]
  .filter((f) => f.data?.kind === 'spec')
  .map((f) => {
    const oq = f.data['open-questions'];
    const list = Array.isArray(oq) ? oq : String(oq ?? '').trim() ? [String(oq).trim()] : [];
    return { spec: f.rel, questions: list };
  })
  .filter((e) => e.questions.length);

// ---- DCX-9 / DCX-10: output ------------------------------------------------
if (process.argv.includes('--json')) {
  // The canonical per-item registry, with effective serves (DCX-10).
  console.log(JSON.stringify({
    items: Object.fromEntries([...defs].map(([id, d]) => [id, {
      ...(d.meta ?? {}),
      v: d.version,
      file: rel(d.file),
      line: d.line,
      serves: d.meta?.serves ?? files.get(d.file)?.data?.serves ?? undefined,
      specified: implemented.has(id) || undefined,
    }])),
    references: refs.map((r) => ({ id: r.id, pin: r.pin, file: rel(r.file), line: r.line })),
    files: Object.fromEntries([...files.values()].map((f) => [f.rel, { kind: f.kind, status: f.data?.status ?? f.fm?.status }])),
    uncovered, openInconsistencies: openInc, openQuestions: openQuestionsBySpec, errors,
  }, null, 2));
}

for (const e of errors) console.error(`ERROR ${e}`);
console.error(`docs-check: ${defs.size} IDs defined, ${refs.length} references, ${errors.length} error(s)`);
if (uncovered.length) console.error(`not yet specified (P0/P1 not covered by any non-superseded spec): ${uncovered.join(', ')}`);
if (openInc.length) console.error(`open inconsistencies: ${openInc.join(', ')}`);
for (const e of openQuestionsBySpec) console.error(`open questions in ${e.spec}: ${e.questions.join(' | ')}`);
// exitCode (not process.exit) so large --json stdout drains fully before exit.
process.exitCode = errors.length ? 1 : 0;
