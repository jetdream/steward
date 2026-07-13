---
kind: challenge-record
spec: docs/specs/dcx-docs-check.yaml
round: 8
date: 2026-07-13
verdict: pass
by: architect-challenger (via general-purpose agent, delta-scoped)
---

# Verbatim verdict

VERDICT: pass
SPEC: docs/specs/dcx-docs-check.yaml
FINDINGS:
- [severity: low] scripts/lib/messages.mjs:24 exports a dead template `duplicateDefinitionAt` that no producer or harness ever calls, and its wording diverges from the live `duplicateDefinition` (adds a "DCX-1:" code prefix and "first at rel:line" shape) — survives scrutiny as refactor residue that contradicts the module's own "single source of every lint message" contract: an agent grepping MSG for a DCX-1 assertion can pick the phantom and write a never-matching test (loud, so no silent-pass path — non-blocking) — fix: delete the line.
- [severity: low] the 'challenge verdict mismatch (DCX-13)' case is the only assertion that is both subject-free (message embeds just the verdict pair "pass"/"fail", not the spec or record identity) and file-anchor-free — survives scrutiny only as a hardening note: verified no wrong-subject pass is reachable today (only the mutated ctx pair can emit that exact string; a second spec citing the same record trips recordWrongSpec instead), so it does not block — fix: add `file: 'docs/specs/ctx-context-hooks.yaml'` to the case (one line).

What was attacked and why it held (all mutations restored, 82/82 checksums byte-identical, git status unchanged, final lint exit 0 with 131 IDs, harness 34/34):
- **Message-refactor fidelity**: diffed every extracted template against the pre-refactor literals in `git show HEAD:scripts/docs-check.mjs` and the docs-graph diff — all byte-identical; the messages quoted in the r5–r7 evidence records still match.
- **MSG completeness**: no literal message construction remains in either producer (the only non-MSG `errors.push` sites at scripts/lib/docs-graph.mjs:166,173 are line-number remapping of already-templated parser errors); audit of all 49 MSG keys found exactly one unused (finding 1).
- **Tautology / subject pinning**: emitting `MSG.undefinedRef('XXX-1')` instead of the real ID failed exactly the dangling-reference case — the harness supplies template arguments independently, so exact-match pins which check fired on which subject. Every subject-free template case (missingFolderClaude, unexpectedExtension, unterminatedArray, needsDesignSection, …) carries a file anchor; the one exception is finding 2.
- **Drift immunity**: rewording `undefinedRef` → 34/34, as designed.
- **Behavior teeth**: cleanly disabling the unclaimedPrefix check → exactly its one case fails (33/34). A first sloppy disable crashed the lint (undefined `owner` reaching `rel()`) — and the harness failed closed on the missing JSON, incidentally proving crash handling.
- **Runner correctness**: corrupting `--json` stdout → all 34 fail per-case with `<no json>`, harness exit 1, no unhandled exception (r7 low #2 fix has teeth); forcing lint exitCode 0 → all 30 error-expecting cases fail on the exit assertion.
- **r7 low #1 fix**: `record: docs/specs/challenges/../../product/vision.md` now fires the DCX-13 outside-dir error on the resolved path; an inside-dir `../challenges/` traversal correctly resolves clean.
- **Delta hygiene**: LRN-14 present, schema-valid, correctly typed dead-end with the tautology tradeoff and deferred error-code taxonomy recorded; DCX-15 v2 rule text matches the implementation clause-for-clause (exact match of parsed entries, optional file anchors, structured report assertions for DCX-6/8/10, pre-push wiring in .husky/pre-push); no stale `DCX-15 v1` pins anywhere (lint green).

Convergence rule applied: no high, no medium, two one-line lows — pass, lows left to the recording change's judgment.
