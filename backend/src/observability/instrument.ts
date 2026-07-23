/**
 * @module @backend/observability/instrument
 *
 * Wraps an LlmPort so EVERY call is observed (PIPE-5) and resilient (PIPE-6),
 * without changing the port's public signature. Per call it: runs under the
 * retry/timeout/circuit-breaker (resilience.ts); opens an OpenTelemetry span with
 * org/skill/model/token/cost/latency attributes; records the COGS metric; and
 * writes a DM-19 ModelCall row (when a DB + an obs context with an org are
 * present). Logging is BEST-EFFORT — a telemetry failure never breaks the LLM
 * call. Org/skill come from the AsyncLocalStorage obs context (context.ts).
 */
import { metrics, SpanStatusCode, trace } from "@opentelemetry/api";
import type { ModelCallOperation } from "@shared";
import type { Database } from "../db/client.js";
import type { LlmPort } from "../ports/llm.js";
import { currentObsContext } from "./context.js";
import { costUsd, estimateTokens } from "./cost.js";
import { recordModelCall } from "./model-call.js";
import { createResilience } from "./resilience.js";

const tracer = trace.getTracer("steward-llm");
const meter = metrics.getMeter("steward-llm");
// No-ops until a MeterProvider is registered (otel.ts, follow-up) — safe to record now.
const costHist = meter.createHistogram("steward.llm.cost_usd", {
  description: "Estimated LLM cost per call (USD)",
});
const latencyHist = meter.createHistogram("steward.llm.latency_ms", {
  description: "LLM call latency (ms)",
});

/** Dependencies for instrumentation — db is optional (omit ⇒ spans+metrics only, no ModelCall rows). */
export interface InstrumentDeps {
  db?: Database;
  resilience?: ReturnType<typeof createResilience>;
}

/** Wrap an LlmPort with observability + resilience (PIPE-5/PIPE-6). */
export function instrumentLlm(inner: LlmPort, deps: InstrumentDeps = {}): LlmPort {
  const res = deps.resilience ?? createResilience();

  async function observe<T>(
    operation: ModelCallOperation,
    inputText: string,
    run: () => Promise<T>,
    outputText: (result: T) => string,
  ): Promise<T> {
    const ctx = currentObsContext();
    const model = inner.name;
    const start = Date.now();
    return tracer.startActiveSpan(`llm.${operation}`, async (span) => {
      let outcome: "ok" | "error" = "ok";
      let result: T | undefined;
      let thrown: unknown;
      try {
        result = await res.run(model, run);
        return result;
      } catch (err) {
        outcome = "error";
        thrown = err;
        throw err;
      } finally {
        const latencyMs = Date.now() - start;
        const tokensIn = estimateTokens(inputText);
        const tokensOut =
          outcome === "ok" && result !== undefined ? estimateTokens(outputText(result)) : 0;
        const cost = costUsd(model, tokensIn, tokensOut);
        const skill = ctx?.skill ?? "unknown";
        span.setAttributes({
          "llm.operation": operation,
          "llm.model": model,
          "llm.skill": skill,
          "llm.tokens_in": tokensIn,
          "llm.tokens_out": tokensOut,
          "llm.cost_usd": cost,
          "llm.latency_ms": latencyMs,
          ...(ctx?.orgId ? { "org.id": ctx.orgId } : {}),
        });
        if (thrown instanceof Error) span.recordException(thrown);
        span.setStatus({ code: outcome === "ok" ? SpanStatusCode.OK : SpanStatusCode.ERROR });
        costHist.record(cost, { model, skill, operation });
        latencyHist.record(latencyMs, { model, skill, operation });
        if (deps.db && ctx?.orgId) {
          try {
            await recordModelCall(deps.db, {
              orgId: ctx.orgId,
              skill,
              model,
              operation,
              tokensIn,
              tokensOut,
              costUsd: cost,
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
        span.end();
      }
    });
  }

  return {
    name: inner.name,
    extractEntries: (raw, context) =>
      observe(
        "generateObject",
        raw,
        () => inner.extractEntries(raw, context),
        (r) => JSON.stringify(r),
      ),
    embed: (text, taskType) =>
      observe(
        "embed",
        text,
        () => inner.embed(text, taskType),
        () => "",
      ),
  };
}
