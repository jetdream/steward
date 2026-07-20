---
kind: challenge-record
spec: .spec/specs/pub-publishing.yaml
round: 3
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (delta re-challenge — PUBS-1 v2 grace-period reconciliation fix)
---

# PUB (Publishing) — challenge record, round 3 (delta-scoped)

Re-challenge scoped to the r2 grace-period fix on the PUBS-1 v2 subscription
gate. Each prior finding's fix verified against live text; the changed sections
re-attacked fresh. docs-check graph green (457 IDs, 5270 refs, 0 errors / 0
warnings; the coverage/goal-rollup lines are informational, not errors). No
stale-pin cascade from the DM-11 v1->v2 bump — no site pins DM-11 by version
(only the exempt r2 record mentions it). r1 and the passed r2 items
(cancel-path / AUT-3 distinction) are not re-litigated.

## Prior findings — fixes verified

- **[HIGH r2 — grace reconciliation] RESOLVED.** The ambiguous "the account-level
  stop ... holds through grace" wording is GONE. PUBS-1 v2 now states grace as
  PUBLISHING-ELIGIBLE explicitly: "in a PUBLISHING-ELIGIBLE status — ACTIVE, or
  within the payment-failure GRACE period (publishing is UNAFFECTED during grace,
  EXP-34). A CANCELLED or grace-EXPIRED (lapsed) org does NOT publish — the BILS-2
  account-level stop ... reversed ONLY by re-subscribe." Grace-continues is now
  the dominant and only reading, matching EXP-34 ("publishing unaffected during
  grace") verbatim in meaning; cancelled/lapsed still stops per BILS-2 (durable,
  distinct from the reversible AUT-3 pause). Acceptance now carries the missing
  grace test: "a payment-failure GRACE-period org CONTINUES to publish (EXP-34);
  only a CANCELLED or post-grace-LAPSED org stops publishing, restored only by
  re-subscribe (not an un-pause)." The invisible-in-review failure mode (an
  implementer mapping grace->not-active) is now caught by a failing acceptance
  clause. High fully resolved.

- **[MEDIUM r2 — EXP-34 missing from constrained-by] RESOLVED.** EXP-34 present in
  PUBS constrained-by (line 31). EXP-34 is a valid experience-spine flow element
  (kind: flow), a legitimate design-element citation.

- **[LOW r2 — DM-11 no status vocabulary] RESOLVED.** DM-11 bumped to v2 with the
  status enum: "PUBLISHING-ELIGIBLE = active OR grace (payment-failure grace,
  publishing unaffected — EXP-34); NOT eligible = lapsed (grace expired) OR
  cancelled (the durable BILS-2 stop, reversed only by re-subscribe)." PUBS-1 and
  BILS-2 switch on exactly this vocabulary; BIL data section (lines 40-42) and
  BILS-2 are aligned to "PUBLISHING-ELIGIBLE". No cross-artifact drift.

## Fresh attack on the changed sections — nothing survived

- DM-11 v2 vs PUBS-1 v2 vs BILS-2 vs BIL data section: all four use the same
  eligible=active|grace / not-eligible=lapsed|cancelled partition. No collision,
  no contradiction.
- DM-11 v1->v2 is an additive architecture (data-entity) change: no HITL/decided-by
  requirement (not a requirement/goal/value/guardrail layer), no stale pins, graph
  green.
- grace->lapsed transition ownership sits with BIL/Stripe, referenced not
  restated — consistent with the r1-accepted cross-spec scoping posture. Not a
  hidden assumption smuggled into PUB.
- BILS-2 "on cancel publishing STOPS immediately" does not conflict with grace:
  cancel and payment-failure are distinct paths, both handled.

## Verdict

The r2 high is genuinely resolved — grace-continues-to-publish is now the sole
reading and is backed by an acceptance criterion that would fail on the wrong
implementation; the medium and low are closed. No surviving finding. PUB may
return to approved at v2.

VERDICT: pass
