---
kind: challenge-record
spec: .spec/specs/aut-autonomy.yaml
round: 2
date: 2026-07-19
verdict: fail
by: Architect Challenger (delta re-challenge — prior-fix verification + changed-section attack + spine/DS/vision coherence sweep)
---

VERDICT: fail

SPEC: .spec/specs/aut-autonomy.yaml (AUTS-1..3, draft)

## Governing decision verified

DEC-26 (decisions.yaml) is revised as described: the TL1 veto model is a
FOUNDER-OPERATOR setting, DEFAULT publish-then-takedown (the approved EXP-26/DS-5/
vision.md #8 design, no spine reversal), opt-in hold-then-publish; a veto/pull in
either model hands the item to founder control and is NEVER re-auto-approved; it
explicitly "Corrects this decision's initial hold-then-publish-only framing."

## Prior r1 findings — all fixes verified real

- [r1 HIGH-1 APRS<->AUTS contradiction] FIXED. APRS-1 is v2: founder-selectable
  default publish-then-takedown / opt-in hold-then-publish; the rejected "once a
  variant is SCHEDULED ... the 24h veto window" framing is gone — undo scope now
  follows DM-5 exactly (pending recall; scheduled -> pause/kill; published under
  default TL1 -> the 24h pull). Agrees with AUTS-1 and with EXP-26/DS-5. No new
  contradiction introduced.
- [r1 HIGH-2 vetoed re-auto-approves] FIXED and unambiguous in BOTH modes: AUTS-1
  ("recorded as vetoed and NEVER re-auto-approved by a later run; canAutoPublish
  returns false for a vetoed item; a re-evaluating/polling implementation must not
  resurrect it"), interfaces (canAutoPublish ALWAYS false when vetoed), data
  (durable vetoed marker). Acceptance clause present.
- [r1 MEDIUM PUBS-1 stale open-question] FIXED. PUBS-1 open-question #1 now reads
  "RESOLVED (DEC-26, AUTS-1) ..." and no longer presents the mechanic as open.
- [r1 LOW timestamp anchor] FIXED. AUTS data + AUTS-1 name a window-open anchor
  timestamp (reuse the auto-approval/publish audit time, else windowOpenedAt), no
  new state/entity.
- [DM-5 annotation scope] CORRECT. data-model.yaml line 111 scopes the pending-hold
  to the OPT-IN model only ("under the opt-in hold-then-publish veto model the
  pending phase first holds the 24h window"); the default is not misrepresented.

## Coherence sweep (spine / DS / vision) — held

EXP-26 ("Published — you can stop it until Thu 6pm", publish-then-takedown), the
DS-5 veto-window card class ("published — veto until <time>"), glossary Trust
Level / Veto window, and vision.md #8 all describe the DEFAULT publish-then-takedown
— they match AUTS-1's default with NO change required; the opt-in hold-then-publish
card is correctly deferred P2 (AUTS-1 open-question). GR-3/GR-8 backstop preserved
in AUTS-1 / design / interfaces (canAutoPublish false on a GR-3/GR-8 hold at any
level and veto model). No residual contradiction in the consumer specs or the spine.

## FINDING

- [high] **The spec's own `intent` field (line 7) still pins the REJECTED reading —
  "the TL1 veto window pinned to HOLD-THEN-PUBLISH (DEC-26)" — the exact
  hold-then-publish-only framing DEC-26 was revised to correct.** Every normative
  part of the spec (items AUTS-1, design, data, interfaces, open-questions) was
  updated to founder-selectable DEFAULT publish-then-takedown, but the intent
  header was not cascaded (an LRN-19 straggler, the same class r1 caught in
  APRS-1). It survives scrutiny because it is a live, self-contradicting statement
  on the load-bearing mechanic: the intent asserts the veto model is "pinned to
  hold-then-publish" and cites DEC-26 for it, while DEC-26 now says default
  publish-then-takedown and AUTS-1/EXP-26/DS-5/vision.md #8 all say
  publish-then-takedown. An agent or human reading the intent to form the mental
  model of this spec gets the rejected default — the very reading that contradicts
  the approved product design. Approving the spec as authoritative with its summary
  asserting the opposite of its items and its governing decision defeats DEC-26's
  purpose (pin ONE definite semantics now). Refutation attempted (intent is
  descriptive, not an `implements`-bearing element, and consumer specs reconcile
  against AUTS-1 not the intent line) and rejected: the approval gate is a
  doc-integrity gate, and r1 treated exactly this contradiction class on exactly
  this mechanic as a high. — Fix (one line): replace "with the TL1 veto window
  pinned to HOLD-THEN-PUBLISH (DEC-26)" with the founder-selectable framing, e.g.
  "with the TL1 veto model a founder-operator setting, default publish-then-takedown
  (DEC-26)", matching AUTS-1 / DEC-26. Land it in the same change and this converges
  to pass (no other high survives).
