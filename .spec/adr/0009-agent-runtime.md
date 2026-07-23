---
kind: adr
title: Agent runtime & harness model
status: accepted
supersedes: ~
---

# ADR-0009 — Agent runtime & harness model

<!--
Design gate: cortex:architect-challenger, 2026-07-23. r1 FAIL (2 high, 3 medium,
1 low) → all fixed → r2 delta PASS (one 1-line §6 fix applied with the verdict).
The amend-vs-supersede mechanics, guardrail-chain conformance (PIPE-2 order +
LRN-20 split + GR-3/GR-8 backstops), and the LLM-port evolution were attacked and
held. See ADR-0010 for the paired eval framework.
-->


## Context

The AI subsystem is Steward's core, yet it is currently only a **principle**
(`llm-pipeline.yaml` PIPE-1 "one brain, several skills") plus per-capability
prose. Prompts, tool/function-calling definitions, per-skill model routing, and
the runtime that assembles them are **specified nowhere** — each capability
(GEN, CHT, INT, STR, EXT, TOP) is expected to call the LLM port its own way, and
`ADR-0008` gives only one routing clause ("flash by default, pro for
quality-critical slots"). There is no component that owns "assemble prompt +
tools + model + retrieval + guardrails for skill X," no home for prompts as
reviewable artifacts, and no way to govern a prompt/tool/model change.

`ADR-0003` (ports & adapters) deliberately **rejected "a heavy orchestration
layer up front"** as premature for a two-engineer team. This ADR revisits that
one clause with new information: (a) the AI *is* the product, not a peripheral
integration; (b) the next capability (GEN) and the ones after it (CHT command
actions CHTS-3, the interviewer INT, radar EXT) genuinely need multi-step,
tool-using behaviour; and (c) reliability + regression-testability (the founder's
stated priority) require the harness to be a **first-class, governed artifact**,
which an implicit per-capability approach cannot provide. The decision to adopt a
full agent runtime is recorded in **DEC-41**.

Scope boundary: this ADR **amends only** ADR-0003's no-heavy-orchestration
clause. The rest of ADR-0003 — ports & adapters, self-contained dev, the
Job/Queue seam — stands unchanged, so this ADR does **not** set `supersedes`
(that would cascade-red every spec citing ADR-0003). ADR-0003 carries an
amendment note pointing here.

## Options considered

1. **Thin declarative Skill layer (no agent loop).** A `Skill` is config
   (prompt + tools + model + retrieval) and one assembler produces a single
   grounded, guarded model call; multi-step reasoning is added per-skill only
   where needed. Cheapest, easiest to evaluate (input→output pairs), closest to
   ADR-0003's stance. Con: some skills (chat command actions, research-driven
   topic authoring, radar triage) genuinely want a tool-calling loop, which this
   pushes into bespoke per-skill code — re-fragmenting exactly what we are trying
   to unify.

2. **Cross-cuts only, keep per-capability calls.** Add eval + observability +
   reliability around today's implicit calls, no runtime abstraction. Least
   disruption; but prompts/tools/model-routing stay implicit and ungoverned, and
   evals cannot compare a *harness* because there is no harness object.

3. **Full agent runtime — bounded by construction (chosen, DEC-41).** A real
   multi-step, tool-calling runtime, but every skill declares a **bounded agent
   policy** the runtime enforces. Most capable and the single governed home for
   prompts/tools/models; honest con: multi-step agents are harder to
   regression-test and cost more — mitigated by the bounds below and by
   trajectory-level evaluation (ADR-0010).

## Decision

Adopt a **full agent runtime** behind the ADR-0003 LLM/search port, structured
so complexity and cost are bounded and every part is a governed, evaluable
artifact.

**1. Formalize the LLM port contract.** Promote the port (`backend/src/ports/llm.ts`)
from its ad-hoc `extract`/`embed` surface to a first-class contract with the full
operation set the subsystem needs: `generate` / `generateObject` (structured) /
`classify` / `embed` / `groundedSearch` (Gemini + Google-Search grounding for
EXT/IG-3) / `chatStep` (one tool-calling turn). Adapters stay dumb (Vertex/Gemini
per ADR-0008; the keyless dev stub); no vendor type escapes the port.

**2. The Skill = a versioned harness.** A `Skill` is declarative:

```
Skill = {
  id,                       // e.g. "generate-draft", "chat", "interview", "extract-memory"
  promptRef,                // reference to a VERSIONED prompt template (see 4)
  tools,                    // the tool schemas this skill may call (subset of the registry)
  model, params,            // model id + temperature/structured-output/token budget (ADR-0008 routing lives here, per-skill)
  retrievalPolicy,          // MEMS-4 grounding + the always-on rule/taboo overlay
  guardrailChain,           // the VAL pipeline this skill's output runs (GR-1..GR-8)
  agentPolicy,              // the BOUND: allowedTools, maxSteps, costBudget, termination
}
```

**3. The runtime assembler + agent loop.** One runtime component turns
`(skill, orgContext)` into execution: it loads grounded context (Memory
retrieval + overlay), assembles the prompt, exposes the skill's tools, runs the
model — as a single call or a **bounded tool-calling loop** (plan → call tool →
observe → repeat → finalize) — and routes output through the guardrail chain.
The loop is **bounded by the skill's `agentPolicy`**: a hard `maxSteps`, a
per-invocation token/cost budget tied to the PIPE-1 `<$25/org/mo` COGS target,
an explicit termination condition, and a whitelisted tool set. Unbounded loops
are structurally impossible. Tools are backend module operations (e.g.
`generateDraft`, `retrieveContext`, `schedulePost`) exposed to the model via
schemas from a **tool registry**; a tool call is subject to the same org
confinement (ACC-3) and guardrails as a direct call.

**4. Prompts and tools are versioned artifacts.** Prompt templates and tool
schemas live in a `harness` module as real files with a **version**, and a
**harness manifest** maps `skill → prompt-version + model + tools + agentPolicy`.
Note the cortex docs-graph cascade tracks YAML `v:` pins and code markers — it
does NOT see prompt-file changes — so the enforcement is NOT the graph cascade
but an explicit **CI check on the manifest hash**: a change to any harness
artifact bumps the manifest, and CI **fails a harness change that has no passing
keyed eval on record** for the new manifest (the ADR-0010 §5 gate). This closes
today's gap: a prompt/model/tool change currently has no version, no review, and
no eval.

**5. The guardrail chain is a reusable pipeline, not per-skill code.** The PIPE-2
VAL chain (Strategy fit → GR-1..6 → GR-3 sensitive-topic → GR-8 taboo overlay →
fit gate) is one composable, ordered pipeline every generating skill runs,
preserving the LRN-20 deterministic-vs-probabilistic split and the
`pass / regenerate / escalate` contract with the GR-3/GR-8 human-escalation
backstops. Autonomy (AUT) sits above it and never short-circuits it.

## Consequences

- **Amends ADR-0003** (the no-heavy-orchestration clause only) under DEC-41;
  ADR-0003 otherwise stands and is not superseded (no citing-spec cascade). An
  amendment note is added to ADR-0003.
- **Unlocks + governs** every AI skill: GEN and later skills are built as Skills
  on this runtime, with their prompts/tools/models as versioned artifacts and a
  bounded agent policy — no more implicit per-capability LLM wiring.
- **Raises the testing bar, deliberately** (see ADR-0010): a bounded multi-step
  agent emits trajectories, so evaluation must score tool-choice, step count,
  termination, and cost — not only final output. The bounds (maxSteps, cost
  budget) make this tractable and cap runaway cost.
- **Reliability**: the LLM port gains retry/backoff/timeout/circuit-breaker
  (today the adapters have none); tool calls inherit org confinement + guardrails.
- **Refactors `llm-pipeline.yaml`** into the agent-runtime element set (port
  contract, Skill/harness, VAL pipeline, agent loop) — an architecture-doc change
  that cascades to PIPE-citing specs, revisited consciously.
- **Cost**: per-skill budgets + the ADR-0010 cost capture make the PIPE-1 COGS
  target measurable and enforceable rather than aspirational.
- Revisit if the bounded-agent complexity proves unjustified for the actual skill
  set (a lighter default could be re-adopted per-skill) — a superseding ADR, not
  a silent change.
