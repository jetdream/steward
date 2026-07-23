# backend/src/observability/ — LLM observability, cost & reliability

**Purpose.** The instrumentation + resilience layer wrapping the LLM/search port
(ARC-27). Realizes the architecture PIPE-5 (observability & cost) and PIPE-6 (LLM
reliability), writing the DM-19 ModelCall record. Infrastructure over approved
architecture — no behaviour spec of its own.

| File | Realizes |
|---|---|
| `instrument.ts` | PIPE-5/PIPE-6 — wraps an `LlmPort`: OTel span + COGS metric + DM-19 ModelCall row + retry/timeout/circuit-breaker, per call, best-effort |
| `resilience.ts` | PIPE-6 — retry-with-backoff + timeout + per-provider circuit-breaker (injectable clock ⇒ unit-testable) |
| `cost.ts` | PIPE-5 — per-model price table + token estimator → per-call cost (COGS) |
| `context.ts` | PIPE-5 — AsyncLocalStorage obs context (org + skill + trajectory); set by callers, read by `instrument.ts` |
| `model-call.ts` | DM-19 ModelCall writer |

**Boundaries.**
- Wrapping is transparent: the public `LlmPort` signature is unchanged; callers
  set an obs context (`withObsContext`) around their LLM work and the wrapper
  attributes the call. No obs context ⇒ no ModelCall row (span+metric only).
- **Best-effort telemetry**: a span/metric/ModelCall failure must NEVER break the
  underlying LLM call (all logging is `try`-guarded).
- Cost is currently ESTIMATED from text length; exact provider usage (when a
  keyed adapter surfaces it) will override it. The OTel MeterProvider export is a
  follow-up — the metric API records now (no-op until a provider is registered),
  and the DM-19 rows are the durable COGS substrate (query `SUM(cost_usd)` per org).

**Gotcha.** ModelCall is org-scoped (DM-19); the org comes from the ALS obs
context, not the port signature. The ARC-27 runtime (B5) sets the same context
per Skill invocation.
