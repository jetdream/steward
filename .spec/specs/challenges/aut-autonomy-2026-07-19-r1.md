---
kind: challenge-record
spec: .spec/specs/aut-autonomy.yaml
round: 1
date: 2026-07-19
verdict: fail
by: Architect Challenger (design-conformance + implementation-divergence + hidden-assumptions + cross-cutting reconciliation lenses)
---

VERDICT: fail

SPEC: .spec/specs/aut-autonomy.yaml (AUTS-1..3, draft)

## What was attacked and held

- **Guardrail-override ordering (AUTS-1 vs PIPE-2/MEMS-3/GR-3/GR-8).** Verified the
  backstop genuinely precedes autonomy: the VAL stage (PIPE-2) escalates GR-3/GR-8
  drafts to the founder BEFORE anything enters Ready, and a held draft is not "clean",
  so canAutoPublish=false is consistent and belt-and-suspenders. HELD.
- **Auto-approve vs DM-5.** DM-5 already carries `draft --> approved : founder
  approves / TL permits (AUT-1)`, so TL1 auto-approval is not a new transition and does
  not contradict APRS-1's "founder approves" spine. HELD.
- **AUTS-2 threshold + permanent caps vs EXT-3/SEC-5/AUT-2.** Counts (>=10 consecutive,
  <10% edit, >=3 weeks), offered-never-taken, auto-demote-only-downward, and the
  Fundraising-Asks/External TL1 caps all match AUT-2, EXT-3, and SEC-5. HELD.
- **AUTS-3 kill switch vs PUBS-1 + DM-5 paused.** Global/per-channel pause maps to
  DM-5 scheduled->paused, resume paused->scheduled; PUBS-1 and DM-5 agree; the "single
  gate that halts the publisher" reading covers a pending item that schedules mid-kill
  (the publish action itself is gated). HELD.
- **DM-5 annotation for the pending-hold veto (the pre-scheduling recall path).** The
  veto = approved->draft recall is valid only while pending (DM-5 invariant 2: no recall
  once scheduled); AUTS-1 keeps the veto inside the pending window and schedules only
  after — internally coherent with DM-5. HELD.

## FINDINGS

- [high] **DEC-26's claimed APRS reconciliation is unmet — APRS-1 (approved, v1, untouched
  by this change) still describes the veto window under the REJECTED reading.** DEC-26
  resolves AUT-1's ambiguity to HOLD-THEN-PUBLISH: the veto window IS the *pending* phase,
  the veto IS the approved->draft recall during pending, and scheduling/publishing happen
  only AFTER the unvetoed 24h. But live APRS-1 says at TL1 the category "auto-publishes
  WITHOUT the founder acting and opens a 24h VETO WINDOW (the veto window is the
  consequence of TL1 auto-publish)", and places the window in the *scheduled* stage:
  "once a variant is SCHEDULED ... reversal is ... under TL1, the 24h veto window (AUT-1)"
  and acceptance "the 24h veto window follows auto-publish". Under AUTS-1 the window is
  CLOSED by the time an item is scheduled (scheduling is the end of the window), so a
  scheduled-stage veto window cannot exist. This is a direct spec-vs-spec contradiction on
  the exact mechanic DEC-26 exists to make definite — it survives because the uncommitted
  change (data-model + decisions + registry + new AUTS) never cascaded to
  apr-approval-inbox.yaml (LRN-19 straggler; SDLC B4 cascade / B5 contradiction unmet). —
  Fix: bump APRS-1 to v2 (decided-by DEC-26) so it states the veto window is the pending
  hold and the recall-during-pending IS the veto, publish only after the unvetoed window;
  remove the "auto-publishes ... opens a veto window / follows auto-publish" and
  "once SCHEDULED ... the 24h veto window" framing. Land it in the same change.

- [high] **The veto (approved->draft recall) does not prevent TL1 re-auto-approval — a
  vetoed post can silently re-publish.** AUTS-1 equates the founder's veto WITH the DM-5
  recall and says nothing more. At TL1 the autonomy gate auto-approves clean drafts;
  canAutoPublish(org, draft) is defined as level+cleanliness only, with no "once vetoed,
  do not re-auto-approve" rule and no founder-intervention latch. A reasonable
  re-evaluating/polling implementation therefore re-auto-approves the just-recalled clean
  draft, re-opens the window, and eventually publishes exactly what the founder vetoed —
  invisible in review, contradicting DEC-26's "nothing questionable ever reaches the
  public" and VAL-3. This is the core safety mechanic the spec pins "so PUB/APR/DM-5
  reconcile against a definite behavior", yet it is left ambiguous. — Fix: specify that a
  recall/veto during the TL1 window hands the item to founder control (not re-auto-
  approved) — e.g. canAutoPublish=false for a founder-recalled item, or the veto routes to
  skipped/founder-managed — with an acceptance clause that a vetoed item never auto-publishes.

- [medium] **PUBS-1's veto-window open-question is stale — DEC-26 claims to resolve it but
  the live text still frames it as open and deferred.** DEC-26: "resolves the PUBS-1
  veto-window open-question." PUBS-1 (untouched) still carries: "The AUT-1 TL1 veto-window
  mechanics — whether a scheduled variant is HELD ... or auto-published then TAKEN DOWN ...
  is there a veto-hold state, or is it the AUT-3 pause during the window? ... belong to the
  future AUT spec." AUTS-1 now answers all of it (pending hold; veto = recall; no new state;
  NOT the AUT-3 pause). A PUB reader sees a resolved question presented as open. — Fix:
  update/remove PUBS-1 open-question #1 to point at AUTS-1 as resolved, in the same change.

- [low] **"No new data-model state" is true for the state machine but hides an implied
  timestamp field.** AUTS-1/data assert "No new entity" and "No new data-model state — the
  pending phase IS the veto window" (correct: no new enum value). But vetoWindowFor(item)
  and "after 24h unvetoed it schedules" require a window-start/auto-approved-at anchor to
  compute elapse; pending does not naturally block (at TL0 the scheduler moves
  pending->scheduled), so the 24h is an active timed hold, not inertia. Field-level detail
  sits below data-model.yaml's "diagrams + meaning only" altitude, but the spec should name
  the anchor so implementers don't assume "no new field". — Fix: in `data`, note the window
  is anchored on the auto-approval timestamp (reuse the editorial-transition audit time if
  it exists; otherwise a windowOpenedAt field), no new state/entity.

Scope note: TL1 does not ship in P1b (TL0 + kill switch only), so findings 1-2 are not
P1b *runtime* bugs — but the spec is being approved as authoritative and DEC-26's entire
rationale is to pin definite semantics NOW so the consumer specs reconcile. A green graph
with a live AUTS-1<->APRS-1 contradiction on the pinned mechanic defeats that purpose;
the approval gate is precisely a doc-integrity gate. Two surviving highs force fail.
