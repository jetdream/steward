---
kind: challenge-record
spec: specs/mem-org-memory.yaml (MEMS-1..6 — Org Memory behavior; DEC-22 propagation closure)
round: 3
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (delta-scoped — verify r2 fixes + independent exhaustive dual-home sweep)
---

# MEM spec — round 3 (delta: DEC-22 propagation completeness)

Verified every round-2 fix landed, then ran an INDEPENDENT exhaustive sweep for
the dual-home concept and found one more live artifact — in a phrasing variant
the round-2 regex could not match.

## Round-2 findings — verification
- **HIGH-A (incomplete sweep) — PARTIAL again.** glossary `Redirect` and EXP-19
  (v2) both correctly single-source now — RESOLVED. But the sweep was still
  incomplete: the word-form regex ("Memory or Strategy") missed the SLASH form.
- **MEDIUM (MEMS-2 free-form key) — RESOLVED.** Free-form entries keyed by the
  full normalized assertion; acceptance tests the non-merge.
- **LOW (MEMS-1 reinforcedAt; STR-4 §c-edit→Memory) — RESOLVED.**
- **LOW (challenge records) — non-blocking**, as expected (r1/r2 on disk).

## New finding (fixed in the change recording r4)
- **[high] APR-3 slash-form dual home.** `apr-approval-inbox.yaml` proposed
  recurring edit patterns as "**Strategy/Memory rules**" — the same dual-home
  ambiguity DEC-22 eliminated, in a third live P0 artifact. Every governing
  artifact routes APR-3's rules to Memory as the single store (MEMS-1; MEMS-3
  names APR-3's own "max 200 chars on X" as a Memory styleRule; PIPE-1 v2 "a
  Ready edit (APR-3) … land in the same store"; STR-4 v2 "not a StrategyDoc
  diff"), so the phrasing invited a silent single-source violation. The
  challenger's own exhaustive sweep confirmed APR-3 was the SOLE remaining live
  remainder. Fixed: APR-3 → v2 (decided-by DEC-22, added to DEC-22 binds),
  reworded to "Memory styleRules/taboos (surfaced in the Strategy's org-rules
  view)"; G-2/G-3 coverage re-affirmed; a multi-variant sweep (word / slash /
  "and" forms) confirmed zero live remainders.

VERDICT: fail (one surviving high — APR-3, the last dual-home artifact, in a
slash-form variant; fixed and re-verified in r4).
