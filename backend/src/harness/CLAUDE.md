# backend/src/harness/ — the agent runtime & versioned harness (ARC-27 / PIPE-4)

**Purpose.** The single home for "assemble prompt + model + policy for Skill X
and run it." Realizes the architecture PIPE-4 (agent runtime & harness model).
Infrastructure over approved architecture — no behaviour spec of its own.

| File | Role |
|---|---|
| `prompts/*.ts` | Versioned prompt artifacts (`id@version`) — a prompt is first-class, not an inline adapter string |
| `manifest.ts` | The HARNESS manifest (skill → promptRef + model + agentPolicy) + `harnessManifestHash()` — what the ADR-0010 regression gate (B6) keys on |
| `runtime.ts` | `runSkill(ctx, body)` — binds the obs context (skill + prompt version) and runs the Skill body |

**Scope (B5, DEC-41 minimal-harness decision).** Today every Skill is
**single-shot** (`maxSteps: 1`). DEFERRED to **GEN** (their first real consumer):
the bounded multi-step tool-calling loop, the tool registry, and the VAL
guardrail chain (Strategy fit / GR-3 / GR-8). `runSkill` is the seam they extend —
its body becomes the loop, bounded by the Skill's `agentPolicy`.

**How it's used.** A capability runs its LLM work inside `runSkill(...)` (e.g.
`@backend/memory` write = the `extract-memory` Skill, retrieve = `retrieve-memory`).
The bound obs context flows to the instrumented LLM port (`../observability/`),
which records the ModelCall with the skill + prompt version.

**Gotcha.** A prompt change MUST bump its artifact `version` — that changes
`harnessManifestHash()`, which is the signal the eval gate uses to require a
fresh eval before the change ships (B6).
