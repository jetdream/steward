#!/usr/bin/env node
/**
 * docs-check — the documentation graph lint.
 *
 * Implements: DCX-1 v2, DCX-2 v2, DCX-3 v2, DCX-4 v2, DCX-5 v1, DCX-6 v1,
 * DCX-7 v1, DCX-8 v2, DCX-9 v1, DCX-10 v2 (docs/specs/dcx-docs-check.yaml).
 * Parsing and graph construction live in scripts/lib/docs-graph.mjs (shared
 * with the Claude Code hooks).
 *
 * Zero dependencies. Usage: node scripts/docs-check.mjs [--json]
 * Exit code: 0 = no errors (reports allowed), 1 = errors found.
 */

import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildGraph, ROOT, DOCS } from './lib/docs-graph.mjs';

const { files, defs, refs, registry, errors } = buildGraph();
const rel = (f) => relative(ROOT, f);
const err = (file, line, msg) => errors.push(`${rel(file)}:${line} ${msg}`);

// ---- DCX-2: prefix ownership --------------------------------------------
const owners = new Map();
for (const [file, f] of files) {
  const pfx = f.data?.prefix;
  if (!pfx) continue;
  for (const p of Array.isArray(pfx) ? pfx : [pfx]) {
    if (owners.has(p)) err(file, 1, `DCX-2: prefix ${p} already owned by ${rel(owners.get(p))}`);
    else owners.set(p, file);
  }
}
for (const [id, d] of defs) {
  if (d.kind === 'adr') continue;
  const owner = owners.get(id.split('-')[0]);
  if (owner && d.file !== owner) err(d.file, d.line, `DCX-2: ${id} defined outside owning file ${rel(owner)}`);
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
const REGISTER_KINDS = new Set(['requirements', 'goals', 'principles', 'assumptions', 'risks', 'open-questions', 'inconsistencies']);
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
    if (!data.title || !data.status) err(file, 1, 'DCX-4: architecture doc needs title and status');
  } else {
    err(file, 1, `DCX-4: unknown kind "${data.kind}"`);
  }
}

// Item-level validation for every defined item (DCX-4).
for (const [id, d] of defs) {
  if (d.kind === 'adr') continue;
  const m = d.meta ?? {};
  const at = (msg) => err(d.file, d.line, msg);
  if (!Number.isInteger(Number(m.v)) || m.v === '') at(`DCX-4: ${id} needs a numeric v (version)`);
  if (!m.statement && !m.rule) at(`DCX-4: ${id} needs a statement (or rule)`);
  if (d.kind === 'requirements' && !PRIORITIES.has(m.priority)) at(`DCX-4: ${id} needs priority P0|P1|P2`);
  if ((d.kind === 'open-questions' || d.kind === 'inconsistencies') && !ITEM_STATUS.has(m.status)) at(`DCX-4: ${id} needs status open|resolved`);
  if (m.flexibility && !['hard', 'preference'].includes(m.flexibility)) at(`DCX-4: ${id} has invalid flexibility "${m.flexibility}"`);
  for (const key of ['serves', 'depends']) {
    if (m[key] && !Array.isArray(m[key])) at(`DCX-4: ${id} field ${key} must be a list`);
  }
}

// ---- DCX-7: every docs directory carries a CLAUDE.md ----------------------
(function checkDirs(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  if (!entries.some((e) => e.name === 'CLAUDE.md')) err(join(dir, 'CLAUDE.md'), 0, 'DCX-7: missing CLAUDE.md in this folder');
  for (const e of entries) if (e.isDirectory()) checkDirs(join(dir, e.name));
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

// ---- DCX-8: open inconsistencies (informational) ---------------------------
const openInc = [...defs.entries()]
  .filter(([id, d]) => id.startsWith('INC-') && d.meta?.status !== 'resolved')
  .map(([id]) => id);

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
    uncovered, openInconsistencies: openInc, errors,
  }, null, 2));
}

for (const e of errors) console.error(`ERROR ${e}`);
console.error(`docs-check: ${defs.size} IDs defined, ${refs.length} references, ${errors.length} error(s)`);
if (uncovered.length) console.error(`not yet specified (P0/P1 without an approved spec): ${uncovered.join(', ')}`);
if (openInc.length) console.error(`open inconsistencies: ${openInc.join(', ')}`);
// exitCode (not process.exit) so large --json stdout drains fully before exit.
process.exitCode = errors.length ? 1 : 0;
