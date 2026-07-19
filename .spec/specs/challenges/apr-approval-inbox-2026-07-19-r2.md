---
kind: challenge-record
spec: .spec/specs/apr-approval-inbox.yaml
round: 2
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (delta re-challenge — verify r1 fixes + fresh attack on changed sections; cross-cutting reconciliation lens)
---

# Challenge record — APR (Approval surface / Ready & Composer), APRS-1..6, round 2 (delta)

Delta-scoped re-challenge of the four r1 findings and the sections they touched
(APRS-1 undo scope + veto attribution; APRS-5 + interfaces + design composer
ownership; GR-8 in APRS-5). Weaponized DM-5's two state machines + invariant 2,
AUT-1/AUT-3, PIPE-2's sequence, the ARC container graph, and LRN-22 ownership.

## r1 fixes verified — all real

- **[HIGH r1-1 — undo scope vs DM-5] RESOLVED.** APRS-1 now scopes recall to the
  DM-5 lifecycle exactly: while a variant is PENDING (approved, not scheduled) the
  item recalls in place (editorial `approved --> draft`, whose DM-5 guard is
  "recalled before any variant is scheduled"); once any variant is SCHEDULED there
  is no `approved --> draft` recall — a recall then would leave a scheduled variant
  on a non-approved item, violating DM-5 invariant (2), correctly cited. Reversal
  once scheduled = `scheduled --> paused` (AUT-3 kill/per-channel pause, matches the
  DM-5 delivery arc) and, under TL1, the 24h veto (AUT-1). The per-variant "any
  variant scheduled" phrasing matches DM-5's per-destination delivery granularity.
  Acceptance clause added and testable. The false "until it publishes" window is gone.
- **[MEDIUM r1-2 — composer VAL ownership] RESOLVED in meaning, one grounding gap
  fixed in-change (below).** APRS-5/interfaces/design now say the composer SURFACE
  (ARC-17) hands the founder master to the CONTENT ENGINE (ARC-15), which runs
  GENS-2 adapt + PIPE-2 VAL + GENS-5 fit, yielding a draft ContentItem in Ready — an
  alternate ENTRY to the same chain, no APR-side pipeline (LRN-22). This is an honest
  reading: DM-5 already admits `composed (APR-5)` into the `draft` editorial
  lifecycle, and PIPE-2's GEN(adapt)->VAL->FIT stages are reused, so the
  "no authorship bypass" guardrail guarantee rests on approved artifacts, not on
  spec prose alone. "Alternate entry to the generator" does NOT require a PIPE-2
  diagram rewrite to be truthful — the guarantee is carried by DM-5's composed-item
  admission + PIPE-2's stage reuse, both approved. Drawing the composer entry into
  PIPE-2's sequence and the APR->content-engine edge into the ARC-2 container graph
  (which today shows only GENB->APRB, APRB->PUBB) remains a legitimate
  architecture-layer completeness follow-up — see [low] below — but it is diagram
  completeness, not correctness, so it does not block the spec.
- **[LOW r1-3 — veto attribution] RESOLVED.** APRS-1 now attributes the 24h veto to
  TL1 auto-publish ("the consequence of TL1 auto-publish, not of the Approve tap"),
  matching AUT-1 (TL1 = auto-publish with 24h veto).
- **[LOW r1-4 — GR-8 in example] RESOLVED.** APRS-5's example list now names "a
  Memory taboo (GR-8)" alongside GR-1/GR-2/GR-3/GR-5; consistent with GR-8
  (stated-correction/taboo enforcement) and governed-by [GR-8].

## Fresh findings on the changed sections

- **[MEDIUM — FIXED IN-CHANGE] constrained-by omitted ARC-15.** The fix made ARC-15
  (Content Engine) the load-bearing owner of the composer's core guarantee and cites
  it ~6x plus "LRN-22 ownership", yet ARC-15 was absent from `constrained-by` while
  ARC-17 (the APR component) was present — an incomplete design-artifact citation
  (lint checks validity, not completeness, so the graph stayed green at 0 errors).
  Fix applied forward this round: added ARC-15 to `constrained-by`; docs-check
  re-run clean (0 errors). One-line fix, no behavior change — accompanies the pass
  per the convergence rule.
- **[LOW — architecture follow-up, non-blocking] Composer entry not drawn in the
  cross-cutting diagrams.** The ARC-2 container graph (overview.yaml) draws
  GENB->APRB, APRB->PUBB with no APR->content-engine back-edge, and PIPE-2's sequence
  starts at the Planner with no composer entry. The spec's guarantee is honest today
  (grounded on DM-5 + PIPE-2 stage reuse), so this is architecture-layer completeness,
  not a spec defect — flag as a follow-up on overview.yaml / llm-pipeline.yaml.
- **[LOW — nit] Altitude-mixed citation for the same steps.** The `design` section
  cites GEN-2/GEN-5/GEN-3 (requirement IDs) while `interfaces` and APRS-5 cite
  GENS-2/GENS-5 (spec-element IDs) for the identical adapt/fit steps. Both resolve
  and the split is arguably intentional (design at requirement altitude), so it does
  not block; align for consistency if touched.

None of the r1-passed checks (composer no-bypass guarantee, MEMS-1 channel
enumeration, guided-Adjust ownership, batch-approve exclusions) were disturbed by
the fixes. No surviving high. Mediums are one-line (one already applied); lows are
improvement/follow-up notes.

VERDICT: pass
