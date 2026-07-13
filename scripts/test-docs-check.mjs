#!/usr/bin/env node
/**
 * test-docs-check — executable acceptance for the documentation graph lint.
 *
 * Implements: DCX-15 v2 (docs/specs/dcx-docs-check.yaml).
 * Materializes a copy of docs/ (+ the pre-commit gate file) in a temp
 * directory, applies each acceptance mutation from the DCX spec, runs
 * docs-check --json against the copy via DOCS_CHECK_ROOT, and asserts the
 * exit code plus the expected error as an EXACT match against one entry of
 * the parsed errors list (optionally file-anchored) — never a substring
 * scan of combined output. Message text is imported from
 * scripts/lib/messages.mjs, the same single source the lint uses, so
 * rewording cannot drift (LRN-14). The real tree is never touched.
 *
 * Zero dependencies. Usage: node scripts/test-docs-check.mjs
 * Exit code: 0 = all cases pass, 1 = failures listed.
 */

import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MSG } from './lib/messages.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const edit = (root, rel, fn) => writeFileSync(join(root, rel), fn(readFileSync(join(root, rel), 'utf8')));
const insertItem = (root, rel, itemBlock) => edit(root, rel, (s) => s.replace('items:\n', `items:\n${itemBlock}`));
/** 1-based line number of the first line matching re (for location-bearing messages). */
const lineOf = (root, rel, re) => readFileSync(join(root, rel), 'utf8').split('\n').findIndex((l) => re.test(l)) + 1;

/**
 * Case schema: mutate a fresh tree copy; assert exit code; `error` (string or
 * (root)=>string, evaluated after mutation) must equal one parsed error's
 * message exactly, `file`-anchored when given; `check(json)` for structured
 * report assertions.
 */
const CASES = [
  { name: 'clean tree passes (DCX-9)', exit: 0, mutate: () => {},
    check: (j) => j.errors.length === 0 },
  { name: 'cross-file duplicate definition (DCX-1)', exit: 1,
    error: MSG.duplicateDefinition('G-1', 'docs/product/goals.yaml'), file: 'docs/product/risks.yaml',
    mutate: (r) => insertItem(r, 'docs/product/risks.yaml', '  G-1:\n    v: 1\n    title: Dup\n    statement: dup.\n') },
  { name: 'same-file duplicate YAML key (DCX-1/DCX-4)', exit: 1,
    error: (r) => MSG.duplicateKey('G-2', lineOf(r, 'docs/product/goals.yaml', /^  G-2:/)), file: 'docs/product/goals.yaml',
    mutate: (r) => edit(r, 'docs/product/goals.yaml', (s) => s.replace('  G-3:', '  G-2:\n    v: 9\n    title: Shadow\n    statement: shadow.\n  G-3:')) },
  { name: 'frontmatter duplicate key in ADR (DCX-4)', exit: 1,
    error: MSG.duplicateKey('status', 4), file: 'docs/adr/0098-test.md',
    mutate: (r) => writeFileSync(join(r, 'docs/adr/0098-test.md'), '---\nkind: adr\ntitle: T\nstatus: proposed\nstatus: accepted\n---\n# test\n') },
  { name: 'unregistered-prefix token (DCX-3)', exit: 1,
    error: MSG.unregisteredPrefixRef('ZZZ-99'), file: 'docs/product/scope.md',
    mutate: (r) => edit(r, 'docs/product/scope.md', (s) => s + '\nSee ZZZ-99.\n') },
  { name: 'dangling reference (DCX-3)', exit: 1,
    error: MSG.undefinedRef('MEM-999'), file: 'docs/product/scope.md',
    mutate: (r) => edit(r, 'docs/product/scope.md', (s) => s + '\nSee MEM-999.\n') },
  { name: 'stale pin with cascade (DCX-5)', exit: 1,
    error: MSG.stalePin('G-1', 9, 1), file: 'docs/product/scope.md',
    mutate: (r) => edit(r, 'docs/product/scope.md', (s) => s + '\nPer G-1 v9.\n') },
  { name: 'missing priority (DCX-4)', exit: 1,
    error: MSG.itemNeedsPriority('OPS-1'), file: 'docs/product/requirements/ops-console.yaml',
    mutate: (r) => edit(r, 'docs/product/requirements/ops-console.yaml', (s) => s.replace('    priority: P0\n', '')) },
  { name: 'illegal register status (DCX-4)', exit: 1,
    error: MSG.invalidStatus('bogus'), file: 'docs/product/goals.yaml',
    mutate: (r) => edit(r, 'docs/product/goals.yaml', (s) => s.replace('status: approved', 'status: bogus')) },
  { name: 'missing folder CLAUDE.md (DCX-7)', exit: 1,
    error: MSG.missingFolderClaude(), file: 'docs/product/CLAUDE.md',
    mutate: (r) => unlinkSync(join(r, 'docs/product/CLAUDE.md')) },
  { name: 'stray extension under docs (DCX-7)', exit: 1,
    error: MSG.unexpectedExtension(), file: 'docs/product/stray.yml',
    mutate: (r) => writeFileSync(join(r, 'docs/product/stray.yml'), 'x: 1\n') },
  { name: 'definition under unregistered prefix (DCX-2)', exit: 1,
    error: MSG.unregisteredDefinition('ZZZ-1', 'ZZZ'), file: 'docs/product/goals.yaml',
    mutate: (r) => insertItem(r, 'docs/product/goals.yaml', '  ZZZ-1:\n    v: 1\n    title: Phantom\n    statement: phantom.\n') },
  { name: 'claiming the filename-owned ADR prefix (DCX-2)', exit: 1,
    error: MSG.filenameOwnedClaim('ADR'), file: 'docs/product/goals.yaml',
    mutate: (r) => edit(r, 'docs/product/goals.yaml', (s) => s.replace('prefix: G', 'prefix: [G, ADR]')) },
  { name: 'phantom ADR as items entry (DCX-2)', exit: 1,
    error: MSG.filenameOwnedDefinition('ADR-0099'), file: 'docs/product/goals.yaml',
    mutate: (r) => insertItem(r, 'docs/product/goals.yaml', '  ADR-0099:\n    v: 1\n    title: Phantom\n    statement: phantom decision.\n') },
  { name: 'registered but unclaimed prefix (DCX-2)', exit: 1,
    error: MSG.unclaimedPrefix('DCX-1', 'DCX'), file: 'docs/specs/dcx-docs-check.yaml',
    mutate: (r) => edit(r, 'docs/specs/dcx-docs-check.yaml', (s) => s.replace('prefix: DCX\n', '')) },
  { name: 'cross-cutting spec with empty constrained-by (DCX-11)', exit: 1,
    error: MSG.crossCuttingNeedsConstraints(), file: 'docs/specs/ctx-context-hooks.yaml',
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('design-scope: local', 'design-scope: cross-cutting')) },
  { name: 'constrained-by cites sketch architecture (DCX-11)', exit: 1,
    error: MSG.constraintArchitectureNotApproved('docs/architecture/data-model.yaml', 'sketch'),
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('constrained-by: []', 'constrained-by: [docs/architecture/data-model.yaml]')) },
  { name: 'constrained-by cites non-architecture path (DCX-11)', exit: 1,
    error: MSG.constraintNotArchitecture('docs/product/goals.yaml', 'goals'),
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('constrained-by: []', 'constrained-by: [docs/product/goals.yaml]')) },
  { name: 'constrained-by cites undefined ADR (DCX-11)', exit: 1,
    error: MSG.constraintUndefinedAdr('ADR-0042'),
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('constrained-by: []', 'constrained-by: [ADR-0042]')) },
  { name: 'constrained-by cites non-accepted ADR (DCX-11)', exit: 1,
    error: MSG.constraintAdrNotAccepted('ADR-0097', 'proposed'),
    mutate: (r) => {
      writeFileSync(join(r, 'docs/adr/0097-test.md'), '---\nkind: adr\ntitle: T\nstatus: proposed\n---\n# test\n');
      edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('constrained-by: []', 'constrained-by: [ADR-0097]'));
    } },
  { name: 'approved spec with empty design (DCX-12)', exit: 1,
    error: MSG.needsDesignSection(), file: 'docs/specs/ctx-context-hooks.yaml',
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace(/^design: >-\n(  .+\n|\n)+?(?=^data:)/m, 'design:\n')) },
  { name: 'approved spec without challenge block (DCX-13)', exit: 1,
    error: MSG.needsChallengeBlock(), file: 'docs/specs/ctx-context-hooks.yaml',
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace(/^challenge:\n(  .+\n|\n)+?(?=^[a-z])/m, '')) },
  { name: 'challenge record missing on disk (DCX-13)', exit: 1,
    error: MSG.recordNotFound('docs/specs/challenges/nonexistent.md'),
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('challenges/ctx-context-hooks-2026-07-13-r2.md', 'challenges/nonexistent.md')) },
  { name: 'challenge verdict mismatch with record (DCX-13)', exit: 1,
    error: MSG.recordVerdictMismatch('pass', 'fail'), file: 'docs/specs/ctx-context-hooks.yaml',
    mutate: (r) => edit(r, 'docs/specs/challenges/ctx-context-hooks-2026-07-13-r2.md', (s) => s.replace('verdict: pass', 'verdict: fail')) },
  { name: 'pre-commit gate commented out (DCX-14)', exit: 1,
    error: MSG.missingPreCommitGate('.husky/pre-commit or .githooks/pre-commit'), file: '.husky/pre-commit',
    mutate: (r) => writeFileSync(join(r, '.husky/pre-commit'), '# docs-check.mjs disabled for now\n') },
  { name: 'TEMPLATE-prefixed file is NOT exempt (DCX-3)', exit: 1,
    error: MSG.unterminatedArray(), file: 'docs/product/TEMPLATE-evil.yaml',
    mutate: (r) => writeFileSync(join(r, 'docs/product/TEMPLATE-evil.yaml'), 'kind: bogus\nbroken: [\n') },
  { name: 'learnings item with invalid type (DCX-4)', exit: 1,
    error: MSG.itemNeedsLearningType('LRN-1'), file: 'docs/learnings.yaml',
    mutate: (r) => edit(r, 'docs/learnings.yaml', (s) => s.replace('    type: gotcha\n', '    type: oops\n')) },
  { name: 'malformed approved block (DCX-4)', exit: 1,
    error: MSG.approvedBlockShape(), file: 'docs/product/goals.yaml',
    mutate: (r) => edit(r, 'docs/product/goals.yaml', (s) => s.replace('status: approved\n', 'status: approved\napproved:\n  date: 2026-07-13\n')) },
  { name: 'spec open questions appear in report (DCX-8)', exit: 0,
    check: (j) => j.openQuestions.some((e) => e.spec === 'docs/specs/ctx-context-hooks.yaml'),
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('open-questions: []', 'open-questions: [Should the guard cover more tools?]')) },
  { name: 'definition outside owning file (DCX-2)', exit: 1,
    error: MSG.outsideOwningFile('MEM-99', 'docs/product/requirements/mem-org-memory.yaml'), file: 'docs/product/risks.yaml',
    mutate: (r) => insertItem(r, 'docs/product/risks.yaml', '  MEM-99:\n    v: 1\n    title: Stray\n    statement: stray.\n') },
  { name: 'prefix claimed by two files (DCX-2)', exit: 1,
    error: MSG.prefixAlreadyOwned('G', 'docs/product/goals.yaml'), file: 'docs/product/risks.yaml',
    mutate: (r) => edit(r, 'docs/product/risks.yaml', (s) => s.replace('prefix: R', 'prefix: [R, G]')) },
  { name: 'prefix claim under unregistered prefix (DCX-2)', exit: 1,
    error: MSG.unregisteredClaim('QQQ'), file: 'docs/product/risks.yaml',
    mutate: (r) => edit(r, 'docs/product/risks.yaml', (s) => s.replace('prefix: R', 'prefix: [R, QQQ]')) },
  { name: 'uncovered P0 appears in coverage report (DCX-6)', exit: 0,
    check: (j) => j.uncovered.includes('ONB-1 (P0)'),
    mutate: () => {} },
  { name: 'effective serves falls back to file level in --json (DCX-10)', exit: 0,
    check: (j) => JSON.stringify(j.items['MEM-1'].serves) === '["G-2","G-3"]',
    mutate: () => {} },
];

let failures = 0;
for (const c of CASES) {
  const root = mkdtempSync(join(tmpdir(), 'steward-dcx-test-'));
  try {
    cpSync(join(ROOT, 'docs'), join(root, 'docs'), { recursive: true });
    mkdirSync(join(root, '.husky'), { recursive: true });
    cpSync(join(ROOT, '.husky/pre-commit'), join(root, '.husky/pre-commit'));
    c.mutate(root);
    const run = spawnSync(process.execPath, [join(ROOT, 'scripts/docs-check.mjs'), '--json'], {
      encoding: 'utf8', env: { ...process.env, DOCS_CHECK_ROOT: root },
    });
    let json = null;
    try { json = JSON.parse(run.stdout); } catch { /* handled below */ }

    const expected = typeof c.error === 'function' ? c.error(root) : c.error;
    // Exact match against one parsed error: `rel:line message` — the message
    // part must EQUAL the expected template output (file-anchored if given).
    const hasError = () => json.errors.some((e) => {
      const sep = e.indexOf(' ');
      return e.slice(sep + 1) === expected && (!c.file || e.startsWith(`${c.file}:`));
    });
    const runCheck = () => { try { return c.check(json); } catch { return false; } };
    const ok = json !== null
      && run.status === c.exit
      && (!c.error || hasError())
      && (!c.check || runCheck());
    if (!ok) {
      failures++;
      console.error(`FAIL ${c.name}\n  expected exit ${c.exit}${expected ? ` with error ${JSON.stringify(expected)}` : ''}${c.check ? ' + structured check' : ''}, got exit ${run.status}\n  errors: ${(json?.errors ?? ['<no json>']).slice(0, 3).join(' | ')}`);
    } else {
      console.log(`ok   ${c.name}`);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

console.log(`\ntest-docs-check: ${CASES.length - failures}/${CASES.length} passed`);
process.exitCode = failures ? 1 : 0;
