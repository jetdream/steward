---
name: change-request
description: >-
  Run the SDLC intake protocol (docs/CLAUDE.md Phase A) on a substantive user
  request before making any change: classify it, evaluate it against the docs
  first, push back on contradictions, fill information gaps, surface
  flexibility-limiting decisions, and record the required INC/Q/DEC/CON
  artifacts — then hand off to Phase B execution. Invoke on any request that
  would add or change a requirement, spec, principle, scope, or architecture,
  or when unsure whether a request conflicts with what's already documented.
---

# Change-request intake (SDLC Phase A)

The runnable form of the intake protocol. Work the steps in order; do not
form a build proposal before step 2 is done. Cite IDs throughout. The
authoritative protocol is in [docs/CLAUDE.md](../../../docs/CLAUDE.md) — this
skill is its checklist.

## 1. Classify

Name the request's class (it selects the path):
- **question** — answer from the docs; no change. If the answer exposes a doc gap, note it (step 4).
- **bug** — enter Phase B bug-triage (spec gap / spec violation / wrong spec / design gap).
- **new-requirement** — a new capability item.
- **change-to-existing** — modifies a requirement/goal/principle/scope.
- **preference** — a narrow how-it-should-feel ask with no general rule; apply narrowly, track it, and if a pattern emerges propose promoting it to a principle.
- **technical-decision** — a how-to-build choice.

## 2. Evaluate against the docs FIRST

Load the governing layers before proposing anything:
- `docs/product/goals.yaml` (does it serve a goal?), `docs/product/principles.yaml` (P-*/GR-*), `docs/product/scope.md` (in/out of scope?), and the relevant `docs/product/requirements/*.yaml` + `docs/specs/*.yaml` by ID.
- Also load open `docs/product/inconsistencies.yaml` (INC-*), `docs/product/constraints.yaml` (CON-*), and `docs/product/decisions.yaml` (DEC-*) touching the area.
- `rg -n "<ID>" docs src` to find everything that references the IDs in play.

## 3. Contradiction check → push back

Does the request conflict with a goal / principle / guardrail / scope boundary / existing requirement?
- **If yes and the user did NOT explicitly override it: STOP.** State the contradiction, cite the conflicting IDs, and ask for an explicit decision (AskUserQuestion). Do not proceed on your own authority.
- Severity by precedence: a `GR-*` guardrail is near-immovable (needs a deliberate guardrail change); a `P-*`/goal/scope/`flexibility: hard` requirement → mandatory HITL; a `flexibility: preference` item → you may propose a resolution for confirmation.
- Record the contradiction as an `INC-*` entry (status open) and, once the user decides, the resolution as a `DEC-*` (the override/authorization).

## 4. Gap check → ask, then store

Is there enough information to design? Check for missing: compliance obligations, deployment/environment/data-residency, usage modes, integration facts, edge cases, NFRs (perf/security/scale).
- **High-importance gap** (weak guidance × many dependents × high impact): ask the user, then **store the answer** — operational/compliance/deployment/usage facts → `CON-*`; external bets → `A-*`; product behavior → a requirement.
- **Low-importance gap**: fill it from a principle, flag the derivation `inferred` in a code comment / note, and log an open `Q-*`.

## 5. Flexibility check → proactive heads-up

Would implementing this take a one-way door — data-model shape, external-service lock-in, a public/wire contract, the auth model — or a brown-phase change (once there are production users/data), or foreclose a deferred/vision direction (`docs/product/scope.md`)?
- If so, **tell the user proactively, propose an ADR, and get the decision** — do not silently pick the convenient irreversible option. Record as a `DEC-*` and an ADR.

## 6. Produce the intake summary, then hand off

Emit a short summary: `class · governing IDs loaded · contradictions (INC / resolved by DEC or blocked on user) · gaps (asked / stored as CON/Q) · flexibility flags (ADR/DEC)`. Only once contradictions and blocking gaps are resolved, proceed to **Phase B** (the change protocol in docs/CLAUDE.md) — spec-first, with the HITL sign-off (`decided-by: DEC-x`) on any requirement/goal/principle change.

## Backward escalation (if a blocker surfaces during Phase B)

If something can't be built as specified, climb the ladder rather than diverging: code → spec (gap/wrong-spec) → design (ADR) → requirement. A requirement-level change needs HITL (`DEC-*`, enforced by DCX-16). Record the blocker-vs-reality conflict as `INC-*`; retain deferred/rejected escalations (rejected → `LRN` dead-end; deferred → open `Q-*`) so they aren't silently re-raised.
