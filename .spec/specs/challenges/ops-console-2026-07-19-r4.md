---
kind: challenge-record
spec: .spec/specs/ops-console.yaml
round: 4
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (delta re-challenge — verify the single r3 high fix + no new inconsistency; scope only G-2 outcome note vs OPSS-1 estimator)
---

VERDICT: pass
SPEC: .spec/specs/ops-console.yaml

FINDINGS: none survived scrutiny.

r3 high (RESOLVED) — G-2 outcome note now MATCHES OPSS-1's estimator:
- G-2 is "Autonomy proof", statement "≥70% of drafts approved without edits by an org's
  week 8" (goals.yaml:110) — the approval-without-edit goal OPSS-1 correctly labels
  "G-2 (approval-without-edit)". The fix landed on G-2's outcome reasoning
  (goals.yaml:105-109); the "G-3:" line in the diff is merely the following goal.
- The r3-offending clause "(operator-touched drafts EXCLUDED)" is GONE. G-2 outcome now
  reads: an operator-touched draft "COUNTS as non-autonomous (kept in the denominator,
  never credited, never dropped; equivalently computed on the PRE-QA draft as it would
  have reached the founder), so the rate reflects autonomy, not hidden operator labor and
  not cream-skimming (VAL-3)."
- OPSS-1 (ops-console.yaml:73-78): an operator-QA intervention "COUNTS as a NON-autonomous
  outcome … NOT dropped from the denominator and NOT credited as approved-without-edit
  (excluding it would just re-inflate by keeping only the clean cream) … computed on the
  PRE-QA draft AS IT WOULD HAVE REACHED THE FOUNDER, so a draft an operator fixed counts
  AGAINST the rate."
- Clause-by-clause the two now assert ONE estimator: counts-as-non-autonomous, kept-in-
  denominator, never-credited, never-dropped, computed-on-pre-QA, cream-skimming
  repudiated. The higher-precedence goal no longer governs a biased estimator; the QA-dial
  trust-earning loop now rests on an honest G-2 signal. Attacked by re-reading both texts
  side by side for any residual directional mismatch — none.

(b) The one-line edit introduced no new inconsistency:
- Internally coherent: "kept in the denominator, never credited" is the exact equivalent of
  "computed on the PRE-QA draft as it would have reached the founder" — the same identity
  OPSS-1 states; no self-contradiction of the kind r3 flagged.
- VAL-3 ("Nothing hidden") is the correct value — the note's purpose is to prevent hidden
  operator labor from crediting the metric; citation matches meaning.
- The goal's outcome reasoning referencing OPSS-1 by ID is measurement-definition (how the
  metric is field-validated), which is the goals layer's own concern — not a restatement of
  spec behavior and not an altitude inversion; the layer model permits neighbor reference by
  ID.
- docs-check green: 0 errors, 0 warnings (semantic prose contradiction was always invisible
  to the graph; the fix is verified by reading, and the graph confirms no pin/edge broke).

Out of scope per the re-challenge brief (r3-held, not re-litigated): APRS-1 v3 approved home
for the QA hold, DM-5 v2 qaStatus gate, constrained-by / depends-on, and the operator-access
SEC open-question.

OPS is approvable at OPSS-1 v1 / OPSS-2 v1: no high survives; flip status to approved and
point the challenge block at this record.
