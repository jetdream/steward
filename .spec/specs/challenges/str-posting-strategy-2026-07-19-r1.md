---
kind: challenge-record
spec: .spec/specs/str-posting-strategy.yaml
round: 1
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (single pass, 3 lenses — design-conformance / implementation-divergence / cheaper-alternative + hidden-assumptions)
---

# STR spec — round 1

Single thorough challenger (the cross-cutting enforcement was already reconciled
by the MEM pass, so a full panel was not warranted). One HIGH + four
mediums/lows.

- **[high] DM-3 dual-home residue.** The approved DM-3 (StrategyDoc) still stored
  "sections (a)–(e) versioned with diffs" — section (c) as a persisted store,
  contradicting STRS-1's "(c) is a view" (a DEC-22 straggler the MEM cascade
  missed, expressed as a data-entity definition rather than a "Memory or
  Strategy" phrasing — LRN-19 class). Fixed: DM-3 → v2 (persists a/b/d/e; (c)
  derived view), added to DEC-22 binds.
- **[medium] Position-routed enforcement bypass** — a hard prohibition typed in
  section (a) got soft-only enforcement, bypassing the MEMS-1 classifier /
  MEMS-3 gate / GR-8 backstop. Fixed: STRS-2/STRS-3 route by rule SEMANTICS,
  not by box.
- **[medium] Tighten-only mis-attributed to MEMS-1.** Fixed: pinned on the
  enforcement-time deterministic platform GR check; write-time detection marked
  best-effort.
- **[medium] governed-by omitted the platform guardrails.** Fixed: GR-1..GR-6
  added.
- **[low] EXP-42 diff mismatch** for (c)'s Memory-supersession stream. Fixed.

VERDICT: fail
