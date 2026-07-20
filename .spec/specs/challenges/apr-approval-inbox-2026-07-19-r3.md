---
kind: challenge-record
spec: .spec/specs/apr-approval-inbox.yaml
round: 3
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (delta re-challenge — APRS-1 v2->v3 cohort-1 QA-gate addition; consistency with DM-5 v2 + OPSS-1; LRN-20/21/22 weaponized)
---

# Challenge record — APR (Approval surface / Ready & Composer), APRS-1 v3, round 3 (delta)

Delta scope: the single new behavior in APRS-1 v3 — the COHORT-1 QA GATE (a draft
with `qaStatus = pending-review` is WITHHELD from the Ready spine until an operator
clears it; `qaStatus n/a` once the per-org dial is off ⇒ drafts flow normally). This
homes the OPS operator-QA hold the OPS r1 challenger required a real data home for.
Attacked against DM-5 v2 (the `qaStatus` flag), OPSS-1 (the gate/dial/review owner),
and the rest of APRS-1 (disposition spine, Trust-Level/veto model, undo scope, batch
approve) plus the sibling APRS items.

## Consistency verified (held under scrutiny)

- **APRS-1 v3 ↔ DM-5 v2 ↔ OPSS-1 agree in meaning.** DM-5 v2 defines `qaStatus`
  (pending-review | cleared | n/a) that "withholds a draft from the founder's Ready
  (APRS-1) until an operator clears it; n/a (the default) once the per-org QA dial is
  off." OPSS-1: "a pending-review draft is WITHHELD from the founder's Ready (APRS-1
  excludes it) until an operator clears it (qaStatus n/a = off)." APRS-1 v3: withheld
  from this spine until cleared; n/a ⇒ flows. All three coincide; APRS-1 is source-
  agnostic (honors the flag whoever set it), the honest data home the OPS r1 finding
  demanded — the flag is a DM-5 field (DM-5 in constrained-by), avoiding a circular
  APRS→OPSS depends-on (OPSS already depends-on APRS).
- **Gate is upstream of TL1 auto-approve — no leak.** Attacked the safety-critical
  path: could a pending-review draft auto-publish at TL1 before an operator clears it
  (defeating the R-5 floor)? No. The withholding is absolute — "WITHHELD from this
  spine" removes it from `readyStack`, the single set TL1's "a clean draft auto-
  approves" acts on; OPSS-1 frames operator QA as PRE-founder / BEFORE reaching Ready.
  A withheld draft is not a candidate for any Ready-side disposition, TL1 included.
- **No contradiction with the rest of APRS-1.** The gate is additive and upstream: it
  does not touch the DM-5-exact undo scope (pending recall / scheduled→AUT-3/veto), the
  DEC-26 founder-selected veto model, or the disposition verbs. Batch approve is a
  strict subset — a withheld draft is not on the spine, so batchApprove never sees it
  (stronger than the pinned/blocked exclusion). Sibling items APRS-2..6 unchanged (all
  v1) and undisturbed.
- **Altitude correct.** The withholding lives in APRS-1 (implements APR-1 — "what the
  Ready spine shows"); the flag/dial/review live in OPSS-1 (OPS-1). The APR-1
  requirement statement needs no QA text (it is OPS-1's requirement enforced at APR's
  surface), so no APR-1 requirement bump / DEC is required. Cascade clean: DM-5 v1→v2
  leaves no stale pins (constrained-by is unversioned; no `DM-5 v1`/`DM-5@1` text pins);
  goals G-2 coverage re-pinned APR-1@3 / APRS-1@3; docs-check green (0 errors/warnings).

## Finding (medium — FIXED IN-CHANGE, convergence rule)

- **[medium] The v3 QA-gate behavior had no acceptance criterion in APRS-1.** The new
  first sentence of the statement added the withholding behavior, but the APRS-1
  ACCEPTANCE list (fit verdict / Approve / recall / veto model / batch exclusion / skip
  reason) carried no clause for it — a filter whose failure (an unreviewed draft leaking
  to Ready, or auto-publishing at TL1) would be invisible in review and defeats the R-5
  quality floor, i.e. exactly the "spec it with an acceptance criterion" case. It was
  tested end-to-end only via OPSS-1's acceptance, not at the module that owns the
  exclusion (@backend/approval). Fixed forward this round (one line, no new behavior,
  item already v3/draft — no re-bump): added "a pending-review draft (the OPSS-1 QA
  gate) is withheld from the spine until an operator clears it, and with the per-org QA
  dial off (qaStatus n/a) drafts flow to the spine normally" to the APRS-1 acceptance.
  docs-check re-run green.

## Non-blocking notes (low)

- **[low] `design`/`data` prose does not mention the QA gate.** The design section
  ("receives VAL-cleared drafts … records founder edits/verdicts") and the data section
  (DM-5 lifecycle) do not name the pending-review withholding. Completeness only — the
  behavior + acceptance in APRS-1's statement fully specify it and DM-5/OPSS-1 carry the
  cross-references; add a one-liner if the sections are next touched.

No surviving high. The single medium is a one-line fix applied in this change; the low
is an improvement note. Per the convergence rule the spec may return to `approved` at
v3 once its `challenge:` block is updated to point at this r3 record (verdict pass).

VERDICT: pass
