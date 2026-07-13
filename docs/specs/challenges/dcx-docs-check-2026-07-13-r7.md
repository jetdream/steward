---
kind: challenge-record
spec: docs/specs/dcx-docs-check.yaml
round: 7
date: 2026-07-13
verdict: pass
by: architect-challenger (via general-purpose agent, delta-scoped)
---

# Verbatim verdict

VERDICT: pass
SPEC: docs/specs/dcx-docs-check.yaml
FINDINGS:
- [severity: low] DCX-13's record-path prefix check compares the unnormalized string, so `record: docs/specs/challenges/../../product/smuggled-record.md` passes `startsWith` while resolving outside the directory (verified: no DCX-13 error fires) — survives scrutiny only as rule-text divergence ("enforced, not just conventional") on a redundant layer: no green state is reachable, because the resolved target must be kind challenge-record to satisfy DCX-13, and any challenge-record outside docs/specs/challenges/ triggers the DCX-4 placement error (verified: traversal run exits 1 via DCX-4) — fix: one line at scripts/docs-check.mjs:142, check the resolved path (`relative(ROOT, join(ROOT, ch.record))` startsWith) or reject `..` segments. Non-blocking: the gate invariant holds through the DCX-4 backstop; this only restores defense-in-depth accuracy.
- [severity: low] the new `check:` runner path in scripts/test-docs-check.mjs has no try/catch — a throwing check (verified by corrupting `--json` stdout so `JSON.parse` throws) aborts the whole loop with an unhandled exception instead of a per-case FAIL line — survives scrutiny only as diagnostics quality: exit code is still 1, so the pre-push gate holds, and the crash is loud — fix: one line, wrap the `c.check` call in try/catch returning false. Non-blocking: no silent-pass path exists.

All four round-6 fixes verified real:
1. Harness gaps: 34/34 on the untouched tree; the six new cases (DCX-2 outside-owner, double-claim, unregistered claim; DCX-11 non-accepted ADR; DCX-6 coverage assertion; DCX-10 --json effective-serves) all have teeth — disabling all six behaviors in scripts/docs-check.mjs made exactly those six cases fail (28/34), restored to 34/34. The DCX-10 case genuinely exercises fallback (MEM-1 defines no own `serves`; file-level is `[G-2, G-3]`).
2. DCX-3 v5 exemption binding: the r6 evil-note.md attack (challenge-record frontmatter in docs/product/ with ZZZ-999, MEM-999, `G-1 v99`) now produces 4 errors — all three reference/pin errors fire normally, its citation reappears in the DCX-5 cascade list, and the DCX-4 placement error fires.
3. DCX-13 v3 path prefix: the r6 smuggled-record attack (record pointed at docs/product/) now errors "challenge record must live under docs/specs/challenges/", exit 1.
4. DCX-13 v3 evidence cross-check: flipping the r5 record's body `VERDICT: pass` → `VERDICT: fail` errors "evidence disagrees with the wrapper"; the exact forgery the rule targets — flipping the r6 fail record's frontmatter to pass and pointing the spec at it — is caught by the body check (`VERDICT: fail` body line survives), exit 1.

Fresh attacks on the changed surfaces that held: directory-name near-miss (`challengesX/`) cannot claim the exemption (trailing-slash prefix); a YAML file claiming `kind: challenge-record` fails closed as DCX-4 unknown kind and gets no reference exemption (exemption keys on markdown frontmatter only); the r6 record's own backtick-quoted `VERDICT: pass` fragment inside a longer line cannot satisfy the body check (exact trim-equality); appending a bare VERDICT line to a fail record requires editing the evidence body itself, which stays protocol-scoped per the round-5/6 fabrication precedent; LRN-13 is present, schema-valid, and correctly scope-tagged. Tree restored byte-identically after every mutation (80/80 checksums, git status unchanged, final lint exit 0, harness 34/34).

Convergence rule applied: no high, no medium, two lows with one-line fixes — pass, with the lows left to the recording change's judgment.
