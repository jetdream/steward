---
kind: challenge-record
spec: experience/{onboarding,home,autonomy,proactive,glass-wall,account,public,ops}.yaml (DEC-28 by-domain split)
round: 1
date: 2026-07-20
verdict: pass
by: cortex:architect-challenger (Product-Designer lens; structural/delta reorg review)
---

# Product-Designer lens — the eight-register by-domain split (DEC-28)

Structural/delta challenge of a CONTENT-PRESERVING reorg: the monolithic EXP
spine (56 elements, ~1000 lines, approved under DEC-18) split by journey domain
into eight registers (XO/XH/XA/XP/XG/XB/XN/XOPS), IDs re-homed EXP-* → domain-*
in tree order, ~46 citing sites re-pointed. Conforms to cortex v0.21.0
method/ui.md "Scaling" (per-domain registers; shared surface homed once,
referenced by ID; don't over-split).

## Verified sound (mutation-and-diff)

- **Content preservation:** all 56 element bodies byte-identical to the
  pre-split spine after the canonical EXP→domain rename; every `kind`, `title`,
  `serves`, `parent` preserved and correctly re-mapped; field-set unchanged; all
  `design/…` path pointers byte-identical. The single differing body (EXP-38 →
  XH-12) is the `EXP-41..46` range correctly expanded to the six explicit
  cross-register IDs (XG-6, XG-7, XG-8, XG-9, XA-6, XH-14). Count 56 → 56.
  (Independently reproduced by the migrator's own byte-compare.)
- **Homed-once (VAL-4):** no two new items share a body hash — nothing copied;
  the home shell (XH) is homed once and referenced by ID.
- **Nesting:** every non-journey's parent is in the same register; screen ∈ flow
  ∈ journey holds with zero mismatches; each register has ≥1 journey root.
- **Cross-register refs:** 0 dangling in-body references; all 56 new IDs resolve.
- **Domain coherence:** DEC-28 placements verified (compose journey/flow/screen
  all in XH; XA-6 Controls nests under XA-5 in-register, referenced by ID from
  XB/XN).
- **Reference completeness:** 0 remaining `EXP-*` outside `specs/challenges/`
  (exempt); per-file citation multiset parity holds for all re-pointed files
  (the only delta, in decisions.yaml, is DEC-28's own `binds` forward-index).

## Findings — all stale prose file-PATH residue (lint-invisible), fixed in this change

The convergence rule was applied: docs-check validates ID edges but not file
paths mentioned in prose, so these three survived a green graph and are resolved
in the same commit that records this verdict.

- **(medium)** `adr/0004-news-site-rendering.md:76` said the successor screens
  XN-3/XN-4 live in `experience/spine.yaml` (deleted) — a self-contradictory
  navigation trap in a governing `constrained-by` ADR. Fixed: path →
  `experience/public.yaml`; dropped the now-false "spans both spines".
- **(low)** `experience/vision-experience-map.md:3` named the deleted
  `spine.yaml` as the live source. Fixed: rephrased to name the eight by-domain
  registers.
- **(low)** `experience/ui.yaml:5` header pointed its supersession chain at the
  now-split `spine.yaml`. Fixed: notes the DEC-28 split and points at
  registry.yaml.

## Verdict

**pass** — no surviving high. The reorg's structural substance (content
preservation, homing, nesting, cross-register edges, domain coherence, all
ID-level reference edges) is impeccable and lint-green; the three findings were
one-line stale-path fixes applied in this change. The eight registers stand
`approved`.
