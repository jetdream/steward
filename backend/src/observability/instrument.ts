/**
 * @module @backend/observability/instrument
 *
 * Adapts a RawLlmAdapter → the clean LlmPort, adding the two things the provider
 * telemetry does NOT do: COST (no pricing) + the DM-19 ModelCall product row
 * (PIPE-5), and the reliability wrap (PIPE-6, retry/timeout/circuit-breaker).
 *
 * TRACING is NOT done here — the provider adapter emits OpenTelemetry spans via
 * the Vercel AI SDK's built-in `telemetry` (GenAI conventions), so we do not
 * hand-instrument spans (the dev stub, making no provider call, emits none).
 * ModelCall uses the adapter's REAL reported token usage; org/skill come from the
 * AsyncLocalStorage obs context. Logging is BEST-EFFORT — a ModelCall write
 * failure never breaks the LLM call.
 */

import type { ModelCallOperation, ModelCallOutcome } from "@shared";
import type { Database } from "../db/client.js";
import type { LlmPort, LlmUsage, RawLlmAdapter } from "../ports/llm.js";
import { currentObsContext } from "./context.js";
import { costUsd } from "./cost.js";
import { recordModelCall } from "./model-call.js";
import { createResilience } from "./resilience.js";

/** Dependencies — db optional (omit ⇒ resilience only, no ModelCall rows, e.g. unit tests). */
export interface InstrumentDeps {
  db?: Database;
  resilience?: ReturnType<typeof createResilience>;
}

/** Adapt + observe + protect a RawLlmAdapter as an LlmPort (PIPE-5/PIPE-6). */
export function instrumentLlm(adapter: RawLlmAdapter, deps: InstrumentDeps = {}): LlmPort {
  const res = deps.resilience ?? createResilience();

  async function observe<V>(
    operation: ModelCallOperation,
    run: () => Promise<{ value: V; usage: LlmUsage }>,
  ): Promise<V> {
    const ctx = currentObsContext();
    const start = Date.now();
    let outcome: ModelCallOutcome = "ok";
    let usage: LlmUsage | undefined;
    try {
      const r = await res.run(adapter.name, run);
      usage = r.usage;
      return r.value;
    } catch (err) {
      outcome = "error";
      throw err;
    } finally {
      const latencyMs = Date.now() - start;
      const model = usage?.model ?? adapter.name;
      const tokensIn = usage?.tokensIn ?? 0;
      const tokensOut = usage?.tokensOut ?? 0;
      // Record a ModelCall only when an org-scoped obs context + a DB are present.
      if (deps.db && ctx?.orgId) {
        try {
          await recordModelCall(deps.db, {
            orgId: ctx.orgId,
            skill: ctx.skill,
            model,
            operation,
            tokensIn,
            tokensOut,
            costUsd: costUsd(model, tokensIn, tokensOut),
            latencyMs,
            outcome,
            promptVersion: ctx.promptVersion,
            runId: ctx.runId,
            stepIndex: ctx.stepIndex,
          });
        } catch {
          // best-effort: a ModelCall write failure must never break the LLM call.
        }
      }
    }
  }

  return {
    name: adapter.name,
    extractEntries: (raw, context) =>
      observe("generateObject", async () => {
        const { entries, usage } = await adapter.extract(raw, context);
        return { value: entries, usage };
      }),
    embed: (text, taskType) =>
      observe("embed", async () => {
        const { vector, usage } = await adapter.embed(text, taskType);
        return { value: vector, usage };
      }),
    generateDraft: (input) =>
      observe("generateObject", async () => {
        const { master, usage } = await adapter.generate(input);
        return { value: master, usage };
      }),
    checkGuardrails: (input) =>
      observe("classify", async () => {
        const { judgment, usage } = await adapter.judgeGuardrails(input);
        return { value: judgment, usage };
      }),
    identifyTopics: (input) =>
      observe("generateObject", async () => {
        const { topics, usage } = await adapter.identifyTopics(input);
        return { value: topics, usage };
      }),
  };
}
