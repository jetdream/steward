# backend/src/observability/ — LLM observability, cost & reliability

**Purpose.** The instrumentation + resilience layer wrapping the LLM/search port
(ARC-27). Realizes the architecture PIPE-5 (observability & cost) and PIPE-6 (LLM
reliability), writing the DM-19 ModelCall record. Infrastructure over approved
architecture — no behaviour spec of its own.

| File | Realizes |
|---|---|
| `instrument.ts` | PIPE-5/PIPE-6 — adapts a `RawLlmAdapter` → `LlmPort`, adding COST + the DM-19 ModelCall row + retry/timeout/circuit-breaker, per call, best-effort |
| `resilience.ts` | PIPE-6 — retry-with-backoff + timeout + per-provider circuit-breaker (injectable clock ⇒ unit-testable) |
| `cost.ts` | PIPE-5 — per-model price table + token estimator → per-call cost (COGS) |
| `context.ts` | PIPE-5 — AsyncLocalStorage obs context (org + skill + trajectory); set by callers, read by `instrument.ts` AND fed to the SDK telemetry `metadata` |
| `model-call.ts` | DM-19 ModelCall writer |

**Boundaries.**
- **TRACING is the provider SDK's job, not ours.** The Vercel AI SDK emits OTel
  spans (GenAI conventions + real token usage) via its built-in `telemetry`; we
  do NOT hand-instrument LLM spans. `instrument.ts` only adds what the SDK
  doesn't: cost, the ModelCall row, and reliability. The dev stub makes no
  provider call, so it emits no span (fine — it's a keyless stand-in).
- Wrapping is transparent: the public `LlmPort` signature is unchanged; callers
  set an obs context (`withObsContext`) around their LLM work — it feeds both the
  SDK telemetry `metadata` (org/skill) and the ModelCall row. No obs context ⇒ no
  ModelCall row.
- **Best-effort logging**: a ModelCall write failure must NEVER break the
  underlying LLM call (`try`-guarded).
- Cost uses the SDK's REAL reported usage (the dev stub reports synthetic usage
  at $0). The OTel MeterProvider export for a live COGS metric is a follow-up;
  the DM-19 rows are the durable COGS substrate (query `SUM(cost_usd)` per org).
- SEC-4: prompt/response CONTENT is kept off the SDK spans (`recordInputs/
  recordOutputs` off) and is not stored on ModelCall.

**Gotcha.** ModelCall is org-scoped (DM-19); the org comes from the ALS obs
context, not the port signature. The ARC-27 runtime (B5) sets the same context
per Skill invocation.
