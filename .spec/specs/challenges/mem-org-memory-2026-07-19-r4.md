---
kind: challenge-record
spec: .spec/specs/mem-org-memory.yaml
round: 4
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (delta-scoped closure — APR-3 fix + independent exhaustive dual-home sweep + fresh high check)
---

# MEM spec — round 4 (closure)

Final gate verification. The APR-3 fix is confirmed and the dual-home
propagation is provably complete.

## Verification

- **APR-3 fix — RESOLVED.** v2, `decided-by: DEC-22`, reworded to "Memory
  styleRules/taboos (surfaced in the Strategy's org-rules view — DEC-22,
  MEMS-1)"; in DEC-22 `binds`; G-2/G-3 coverage re-pinned APR-3@2 (with
  CHT-2@2, STR-4@2); consistent with MEMS-1 / MEMS-3 / PIPE-1 v2 / STR-4 v2 /
  CHT-2 v2. Graph 366 IDs / 0 errors / 0 warnings, no stale pins.
- **Exhaustive dual-home sweep — CLEAN (zero live remainders).** Four
  independent sweeps (word / slash / "and" / store forms + cross-line windows +
  broad co-occurrence). Every live hit resolves to correct single-source /
  "rendered VIEW" / "projects it" phrasing (PIPE-1, spine.yaml, glossary
  Redirect, STR-4 v2, the MEMS spec). Excluded correctly: DEC-22's own
  old-state description + rejected alternative, superseded ui.yaml, historical
  challenges/*. `vision.md:76` examined and cleared (non-normative narrative of
  the founder experience, consistent with the §c-view + immediate-bind, not a
  competing storage claim).
- **Prior-resolved items — HELD (no r3→r4 regression):** MEMS-3
  honest-determinism + GR-8 backstop; MEMS-6 deterministic key + bias-to-ask;
  MEMS-2 free-form assertion key + bias-to-not-merge + BIL-2/SEC-4;
  MEMS-1/MEMS-5 rule-vs-fact split.
- **Fresh high check** across MEMS-1..6 + the reconciliation (PIPE-1/2 v2,
  GR-8, STR-4 v2, CHT-2 v2, APR-3 v2): none survived — design-violation,
  false-scope, hidden-assumptions, untestable-acceptance, and altitude all
  held.

## Convergence summary (r1→r4)
r1 panel (2 fail) surfaced the taboo-enforcement architecture gap + the
determinism overclaim + the embedding false-match → resolved by DEC-21 (GR-8
backstop) and DEC-22 (Memory single source, overlay enforced at VAL) with the
PIPE-1/2 v2, STR-4/CHT-2 v2 cascade and the spec rewrite. r2/r3 caught the
incomplete DEC-22 propagation across phrasing variants (glossary/EXP-19, then
APR-3 slash-form). r4 confirms closure.

No findings; the spec is approval-ready and flips to `approved` with this
record as the passing challenge evidence.

VERDICT: pass
