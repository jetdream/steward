---
kind: challenge-record
spec: .spec/specs/bil-billing.yaml
round: 2
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (delta-scoped re-challenge — verified each r1 fix against live text + attacked the changed sections fresh; lint green 0/0)
---

VERDICT: pass

SPEC: .spec/specs/bil-billing.yaml (BILS-1..3, draft)

## Prior-finding verification (r1: 1 high + 1 medium + 2 lows)

- [r1 HIGH — cancel mis-attributed to AUT-3] FIXED and verified.
  - BILS-2 now models cancel as a DISTINCT ACCOUNT-LEVEL publishing stop gated on
    Subscription status (DM-11), durable against an AUT-3 un-pause, reversed only
    by re-subscribe (statement + acceptance both assert "stays stopped through any
    AUT-3 un-pause and resumes only on re-subscribe").
  - The AUT-3 mis-attribution is gone EVERYWHERE in BIL: every AUT-3 mention
    (intent l.12, design l.26, BILS-2 l.79/l.93) now frames it as "distinct
    from / NOT the reversible AUT-3 pause." No residual "via the AUT-3 halt."
  - The missing publisher gate was genuinely ADDED: PUBS-1 bumped v1->v2 —
    "Publishing additionally requires an ACTIVE Subscription (DM-11): a cancelled
    or lapsed org does NOT publish (the BILS-2 account-level stop — DISTINCT from
    and durable against the reversible AUT-3 pause; ... reversed only by
    re-subscribe, and holds through grace per EXP-34)", with an acceptance clause.
    Content matches BILS-2 in meaning. PUB-1 coverage re-pinned against PUBS-1@2
    (no stale pin; lint green). BILS constrained-by += ARC-18; depends-on now
    [PUBS, NWSS]; AUTS correctly dropped.
  - EXP-34 grace consistency HELD: EXP-34 "publishing unaffected during grace"
    reconciles with the gate via PUBS-1's explicit "holds through grace per
    EXP-34" — grace counts as still-publishing; only cancelled/lapsed (past-grace)
    is gated off. No contradiction. The active/grace/lapsed distinction rides on
    DM-11 status (Stripe statuses; "field lists live in @shared types") — acceptable
    under-specification, not a new high.

- [r1 MEDIUM — "articles included" miscited to DEC-10] PARTIALLY fixed — see
  MEDIUM-1 below. design (l.27) and BILS-2 (l.81) now correctly cite EXP-35, but
  the interfaces exportData clause (l.53) still cites DEC-10.

- [r1 LOW — refund-record location unnamed] FIXED. The data section now names a
  distinct refund event/field on the Subscription (DM-11), distinguishable from an
  ordinary post-window cancel, so the G-1 refund-rate metric is queryable.

- [r1 LOW — EXP-35 vs trichotomy phrasing] Untouched by the fix; still an
  EXP-35-side reconciliation, not a BILS defect. Not disturbed.

## Fresh attack on the changed sections

- Grace vs immediate-stop: BILS-2 "publishing STOPS immediately" on cancel is a
  DIFFERENT event from EXP-34's payment-failure grace — no conflict.
- Reversal path: BILS-2 and PUBS-1 both say "reversed only by re-subscribe" and
  both assert an AUT-3 un-pause does NOT resume a cancelled org — internally
  consistent, no new contradiction.
- SEC-8/NWSS-1 410 trichotomy in BILS-2 unchanged and still conformant.

## FINDINGS

- [medium] interfaces (l.53) `exportData(org) -> org data incl. articles (DEC-10)`
  still miscites DEC-10 for "articles included in export" — the exact r1 defect,
  fixed in design + BILS-2 but missed here. Survives scrutiny: DEC-10 binds
  Q-8/Q-10/Q-11 (news-page URL strategy / theming / URL afterlife) and decides
  NOTHING about export contents; the "articles are included in the export" scope
  comes from EXP-35. DEC-10 now appears exactly ONCE in the whole spec, and it is
  on the wrong clause — there is no URL-afterlife/410 clause in BIL that cites
  DEC-10 (the 410 clauses cite SEC-8/NWSS-1), so a trace-follower on interfaces
  lands on the wrong decision. One-line fix: change "(DEC-10)" to "(EXP-35)" on
  the exportData line (matching design l.27 and BILS-2 l.81), or drop it.

- [medium] Collateral of the HIGH fix, in the PUB spec (not BIL's text): PUBS-1
  was bumped v1->v2 adding the account-Subscription gate, but the PUB spec remains
  status: approved with its challenge block pointing at r1 — a pass that never saw
  this gate. Per the change protocol (B1: a semantic v-bump regresses the spec to
  draft until re-approved; B2 design gate), PUBS should re-affirm/re-challenge for
  the v2 gate. The lint does not catch this (the requirement was re-pinned @2 so
  there is no stale pin, and no rule regresses status on an item bump), so it is a
  silent gate-bypass class. This does NOT block BIL's TEXT (which is fully
  conformant and whose gate content this round substantively reviewed and found
  correct), but because BIL depends-on PUBS and the gate is the load-bearing
  element of BIL-2, BIL's own flip to approved should wait until the PUBS v2 gate
  is ratified. Fix: regress PUBS to draft and record a PUB re-affirmation/
  re-challenge covering PUBS-1 v2 before either spec is approved.

## Verdict rationale

The r1 high is genuinely resolved: cancel is respecified as a durable
account-level Subscription-status stop, the AUT-3 mis-attribution is gone
throughout, and the previously-missing publisher gate now exists in PUBS-1 v2 with
content matching BILS-2 and consistent with EXP-34 grace. No high survives on
BIL's design/behavior/conformance. Two mediums remain — a one-line citation fix
(DEC-10 -> EXP-35 in interfaces) and a process action (re-affirm PUBS for its v2
gate) — neither a defect in BIL's design; per the convergence rule they accompany
a pass, to be landed in the same change that records this verdict (the PUBS
re-affirmation must precede BIL's approval flip).
