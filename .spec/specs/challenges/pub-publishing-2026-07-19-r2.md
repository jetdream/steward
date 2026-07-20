---
kind: challenge-record
spec: .spec/specs/pub-publishing.yaml
round: 2
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (delta re-challenge — PUBS-1 v1->v2 active-Subscription gate only)
---

# PUB (Publishing) — challenge record, round 2 (delta-scoped)

Re-challenge scoped to the ONE new behavior in PUBS-1 v2: the account-level
active-Subscription publishing gate added to close the BIL->PUB gap. Verified
against DM-11 (Subscription), BILS-2 (cancel = durable account-level stop),
AUTS-1/AUT-3 (reversible pause), and EXP-34 (payment-failure grace). docs-check
graph green (0 errors / 0 warnings); no stale pins (DM-11 v1, EXP-34 v1, AUT-3 v1
all current). r1 findings were not disturbed by the v2 edit and are not
re-litigated.

## What held (delta)

- **Distinction from AUT-3 — HELD.** "DISTINCT from and durable against the
  reversible AUT-3 pause; reversed only by re-subscribe" matches BILS-2 v1
  verbatim in meaning and AUTS-1 (pause = DM-5 scheduled<->paused, reversible).
  An un-pause does not resume a cancelled org. Clean, consistent, correct.
- **Additivity with the rest of PUBS-1 — HELD.** The subscription gate is an
  additional AND-condition on top of the connection gate / official-API /
  scheduling; it neither loosens nor contradicts them. PUBS-3 (log) is unaffected
  (a non-publishing org emits no entries). No new cross-item inconsistency in
  PUBS-2/3/4.
- **Cancel path — HELD.** A cancelled org (inactive Subscription) does not
  publish, restored only by re-subscribe — faithful to BILS-2 and DM-11.

## Surviving findings

- [high] **The EXP-34 grace reconciliation is broken on its plain reading and has
  no acceptance coverage.** EXP-34 states unambiguously that during a
  payment-failure grace period "publishing [is] unaffected." PUBS-1 v2 says a
  gate "requires an ACTIVE Subscription ... a cancelled or lapsed org does NOT
  publish (... it is gated on subscription status and reversed only by
  re-subscribe, and **holds through grace** per EXP-34)." The parallel-predicate
  grammar binds the subject of "holds" to "the BILS-2 account-level stop" — so
  the plain reading is "the STOP holds through grace," i.e. publishing is blocked
  during grace, the exact opposite of EXP-34. Why it survives: (1) the dominant
  grammatical reading directly contradicts a cited constraint on the same
  decision; (2) the two readings produce OPPOSITE runtime behavior for a common
  scenario (card decline -> grace) — a paying-but-past_due org either keeps
  service or is cut off; (3) the ACCEPTANCE clause tests only
  "cancelled/lapsed org (inactive Subscription) does not publish" with NO grace
  carve-out and actively reinforces the wrong reading — so an implementer who
  maps grace/past_due to "not active" blocks a grace-period org, violating
  EXP-34, and no test would catch it (invisible in review, altitude rule);
  (4) DM-11 (v1, "Stripe linkage" only) defines no status vocabulary
  (active / past_due-grace / cancelled / lapsed) to disambiguate. Fix: split the
  gate explicitly — cancelled OR grace-EXPIRED (lapsed) => no publish (durable,
  re-subscribe only); payment-failure GRACE => still publishes, unaffected
  (EXP-34) — and add an acceptance clause: "an org in payment-failure grace
  continues to publish; only after grace expires does it stop."

- [medium] **EXP-34 is cited as the governing authority for grace behavior but is
  missing from constrained-by.** PUBS-1 v2 pins its grace behavior "per EXP-34,"
  making EXP-34's grace semantics a behavioral constraint on the publisher's
  gate, yet PUBS constrained-by (v2 added DM-11 but not EXP-34) omits it. BILS
  already carries EXP-34 in its constrained-by as precedent. Fix: add EXP-34 to
  PUBS constrained-by. (Lint cannot catch this — EXP-34 resolves as a valid
  reference regardless.)

- [low] **DM-11 defines no subscription-status enum.** Both PUBS-1 v2 and BILS-2
  gate on "active / cancelled / lapsed" (and now "grace") status, but DM-11 v1 is
  only "Stripe linkage (BIL-1)." The status vocabulary the gate depends on is
  undocumented in the data model; this is what enables the high above. Not
  blocking on its own (Stripe defines statuses; @shared types hold shapes), but a
  one-line DM-11 note enumerating the states the gate switches on would remove
  the ambiguity at the source.

## Verdict

The v2 cancel/AUT-3-distinction gate is sound, but the specific reconciliation the
edit claims to achieve — with EXP-34's "publishing unaffected during grace" —
is not achieved: the plain reading of "the account-level stop ... holds through
grace" contradicts EXP-34, and the acceptance provides no grace test to
disambiguate. A surviving high forces fail; PUB stays in draft and may not return
to approved at v2 until the grace behavior is disambiguated with an acceptance
criterion (and EXP-34 added to constrained-by).

VERDICT: fail
