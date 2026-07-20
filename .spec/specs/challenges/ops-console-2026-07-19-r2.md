---
kind: challenge-record
spec: .spec/specs/ops-console.yaml
round: 2
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (delta re-challenge — verify r1 fixes + attack changed sections; LRN-20/21/22 weaponized)
---

VERDICT: fail
SPEC: .spec/specs/ops-console.yaml

FINDINGS:

- [high] The cross-cutting change that homes the QA hold silently bypassed the APR
  design gate. APRS-1 was bumped v2 -> v3 with a NEW behavior — "a draft with
  qaStatus = pending-review is WITHHELD from this spine until an operator clears it"
  — which changes what the Ready surface shows (APR's core disposition spine, a P0
  cross-cutting spec). Per the protocol (../CLAUDE.md Phase B step 1 and
  specs/CLAUDE.md lifecycle: "Any semantic change regresses status to draft and
  bumps affected item versions"), APRS should have regressed to draft and been
  delta-re-challenged. Instead apr-approval-inbox.yaml still reads status: approved
  with challenge.verdict: pass pointing at the r2 record — a record that pre-dates
  the v3 content and contains no mention of qaStatus / OPSS / the cohort-1 QA gate
  (grep-confirmed). docs-check stays green (457 IDs, 0 errors): the design-gate lint
  checks challenge-block existence + verdict/name agreement but NOT that the record
  post-dates the latest item version, and status-regression is prose-enforced — so
  this is invisible to the graph, exactly the gate-bypass class. The task asked to
  "confirm the APRS-1 v3 bump did not break APR" — it did: APRS-1 v3 is un-challenged
  and APRS's approved status is now false. Fix: regress APRS to draft, delta-re-
  challenge APRS-1 v3 (its readyStack exclusion), and repoint APRS's challenge block
  — in the same change that lands the OPS gate. (The requirement coverage pin
  APR-1@3 is intact — APR-1 the requirement is unchanged at v3; the breakage is the
  spec-element APRS-1, not the coverage.)

- [medium] DM-5 was semantically changed without a version bump. The ContentItem
  body gained a new qaStatus operator-QA gate ("withholds a draft from the founder's
  Ready until an operator clears it") — a new invariant on the entity — yet DM-5
  stays v: 1. Protocol: "Any semantic change bumps v." The change is additive
  (default n/a, invisible outside cohort-1) and no site pins DM-5@1, so lint stays
  green and current consumers (APRS/OPS, both updated here) are fine — hence medium,
  not high. But future DM-5 consumers cannot detect that the entity's contract
  changed, and any later DM-5@1 pin would be silently stale. Fix: bump DM-5 to v2
  (revisiting its citing sites), or record why an additive-only change consciously
  stays v1.

- [medium] The G-2 confound estimator is under-specified in a way one reading
  reintroduces the r1 defect. The r1 high (reconciliation backwards / asserted away)
  IS resolved: OPSS-1 and G-2's outcome reasoning now correctly say silent QA would
  INFLATE G-2 and the confound must be CONTROLLED and SURFACED (VAL-3/LRN-20), with
  the honest anchor "never on the post-QA drafts the founder sees." Residual: (a)
  "operator-touched drafts EXCLUDED from the rate" reads naturally as dropping them
  from the denominator — which biases the rate toward the already-good cream, the
  same inflation in a new dress; the honest estimator must count operator-touched
  drafts as NON-autonomous (in the denominator, not removed). (b) "measured on the
  PRE-QA draft" silently swaps the measurement instrument from the founder's
  disposition (G-2 coverage: "measured when the founder approves") to the operator's
  no-touch pass — a legitimate proxy, but a definitional change G-2's own text does
  not yet acknowledge. Non-blocking (the honest direction is achieved and G-2's
  outcome is explicitly in-progress with no cohort data yet), but tighten both
  before the first measurement record lands.

Held under scrutiny (attacked, did not break):
- Fix 2 (hold homed): the DM-5 / APRS-1 v3 / OPSS-1 trio now agree byte-for-byte in
  meaning — qaStatus (pending-review | cleared | n/a) is a flag on ContentItem that
  APRS-1's readyStack excludes; it is orthogonal to the DM-5 editorial state machine
  (no new state, no PIPE-2 stage needed — the gate is a read-time filter on the
  Ready view downstream of PIPE-2). "No new domain entity" is now honest (a flag on
  an existing entity + an operator-config dial value). No contradiction with
  DM-5/PIPE-2/APRS survives.
- Fix 3 (constrained-by): DM-5/DM-6/DM-7/DM-8 now present; depends-on += APRS. Good.
- Fix 4 (operator-auth): SEC-7 is correctly described as FOUNDER auth and no longer
  cited as the operator-auth basis; the deferred operator-access + cross-org
  confidential-data posture (SEC-4, confirmed = Org Data Confidentiality) is an
  honest open-question. Good.
- LRN-20 deterministic/human split, OPSS-2 failure-queue conformance, and the
  no-governed-by / cross-cutting scope claims all held from r1.
