---
kind: challenge-record
spec: .spec/specs/ops-console.yaml
round: 3
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (delta re-challenge — verify r2 fixes 1-3 + re-attack changed sections; LRN-20/21/22 weaponized)
---

VERDICT: fail
SPEC: .spec/specs/ops-console.yaml

FINDINGS:

- [high] Fix 3 is applied INCONSISTENTLY across the two registers, creating a live
  contradiction on the autonomy estimator — the exact r2 defect, now enshrined in the
  higher-precedence layer. OPSS-1 was correctly rewritten: an operator-QA intervention
  "COUNTS as a NON-autonomous outcome … the draft is NOT dropped from the denominator
  and NOT credited as approved-without-edit (excluding it would just re-inflate by
  keeping only the clean cream) … computed on the PRE-QA draft … so a draft an operator
  fixed counts AGAINST the rate." But G-2's outcome reasoning (goals.yaml, ADDED this
  session — confirmed all-`+` in the working-tree diff, so this is a newly authored note,
  not stale text) reads: "computed on the PRE-QA draft (operator-touched drafts
  EXCLUDED), so the rate reflects autonomy." "Excluded" means dropped from the
  computation — the cream-skimming inflation OPSS-1 now explicitly repudiates by name.
  The two clauses are also internally contradictory: "computed on the PRE-QA draft"
  means an operator-touched draft is INCLUDED as a fail, which is the opposite of
  "excluded." This survives scrutiny on three counts: (1) it is a direct
  register-vs-spec contradiction, not under-specification (the r2 medium was
  under-specification; this round hardened it into a contradiction by writing the wrong
  word into the goal); (2) precedence is goals > specs, so G-2's biased estimator
  GOVERNS the honest OPSS-1 one — an implementer following the authoritative metric
  definition would drop operator-touched drafts and inflate; (3) the QA-dial's
  trust-earning loop DEPENDS on G-2 being honest (OPSS-1: the confound matters "exactly
  while the dial depends on that signal") — a biased G-2 dials oversight down on inflated
  evidence, removing the R-5 quality floor prematurely, which is the precise
  self-deception the whole OPS QA-gate exists to prevent. The task's claim that "G-2's
  outcome reasoning got a matching note" is false — it got a CONTRADICTING note. Fix:
  in G-2's outcome reasoning replace "(operator-touched drafts excluded)" with the
  OPSS-1 wording — operator-touched drafts are COUNTED as non-autonomous (kept in the
  denominator, never credited, never dropped) — so the goal and the spec state one
  estimator. One line, but it forces fail (a surviving high) and blocks OPS approval.

Held under scrutiny (attacked, did not break):
- Fix 1 (APRS-1 v3 homed + challenged): APR is status: approved at APRS-1 v: 3, its
  challenge block points at apr-approval-inbox-2026-07-19-r3.md (verdict pass), which
  delta-challenges the readyStack QA-gate exclusion and verifies no pending-review draft
  auto-publishes at TL1. OPSS-1's hold now has a real, approved, challenged home. Held.
- Fix 2 (DM-5 bump): DM-5 is v: 2 with the cohort-1 qaStatus operator-QA gate annotation
  (pending-review | cleared | n/a; withheld from Ready until cleared; n/a default) and
  the DEC-26 opt-in hold-then-publish pending-veto note in the delivery lifecycle.
  Cascade clean — no `DM-5 v1` / `DM-5@1` pins in .spec or src. Held.
- OPSS-1 itself is now internally honest and self-consistent (the estimator direction is
  correct within the spec); the sole defect is the mismatched G-2 note, not OPSS-1's own
  text. Held.
- r2-held items intact: constrained-by carries DM-5/DM-6/DM-7/DM-8; depends-on carries
  APRS; the operator-access + cross-org confidential-data posture is an honest deferred
  SEC open-question; SEC-7 is correctly described as FOUNDER auth (demoted, not cited as
  the operator-auth basis). LRN-20 deterministic/human split and OPSS-2 conformance held.
- docs-check green (0 errors, 0 warnings) — the contradiction is semantic and invisible
  to the graph, as expected (goal-outcome prose vs spec prose; no pin, no edge sees it).

OPS cannot flip to approved this round: the one-line G-2 correction above must land
first so the authoritative goal and OPSS-1 assert a single, honest estimator. With that
one line applied, no high survives and OPS is approvable at OPSS-1 v1 / OPSS-2 v1.
