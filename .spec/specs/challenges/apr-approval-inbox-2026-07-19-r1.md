---
kind: challenge-record
spec: .spec/specs/apr-approval-inbox.yaml
round: 1
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (single challenger, all four lenses — design-conformance / implementation-divergence / cheaper-alternative+hidden-assumptions / cross-cutting reconciliation)
---

# Challenge record — APR (Approval surface / Ready & Composer), APRS-1..6, round 1

Weaponized: LRN-22 (data model is the tiebreaker on flow/ownership vs approved
architecture), LRN-20 (honest deterministic/probabilistic split), LRN-19 (sweep
all phrasing variants), DEC-22 (Memory single source).

## What was attacked and held

- **KEY CLAIM — composer routes founder-authored content through the SAME VAL
  chain (APRS-5, "authorship is not a bypass").** HELD as a guardrail claim.
  DM-5 explicitly admits composed items into the same lifecycle
  (`[*] --> draft : generated (GEN-1) or composed (APR-5)`); PIPE-2's VAL is a
  general stage; the spec routes compose() through GENS-2 adaptation + PIPE-2
  VAL before PUB-1 and exposes NO direct-publish side channel. This is not a
  CHTS-1-style ungated hole — the spec affirmatively closes it. (But see M1: the
  path is spec-asserted, not drawn in the approved architecture.)
- MEMS-1 v2 DOES enumerate APR inline-edit / rejection / skip-reason and APR-3
  as explicit correction channels — APRS-3's write path is grounded, no straggler.
- Inline Edit (raw, APR-1) vs guided Adjust (CHT-5) — ownership is clean and
  cross-referenced both ways (CHTS-5 names APR-1's raw edit; APRS-1 names CHT-5's
  Adjust). No double-claim.
- AUT-1 v2 text (TL0 approve-everything / TL1 auto-publish + 24h veto / TL2
  autopilot) matches APRS-1 and the design section.
- GENS-3 picture gate at awaiting_picture->approved is reused faithfully by
  APRS-5 ("a composed post with no picture cannot be approved for scheduling").
- "Holds never batch-cleared" is correctly attributed to DEC-18(b) ("holds and
  failures are PINNED, never batch-cleared") and consistent with EXP-16's batch
  exclusion; the deterministic pinned/blocked FILTER is an honest LRN-20 split
  (the filter is deterministic; the upstream flags were set probabilistically).
- DEC-22 single-source honored (APRS-3 writes to Memory, Strategy §c PROJECTS —
  no "Strategy/Memory" dual-home straggler).
- governed-by [GR-1,GR-2,GR-3,GR-5,GR-8] and constrained-by set are appropriate.

## Findings

- **[HIGH] APRS-1 "every approval is undoable in place until it publishes
  (DM-5 approved -> draft recall)" contradicts the cited DM-5 state machine.**
  DM-5 gates the recall transition `approved --> draft` to "recalled BEFORE any
  variant is scheduled", and invariant (2) forbids a scheduled variant on a
  non-approved item. But delivery is `pending -> scheduled -> published` with a
  real time gap between scheduled and published. APRS-1 claims the recall is
  available across that whole window ("until it publishes") and names ONLY the
  recall mechanism — so an implementer following the spec literally would permit
  recall-to-draft on an already-scheduled variant, breaking a DM-5 invariant;
  one following DM-5 under-delivers the promise. LRN-22 makes the data model the
  tiebreaker. There is no acceptance criterion pinning the undo behavior either.
  Survives scrutiny: the phrase is verbatim from EXP-16 (an approved constrained-by
  artifact), but EXP-16 names no mechanism — it is APRS-1's own parenthetical that
  falsely binds "until publish" to the pre-schedule-only recall transition. FIX:
  scope recall to the pending window (DM-5 approved->draft, before any variant is
  scheduled); state that once scheduled the reversal is per-channel pause / kill
  switch (AUT-3) and, at TL1, the 24h veto (AUT-1); add an acceptance clause.

- **[MEDIUM] The composer's VAL entry is spec-asserted but not modeled in the
  approved architecture (PIPE-2 / the ARC module graph).** PIPE-2's sequence
  begins at the Planner (generation-only); the ARC map flows GENB->APRB->PUBB
  with no APR->content-engine back-edge, yet APRS interfaces locate compose() in
  @backend/approval (ARC-17) while its adapt+VAL+fit+picture machinery is owned
  by the content engine (ARC-15). The "no authorship bypass" guarantee — the very
  CHTS-1 lesson — therefore rests on spec prose, not on the architecture. FIX
  (converge in-change): either relocate compose() to the content engine (it
  produces a draft ContentItem exactly like generation; Ready merely displays it),
  or add the explicit APR->content-engine dependency AND note the composed-master
  entry into PIPE-2's adapt->VAL->fit chain, so the guarantee is grounded.

- **[LOW] APRS-1 ties the 24h veto window to the manual Approve tap at TL1.**
  Per AUT-1 the veto window is the consequence of TL1 AUTO-publish (the founder
  NOT acting); the auto-publish-without-tap path is (correctly) owned by AUT/PUB,
  not APR. Offering a veto after a manual approve is harmless-conservative, but
  the phrasing slightly misrepresents earned-autonomy semantics. Reword to
  attribute the veto window to TL1 auto-publish, not to the Approve action.

- **[LOW] APRS-5's guardrail example list ("GR-1/GR-2/GR-3/GR-5") omits GR-8.**
  Covered in meaning by "the SAME VAL chain (PIPE-2)" and governed-by [GR-8], but
  a founder-authored post can violate a Memory taboo; naming GR-8 in the example
  makes the taboo-overlay coverage explicit.

VERDICT: fail
