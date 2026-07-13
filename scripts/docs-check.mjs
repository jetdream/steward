#!/usr/bin/env node
/**
 * docs-check — the documentation graph lint.
 *
 * Implements: DCX-1 v2, DCX-2 v5, DCX-3 v5, DCX-4 v6, DCX-5 v1, DCX-6 v1,
 * DCX-7 v2, DCX-8 v2, DCX-9 v1, DCX-10 v2, DCX-11 v2, DCX-12 v1, DCX-13 v3,
 * DCX-14 v2, DCX-16 v1 (.spec/specs/dcx-docs-check.yaml). DCX-15 lives in
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
import { MSG } from './lib/messages.mjs';

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
    if (FILENAME_OWNED.has(p)) err(file, 1, MSG.filenameOwnedClaim(p));
    if (!registry.has(p)) err(file, 1, MSG.unregisteredClaim(p));
    if (owners.has(p)) err(file, 1, MSG.prefixAlreadyOwned(p, rel(owners.get(p))));
    else owners.set(p, file);
  }
}
for (const [id, d] of defs) {
  if (d.kind === 'adr') continue;
  const prefix = id.split('-')[0];
  if (FILENAME_OWNED.has(prefix)) err(d.file, d.line, MSG.filenameOwnedDefinition(id));
  if (!registry.has(prefix)) err(d.file, d.line, MSG.unregisteredDefinition(id, prefix));
  const owner = owners.get(prefix);
  if (!owner) err(d.file, d.line, MSG.unclaimedPrefix(id, prefix));
  else if (d.file !== owner) err(d.file, d.line, MSG.outsideOwningFile(id, rel(owner)));
}

// ---- DCX-3 + DCX-5: references resolve; pins are fresh --------------------
const staleIds = new Set();
for (const r of refs) {
  if (!registry.has(r.prefix)) {
    err(r.file, r.line, MSG.unregisteredPrefixRef(r.id));
    continue;
  }
  const d = defs.get(r.id);
  if (!d) {
    err(r.file, r.line, MSG.undefinedRef(r.id));
  } else if (r.pin !== null && r.pin !== d.version) {
    err(r.file, r.line, MSG.stalePin(r.id, r.pin, d.version));
    staleIds.add(r.id);
  }
}
for (const id of staleIds) {
  const sites = refs.filter((r) => r.id === id).map((r) => `${rel(r.file)}:${r.line}`);
  console.error(`cascade for ${id}: revisit ${sites.length} citing site(s):\n  ${sites.join('\n  ')}`);
}

// ---- DCX-4: schema validity by kind ---------------------------------------
const REGISTER_KINDS = new Set(['requirements', 'goals', 'principles', 'assumptions', 'risks', 'open-questions', 'inconsistencies', 'learnings', 'decisions', 'constraints']);
// Product-normative registers whose items require HITL provenance (DCX-16).
const GOVERNED_KINDS = new Set(['requirements', 'goals', 'principles']);
const CON_CATEGORIES = new Set(['compliance', 'deployment', 'usage', 'environment', 'integration', 'other']);
const DOC_STATUS = new Set(['draft', 'approved', 'superseded']);
const SPEC_STATUS = new Set(['draft', 'approved', 'implemented', 'superseded']);
const PRIORITIES = new Set(['P0', 'P1', 'P2']);
const ITEM_STATUS = new Set(['open', 'resolved']);

for (const [file, f] of files) {
  const { data } = f;
  if (!data) continue; // markdown

  if (REGISTER_KINDS.has(data.kind)) {
    if (!data.prefix) err(file, 1, MSG.registerMissingPrefix());
    if (!data.title) err(file, 1, MSG.registerMissingTitle());
    if (!DOC_STATUS.has(data.status)) err(file, 1, MSG.invalidStatus(data.status));
    if (typeof data.items !== 'object') err(file, 1, MSG.registerMissingItems());
    if (data.kind === 'requirements' && !Array.isArray(data.serves)) err(file, 1, MSG.requirementsMissingServes());
  } else if (data.kind === 'spec') {
    if (!SPEC_STATUS.has(data.status)) err(file, 1, MSG.invalidSpecStatus(data.status));
    if (!Array.isArray(data.implements)) err(file, 1, MSG.specMissingImplements());
    for (const p of data['depends-on'] ?? []) {
      if (!registry.has(p)) err(file, 1, MSG.dependsOnUnregistered(p));
    }
    // `behavior:` keys are references to register-defined requirement IDs.
    for (const id of Object.keys(data.behavior ?? {})) {
      if (!defs.has(id)) err(file, f.keyLines.get(`behavior.${id}`) ?? 1, MSG.undefinedBehaviorKey(id));
    }
  } else if (data.kind === 'glossary') {
    if (typeof data.terms !== 'object') err(file, 1, MSG.glossaryMissingTerms());
  } else if (data.kind === 'architecture') {
    if (!data.title) err(file, 1, MSG.architectureNeedsTitle());
    if (!['sketch', 'approved', 'superseded'].includes(data.status)) err(file, 1, MSG.invalidArchitectureStatus(data.status));
  } else {
    err(file, 1, MSG.unknownKind(data.kind));
  }
}

// ---- DCX-11..13: design edge, design section, challenge record ------------
for (const [file, f] of files) {
  if (f.data?.kind !== 'spec' || !['approved', 'implemented'].includes(f.data.status)) continue;
  const scope = f.data['design-scope'];
  const cb = f.data['constrained-by'];
  if (!['local', 'cross-cutting'].includes(scope)) {
    err(file, 1, MSG.needsDesignScope());
  }
  if (scope === 'cross-cutting' && (!Array.isArray(cb) || cb.length === 0)) {
    err(file, 1, MSG.crossCuttingNeedsConstraints());
  }
  for (const entry of Array.isArray(cb) ? cb : []) {
    if (/^ADR-\d{4}$/.test(entry)) {
      const adr = defs.get(entry);
      if (!adr) err(file, 1, MSG.constraintUndefinedAdr(entry));
      else if (adr.kind !== 'adr') err(file, 1, MSG.constraintPhantomAdr(entry));
      else if (adr.meta?.status !== 'accepted') err(file, 1, MSG.constraintAdrNotAccepted(entry, adr.meta?.status));
    } else {
      const target = files.get(join(ROOT, entry));
      if (!target) err(file, 1, MSG.constraintPathNotFound(entry));
      else if (target.data?.kind !== 'architecture') err(file, 1, MSG.constraintNotArchitecture(entry, target.data?.kind));
      else if (target.data?.status !== 'approved') err(file, 1, MSG.constraintArchitectureNotApproved(entry, target.data?.status));
    }
  }
  if (!String(f.data.design ?? '').trim()) {
    err(file, 1, MSG.needsDesignSection());
  }
  const ch = f.data.challenge;
  if (typeof ch !== 'object' || ch.verdict !== 'pass' || !ch.date || !ch.by || !String(ch.summary ?? '').trim() || !ch.record) {
    err(file, 1, MSG.needsChallengeBlock());
  } else {
    // A verdict without evidence is not a verdict: the record must live in
    // the append-only evidence directory, be a challenge-record, name this
    // spec, and agree on the verdict — in frontmatter AND in the verbatim
    // body's VERDICT line (the laziest forgery flips wrapper metadata).
    const recFile = files.get(join(ROOT, ch.record));
    // Compare the RESOLVED path so `..` traversal cannot dress an outside
    // file in the right-looking prefix.
    if (!relative(ROOT, join(ROOT, String(ch.record))).startsWith('.spec/specs/challenges/')) err(file, 1, MSG.recordOutsideDir(ch.record));
    else if (!recFile) err(file, 1, MSG.recordNotFound(ch.record));
    else if (recFile.fm?.kind !== 'challenge-record') err(file, 1, MSG.recordWrongKind(ch.record));
    else {
      if (recFile.fm.spec !== f.rel) err(file, 1, MSG.recordWrongSpec(ch.record, recFile.fm.spec, f.rel));
      if (recFile.fm.verdict !== ch.verdict) err(file, 1, MSG.recordVerdictMismatch(ch.verdict, recFile.fm.verdict));
      if (!recFile.lines.some((l) => l.trim() === `VERDICT: ${ch.verdict}`)) err(file, 1, MSG.recordEvidenceDisagrees(ch.record, ch.verdict));
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
if (!gate) errors.push(`${gateCandidates[0]}:0 ${MSG.missingPreCommitGate(gateCandidates.join(' or '))}`);

// Item-level validation for every defined item (DCX-4).
for (const [id, d] of defs) {
  if (d.kind === 'adr') continue;
  const m = d.meta ?? {};
  const at = (msg) => err(d.file, d.line, msg);
  if (!Number.isInteger(Number(m.v)) || m.v === '') at(MSG.itemNeedsVersion(id));
  if (!m.statement && !m.rule) at(MSG.itemNeedsStatement(id));
  if (d.kind === 'requirements' && !PRIORITIES.has(m.priority)) at(MSG.itemNeedsPriority(id));
  if ((d.kind === 'open-questions' || d.kind === 'inconsistencies') && !ITEM_STATUS.has(m.status)) at(MSG.itemNeedsStatus(id));
  if (d.kind === 'learnings') {
    if (!['gotcha', 'dead-end', 'pattern'].includes(m.type)) at(MSG.itemNeedsLearningType(id));
    if (!Array.isArray(m.scope)) at(MSG.itemNeedsScope(id));
  }
  if (d.kind === 'decisions' && (!m.date || !m.by)) at(MSG.itemNeedsDecisionMeta(id));
  if (d.kind === 'constraints' && !CON_CATEGORIES.has(m.category)) at(MSG.itemNeedsCategory(id));
  if (m.flexibility && !['hard', 'preference'].includes(m.flexibility)) at(MSG.invalidFlexibility(id, m.flexibility));
  if (m.origin && m.origin !== 'baseline') at(MSG.invalidOrigin(id, m.origin));
  for (const key of ['serves', 'depends', 'binds', 'scope']) {
    if (m[key] && !Array.isArray(m[key])) at(MSG.itemFieldMustBeList(id, key));
  }

  // DCX-16: HITL sign-off provenance on product-normative items.
  if (GOVERNED_KINDS.has(d.kind)) {
    const hasBaseline = m.origin === 'baseline';
    const hasDecision = typeof m['decided-by'] === 'string' && m['decided-by'];
    if (!hasBaseline && !hasDecision) at(MSG.needsProvenance(id));
    if (hasBaseline && hasDecision) at(MSG.provenanceNotBoth(id));
    if (hasBaseline && Number(m.v) !== 1) at(MSG.baselineNotAtV1(id, m.v));
    if (hasDecision) {
      const dec = defs.get(m['decided-by']);
      if (!dec) at(MSG.decidedByUndefined(id, m['decided-by']));
      else if (dec.kind !== 'decisions') at(MSG.decidedByWrongKind(id, m['decided-by']));
    }
  }
}

// Challenge-record frontmatter and approval-provenance shapes (DCX-4).
for (const [file, f] of files) {
  if (f.fm?.kind === 'challenge-record') {
    if (!f.rel.startsWith('.spec/specs/challenges/')) err(file, 1, MSG.recordOutsideChallenges());
    for (const field of ['spec', 'round', 'date']) {
      if (!f.fm[field]) err(file, 1, MSG.recordMissingField(field));
    }
    if (!['pass', 'fail'].includes(f.fm.verdict)) err(file, 1, MSG.recordInvalidVerdict());
  }
  const approved = f.data?.approved ?? f.fm?.approved;
  if (approved && (typeof approved !== 'object' || !approved.date || !approved.by)) {
    err(file, 1, MSG.approvedBlockShape());
  }
}

// ---- DCX-7: folder hygiene — CLAUDE.md present, no invisible extensions ----
(function checkDirs(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  if (!entries.some((e) => e.name === 'CLAUDE.md')) err(join(dir, 'CLAUDE.md'), 0, MSG.missingFolderClaude());
  for (const e of entries) {
    if (e.isDirectory()) checkDirs(join(dir, e.name));
    else if (!/\.(md|yaml)$/.test(e.name)) err(join(dir, e.name), 0, MSG.unexpectedExtension());
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
