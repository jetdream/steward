---
kind: challenge-record
spec: .spec/specs/gen-content-generation.yaml
round: 2
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (delta re-challenge — verified r1 fixes against live PIPE-2/DM-5/STRS-3/EXP-16/GEN-1v4/STW-1/GR-2, then attacked the changed sections fresh)
---

# GEN (Planning & Content Generation) — challenge record, round 2 (delta)

Delta re-challenge after the r1 FAIL (1 high + 3 mediums + 3 lows). Verified each
fix against live text; re-attacked the changed sections. docs-check graph green
(errors 0 / warnings 0) — every check below is semantic.

## Prior-finding verification

### HIGH-1 (PIPE-2 ordering inversion) — RESOLVED
The resolution CONFORMED the spec to the approved architecture rather than
inverting PIPE-2. Verified against the live PIPE-2 v2 sequenceDiagram
(GEN master+per-channel variants → VAL validate every variant → VAL→FIT
per-channel fit verdicts → INB) and DM-5 (per-variant fit verdicts; delivery
`pending : variant fit-passed (GEN-5), item approved`):
- GENS-2 now: generator produces variants for ALL connected channels, VAL
  validates, fit gate then scores — "adapt -> VAL -> fit, per PIPE-2; NOT
  fit-before-adapt." Matches the sequenceDiagram exactly.
- GENS-5 now: fit verdict assigned AFTER adapt+VAL, stored per DM-5; "only
  fit-passed variants enter the delivery lifecycle (pending) on approval."
  Matches DM-5 delivery lifecycle verbatim.
- Soundness of choosing conform-over-invert: adapt-then-fit is not merely the
  cheaper-cascade option — it is REQUIRED by the design it cites. DM-5's
  per-variant fit verdicts + the founder preview/override UX (GEN-5 "founder can
  override per post") need the skipped channel's variant to EXIST to be previewed
  and overridden; fit-before-adapt would produce no variant for a skipped channel
  and nothing to override. So the resolution is the design-correct one, not a
  worse one. The bounded COGS delta (a handful of connected channels, over-limit
  variants regenerated/flagged never shipped — GENS-2) is the approved
  architecture's accepted cost. No new contradiction introduced.

### MEDIUM-1 (mix-quota determinism / LRN-20 trap) — RESOLVED
GENS-1 now states Impact/Gratitude + Asks are OVERLAYS assigned as a PLAN-TIME
SLOT DESIGNATION (a structured slot attribute); the quota counts designations
(deterministic reservation), and faithful prose realization is an explicit soft
VAL/fit (LLM). Acceptance measures "≥1 slot DESIGNATED impact/gratitude and ≤25%
designated asks — a deterministic count over plan-time designations, not a
post-hoc LLM classification." This is exactly the honest LRN-20 split MEMS was
failed for. Trap closed. Coherent with GEN-1 v4 "Overlays woven through the mix."

### MEDIUM-2 (rolling-window semantics) — RESOLVED
GENS-1 now pins the quota to a TRAILING 28-day sliding window seeded from
already-scheduled/published history, "not counted per isolated plan block, so an
~8-week gap across two plan regenerations cannot hide." Acceptance ranges over
"any trailing 28-day window (over scheduled + planned slots)." The per-block hole
is closed; the invariant is deterministically checkable. Legitimate tightening of
GEN-1 v4's "≥1 per 4 weeks" (tighten-only respected).

### MEDIUM-3 (constrained-by omits governing EXP elements) — RESOLVED
EXP-2 (journey "the weekly visit," approved, serves GEN-2/4/5) and EXP-16 (flow
"work the stack," approved, parent EXP-2) added to constrained-by. EXP-16 is the
correct approved element: it carries the awaiting-picture state verbatim (dashed
warn slot, library suggestions with a reason, one-tap attach, disabled Approve
until resolved, no-match → EXP-22 photo request) that GENS-4 realizes and the
channel-skip reason that GENS-5 renders. Graph resolves green.

### LOW-1 (GR-2) — RESOLVED. GR-2 (no tax/legal advice) added to governed-by;
relevant to fundraising-ask/donation-URL content; within the design's GR-1..GR-6.

### LOW-2 (STRS-3 over-generalization) — RESOLVED. GENS-5 now scopes deterministic
skips to TECHNICAL (PUB-2) + STRUCTURAL prohibitions; a SEMANTIC section-(e) rule
is an LLM classification "still surfaced with a reason, but NOT claimed
deterministic." Consistent with STRS-3: its "HARD gate at the channel-fit stage"
is the enforcement CONSEQUENCE (block, not regenerate) — orthogonal to whether
detection is deterministic vs LLM; STRS-3's own hard example is length/format.
No contradiction.

### LOW-3 (interface mislocated the gate) — RESOLVED. schedulable() → canApprove()
gating awaiting_picture→approved (DM-5 invariant 1); GENS-3/GENS-4 reworded to the
approval gate. The requirement's "cannot be scheduled" (GEN-4) is preserved
transitively — GENS-3/4 retain "no variant schedules while the item is not
approved" (DM-5 invariant 2), so pictureless ⇒ not approvable ⇒ not schedulable.
Mirrors DM-5 invariant 1's exact "leave awaiting_picture toward approved" phrasing.

## Fresh attack on the changed sections
- Re-scanned for any surviving inverted-order phrasing ("fit gate runs before",
  "only for channels that pass", "schedulable", "cannot be scheduled") — none
  remain.
- Founder-override-of-a-hard-skip precedence: GENS-5 grants per-post override, but
  GENS-2's "never shipped over-limit" caps it for technical skips; override is a
  fit/"should this go here" judgment, not a guardrail loosen. Pre-existing at the
  GEN-5 requirement level, not introduced here. Held.

## Non-blocking note (low)
- The ≤25% ask cap expressed over "any trailing 28-day window" is mathematically
  well-defined at steady cadence (~8-12 slots/window) but can read as violated in
  an org's first weeks when the trailing window holds only 1-2 slots. This is a
  boundary-precision nit on the acceptance phrasing, not a design violation or an
  inversion; GEN-1's "≤25% of mix" intent is honored. One-line clarification
  (e.g. "windows with a minimum slot count") would tidy it. Does not block —
  the impact/gratitude sliding-window guarantee (the r1 target) is sound, and
  the ask cap over full windows is deterministic and checkable.

No surviving high; the single low is a one-line-fix phrasing note. Convergence
rule satisfied.

VERDICT: pass
