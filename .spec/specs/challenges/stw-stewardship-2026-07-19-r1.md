---
kind: challenge-record
spec: .spec/specs/stw-stewardship.yaml
round: 1
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (single pass — design-conformance / no-double-ownership KEY check / implementation-divergence + hidden-assumptions / LRN-19/20/22 sweep)
---

VERDICT: pass
SPEC: .spec/specs/stw-stewardship.yaml

## What I attacked and why it held

### KEY CHECK — the no-double-ownership claim (STWS-1) — HELD
STWS-1 `implements: [STW-1]`; GENS-1 `implements: [GEN-1]` only (it references
STW-1 in prose but does NOT list it). So there is no lint-level or altitude-level
double-ownership: each requirement (GEN-1, STW-1) has exactly one implementing
spec-element. The quota MECHANISM is singular — it lives in GENS-1's planner
(`planCalendar`), one piece of code serving both GEN-1's "overlays woven through
the mix" and STW-1's "first-class overlay from week 1". Shared mechanism, not a
double-claimed requirement. This is clean layering and honors DRY (constitution)
and the altitude rule (a stewardship requirement's ownership is NOT smuggled into
the generation spec).

Verified GENS-1 genuinely enforces the quota as claimed: GENS-1 assigns the
overlay as a PLAN-TIME SLOT DESIGNATION (a structured attribute on the slot) and
the quota counts those designations — a deterministic reservation, honestly split
from the soft VAL/fit check on whether prose realizes the overlay (LRN-20 trap
closed correctly). "≥1 impact/gratitude per rolling 4-week window" (STWS-1) ==
GENS-1's "≥1 per trailing 28-day sliding window". Consistent.

### "First-class from week 1" (STWS-1) vs GENS-1's rolling-window quota — HELD
GENS-1 acceptance evaluates the quota over "scheduled + planned slots", so a
brand-new org's first 4-week PLANNED window carries ≥1 designated impact from day
one. GENS-1's sparse-first-week carve-out applies ONLY to the ≤25% ask ratio and
explicitly states the sparse window "is held only to the impact-rhythm guarantee,
not the ratio" — so the week-1 impact guarantee is preserved even in the sparsest
case. STWS-1's strongest claim is fully consistent with GENS-1. No divergence.

### Ask-hygiene (STWS-1) vs PROS-3 — HELD
PROS-3 flags ASKING-WITHOUT-REPORTING (a fundraising ask with no recent
impact/gratitude post) and proposes the missing impact post, citing STW-1 and the
GEN-1 mix. STWS-1's clause is an exact match. Consistent.

### Design-conformance (constrained-by / governed-by) — HELD
- ARC-15 Content Engine is literally "GEN + STW" — STWS's "donor-lifecycle logic
  in the Content Engine module (ARC-15, GEN + STW)" is exactly on-model.
- EXP-2 (weekly visit) `serves` includes STW-1 — the rhythm landing there conforms.
- EXP-24 (approve once — campaigns & milestones) body: "Milestone recaps (STW-2,
  P1) ride the same shape" — STWS-2's surface citation conforms.
- GR-1 (no outcome promises) — STWS-1/STWS-2 both assert it; VAL-4 correctly kept
  in prose (values not in governed-by). ADR-0002/0003 are accepted baseline.
- design-scope: cross-cutting is HONEST (spans GENS + PROS + experience + DM-5)
  and cites accepted ADRs / approved architecture + experience elements — the
  design gate scope check passes.
- docs-check --json: 0 errors, 0 warnings (clean graph).

### LRN-20 honest deterministic/probabilistic split — HELD
STWS claims the mix quota and campaign-date trigger deterministic; the recap PROSE
a grounded LLM step. No un-failable absolute; no "deterministic … never" overclaim
on an LLM check. Correct.

## Findings (all MEDIUM/LOW — none block; see convergence note)

- [medium] STWS-2's auto (campaign-end-date) milestone recap is not reconciled
  with the PROS-4 interruption budget — it survives because a system-triggered
  recap arrives unprompted in the colleague-moves-first journey (EXP-4/EXP-24),
  i.e. it IS a proactive push, and its sibling in the SAME journey (PROS-2
  campaigns) explicitly "draws from the PROS-4 budget", yet STWS-2 is silent —
  a sibling-coherence gap against the very R-10 stacking failure PROS-4 exists to
  prevent. PROS-4 already states it "bounds ALL proactive pushes", so the fire is
  small. Fix (one line in STWS-2): state that the campaign-end-date recap is a
  high-priority in-window proactive push subject to the PROS-4 budget, while the
  founder one-tap trigger is founder-initiated (not an interruption).

- [medium] STWS-2's "deterministic" campaign-END-DATE trigger cites DM-5, but
  DM-5 is ContentItem and models no campaign concept or end-date field, and there
  is NO Campaign data-entity anywhere in the data model ("campaign" appears only
  as a glossary overlay type). It survives because LRN-22 makes the data model the
  quiet authority and the model does not encode what the deterministic trigger
  needs. It stays MEDIUM (not high) only because the trigger is plausibly
  derivable from DM-5 delivery timestamps (the last scheduled campaign-tagged
  ContentItem) and STW-2 is P1/deferred — but that derivation is unstated, and a
  deterministic date trigger with no stated data home is exactly the LRN-20-class
  gap. Fix (one line in STWS-2/data): state the campaign end date derives from the
  last scheduled campaign-tagged ContentItem's delivery date (DM-5), or flag a
  data-model open-question for a first-class campaign end date.

- [low] STWS-1's ACCEPTANCE is entirely delegated (the quota clause == GENS-1's
  acceptance; the hygiene clause == PROS-3's) so STWS-1 carries no independently
  failable criterion. Acceptable for a thin coverage/delegation anchor closing a
  P0 trace gap, but worth naming: STWS-1's value is the trace + the explicit
  no-separate-planner statement, not new tests.

- [low] STWS-1's acceptance folds in the PROS-3 ask-hygiene clause, but PROS-3 is
  P1 ("not in the P1b slice"). The P0-deliverable part of this P0 spec is the
  GENS-1 quota alone; the hygiene criterion cannot pass until P1. Consider noting
  that the P0 slice satisfies STW-1 via the GENS-1 quota, with ask-hygiene riding
  the P1 PROS-3 delivery.

## Why the mediums do not block (convergence rule)
No high survived. STWS-1 — the P0 coverage-closing element and the KEY-CHECK
target — is design-sound, conformant, and verified against GENS-1/PROS-3 live
text. Both mediums are on the deferred P1 STWS-2, are one-line clarifications
(PROS-4 already bounds "ALL proactive pushes"; the end-date derivation is a
one-line statement), and neither requires editing another approved spec. Per the
specs/CLAUDE.md convergence rule (no surviving high + only one-line-fix mediums),
this is a pass with the fixes applied in the same change that records the verdict.
