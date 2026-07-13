#!/usr/bin/env node
/**
 * test-docs-check — executable acceptance for the documentation graph lint.
 *
 * Implements: DCX-15 v1 (docs/specs/dcx-docs-check.yaml).
 * Materializes a copy of docs/ (+ the pre-commit gate file) in a temp
 * directory, applies each acceptance mutation from the DCX spec, runs
 * docs-check against the copy via DOCS_CHECK_ROOT, and asserts exit code
 * and a pointing message. The real tree is never touched.
 *
 * Zero dependencies. Usage: node scripts/test-docs-check.mjs
 * Exit code: 0 = all cases pass, 1 = failures listed.
 */

import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const edit = (root, rel, fn) => writeFileSync(join(root, rel), fn(readFileSync(join(root, rel), 'utf8')));
const insertItem = (root, rel, itemBlock) => edit(root, rel, (s) => s.replace('items:\n', `items:\n${itemBlock}`));

/** Each case: mutate a fresh tree copy, expect exit code + message pattern. */
const CASES = [
  { name: 'clean tree passes (DCX-9)', exit: 0, mutate: () => {} },
  { name: 'cross-file duplicate definition (DCX-1)', exit: 1, expect: /duplicate definition of G-1/,
    mutate: (r) => insertItem(r, 'docs/product/risks.yaml', '  G-1:\n    v: 1\n    title: Dup\n    statement: dup.\n') },
  { name: 'same-file duplicate YAML key (DCX-1/DCX-4)', exit: 1, expect: /duplicate key "G-2"/,
    mutate: (r) => edit(r, 'docs/product/goals.yaml', (s) => s.replace('  G-3:', '  G-2:\n    v: 9\n    title: Shadow\n    statement: shadow.\n  G-3:')) },
  { name: 'frontmatter duplicate key in ADR (DCX-4)', exit: 1, expect: /duplicate key "status"/,
    mutate: (r) => writeFileSync(join(r, 'docs/adr/0098-test.md'), '---\nkind: adr\ntitle: T\nstatus: proposed\nstatus: accepted\n---\n# test\n') },
  { name: 'unregistered-prefix token (DCX-3)', exit: 1, expect: /DCX-3: unregistered prefix/,
    mutate: (r) => edit(r, 'docs/product/scope.md', (s) => s + '\nSee ZZZ-99.\n') },
  { name: 'dangling reference (DCX-3)', exit: 1, expect: /DCX-3: reference to undefined ID MEM-999/,
    mutate: (r) => edit(r, 'docs/product/scope.md', (s) => s + '\nSee MEM-999.\n') },
  { name: 'stale pin with cascade (DCX-5)', exit: 1, expect: /DCX-5: stale pin G-1 v9/,
    mutate: (r) => edit(r, 'docs/product/scope.md', (s) => s + '\nPer G-1 v9.\n') },
  { name: 'missing priority (DCX-4)', exit: 1, expect: /DCX-4: OPS-1 needs priority/,
    mutate: (r) => edit(r, 'docs/product/requirements/ops-console.yaml', (s) => s.replace('    priority: P0\n', '')) },
  { name: 'illegal register status (DCX-4)', exit: 1, expect: /DCX-4: invalid status "bogus"/,
    mutate: (r) => edit(r, 'docs/product/goals.yaml', (s) => s.replace('status: approved', 'status: bogus')) },
  { name: 'missing folder CLAUDE.md (DCX-7)', exit: 1, expect: /DCX-7: missing CLAUDE.md/,
    mutate: (r) => unlinkSync(join(r, 'docs/product/CLAUDE.md')) },
  { name: 'stray extension under docs (DCX-7)', exit: 1, expect: /DCX-7: unexpected extension/,
    mutate: (r) => writeFileSync(join(r, 'docs/product/stray.yml'), 'x: 1\n') },
  { name: 'definition under unregistered prefix (DCX-2)', exit: 1, expect: /DCX-2: ZZZ-1 defined under unregistered prefix/,
    mutate: (r) => insertItem(r, 'docs/product/goals.yaml', '  ZZZ-1:\n    v: 1\n    title: Phantom\n    statement: phantom.\n') },
  { name: 'claiming the filename-owned ADR prefix (DCX-2)', exit: 1, expect: /DCX-2: prefix ADR is filename-owned/,
    mutate: (r) => edit(r, 'docs/product/goals.yaml', (s) => s.replace('prefix: G', 'prefix: [G, ADR]')) },
  { name: 'phantom ADR as items entry (DCX-2)', exit: 1, expect: /must be defined by an adr\/NNNN-slug.md filename/,
    mutate: (r) => insertItem(r, 'docs/product/goals.yaml', '  ADR-0099:\n    v: 1\n    title: Phantom\n    statement: phantom decision.\n') },
  { name: 'registered but unclaimed prefix (DCX-2)', exit: 1, expect: /no file claims prefix DCX/,
    mutate: (r) => edit(r, 'docs/specs/dcx-docs-check.yaml', (s) => s.replace('prefix: DCX\n', '')) },
  { name: 'cross-cutting spec with empty constrained-by (DCX-11)', exit: 1, expect: /DCX-11: cross-cutting spec needs a non-empty constrained-by/,
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('design-scope: local', 'design-scope: cross-cutting')) },
  { name: 'constrained-by cites sketch architecture (DCX-11)', exit: 1, expect: /architecture must be approved/,
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('constrained-by: []', 'constrained-by: [docs/architecture/data-model.yaml]')) },
  { name: 'constrained-by cites non-architecture path (DCX-11)', exit: 1, expect: /only architecture docs may constrain/,
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('constrained-by: []', 'constrained-by: [docs/product/goals.yaml]')) },
  { name: 'constrained-by cites undefined ADR (DCX-11)', exit: 1, expect: /DCX-11: constrained-by cites undefined ADR-0042/,
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('constrained-by: []', 'constrained-by: [ADR-0042]')) },
  { name: 'approved spec with empty design (DCX-12)', exit: 1, expect: /DCX-12: approved spec needs a non-empty design/,
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace(/^design: >-\n(  .+\n|\n)+?(?=^data:)/m, 'design:\n')) },
  { name: 'approved spec without challenge block (DCX-13)', exit: 1, expect: /DCX-13: approved spec needs an Architect Challenger record/,
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace(/^challenge:\n(  .+\n|\n)+?(?=^[a-z])/m, '')) },
  { name: 'challenge record missing on disk (DCX-13)', exit: 1, expect: /DCX-13: challenge record not found/,
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('challenges/ctx-context-hooks-2026-07-13-r2.md', 'challenges/nonexistent.md')) },
  { name: 'challenge verdict mismatch with record (DCX-13)', exit: 1, expect: /DCX-13: verdict mismatch/,
    mutate: (r) => edit(r, 'docs/specs/challenges/ctx-context-hooks-2026-07-13-r2.md', (s) => s.replace('verdict: pass', 'verdict: fail')) },
  { name: 'pre-commit gate commented out (DCX-14)', exit: 1, expect: /DCX-14: no pre-commit hook running docs-check/,
    mutate: (r) => writeFileSync(join(r, '.husky/pre-commit'), '# docs-check.mjs disabled for now\n') },
  { name: 'TEMPLATE-prefixed file is NOT exempt (DCX-3)', exit: 1, expect: /TEMPLATE-evil/,
    mutate: (r) => writeFileSync(join(r, 'docs/product/TEMPLATE-evil.yaml'), 'kind: bogus\nbroken: [\n') },
  { name: 'learnings item with invalid type (DCX-4)', exit: 1, expect: /DCX-4: LRN-1 needs type gotcha\|dead-end\|pattern/,
    mutate: (r) => edit(r, 'docs/learnings.yaml', (s) => s.replace('    type: gotcha\n', '    type: oops\n')) },
  { name: 'malformed approved block (DCX-4)', exit: 1, expect: /DCX-4: approved block needs date and by/,
    mutate: (r) => edit(r, 'docs/product/goals.yaml', (s) => s.replace('status: approved\n', 'status: approved\napproved:\n  date: 2026-07-13\n')) },
  { name: 'spec open questions appear in report (DCX-8)', exit: 0, expect: /open questions in docs\/specs\/ctx-context-hooks\.yaml/,
    mutate: (r) => edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('open-questions: []', 'open-questions: [Should the guard cover more tools?]')) },
  { name: 'definition outside owning file (DCX-2)', exit: 1, expect: /DCX-2: MEM-99 defined outside owning file/,
    mutate: (r) => insertItem(r, 'docs/product/risks.yaml', '  MEM-99:\n    v: 1\n    title: Stray\n    statement: stray.\n') },
  { name: 'prefix claimed by two files (DCX-2)', exit: 1, expect: /DCX-2: prefix G already owned by/,
    mutate: (r) => edit(r, 'docs/product/risks.yaml', (s) => s.replace('prefix: R', 'prefix: [R, G]')) },
  { name: 'prefix claim under unregistered prefix (DCX-2)', exit: 1, expect: /DCX-2: prefix QQQ claimed but not registered/,
    mutate: (r) => edit(r, 'docs/product/risks.yaml', (s) => s.replace('prefix: R', 'prefix: [R, QQQ]')) },
  { name: 'constrained-by cites non-accepted ADR (DCX-11)', exit: 1, expect: /only accepted ADRs may constrain/,
    mutate: (r) => {
      writeFileSync(join(r, 'docs/adr/0097-test.md'), '---\nkind: adr\ntitle: T\nstatus: proposed\n---\n# test\n');
      edit(r, 'docs/specs/ctx-context-hooks.yaml', (s) => s.replace('constrained-by: []', 'constrained-by: [ADR-0097]'));
    } },
  { name: 'uncovered P0 appears in coverage report (DCX-6)', exit: 0, expect: /not yet specified .*ONB-1 \(P0\)/,
    mutate: () => {} },
  { name: 'effective serves falls back to file level in --json (DCX-10)', exit: 0, args: ['--json'],
    check: ({ stdout }) => JSON.stringify(JSON.parse(stdout).items['MEM-1'].serves) === '["G-2","G-3"]',
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
    const run = spawnSync(process.execPath, [join(ROOT, 'scripts/docs-check.mjs'), ...(c.args ?? [])], {
      encoding: 'utf8', env: { ...process.env, DOCS_CHECK_ROOT: root },
    });
    const output = run.stderr + run.stdout;
    const runCheck = () => { try { return c.check({ stdout: run.stdout, stderr: run.stderr }); } catch { return false; } };
    const ok = run.status === c.exit
      && (!c.expect || c.expect.test(output))
      && (!c.check || runCheck());
    if (!ok) {
      failures++;
      console.error(`FAIL ${c.name}\n  expected exit ${c.exit}${c.expect ? ` matching ${c.expect}` : ''}${c.check ? ' + custom check' : ''}, got exit ${run.status}\n  output: ${output.split('\n').slice(0, 4).join(' | ')}`);
    } else {
      console.log(`ok   ${c.name}`);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

console.log(`\ntest-docs-check: ${CASES.length - failures}/${CASES.length} passed`);
process.exitCode = failures ? 1 : 0;
