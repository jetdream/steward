/**
 * @module @backend/adapters/llm
 *
 * Composition root for the LLM port (ADR-0003 environment-selected adapter): the
 * real Vertex/Gemini adapter (ADR-0008) when `VERTEX_AI_KEY` is set, else the
 * deterministic keyless dev stub. `STEWARD_LLM=dev-stub` FORCES the keyless stub
 * regardless of an ambient key — the hermeticity knob the deterministic test tier
 * (`npm test`) sets so a real key in `.env` never leaks the live provider into
 * unit/integration tests (LRN-27); the keyed tier (`npm run eval`, smokes) leaves
 * it unset. The chosen adapter is wrapped with observability + resilience
 * (PIPE-5/PIPE-6) so every call is traced, costed, ModelCall-logged, and
 * retry/timeout/circuit-breaker protected. No adapter identity leaks past
 * `createLlmPort()`.
 */
import type { InstrumentDeps } from "../../observability/instrument.js";
import { instrumentLlm } from "../../observability/instrument.js";
import type { LlmPort } from "../../ports/llm.js";
import { devStubLlm } from "./dev-stub.js";
import { createVertexLlm } from "./vertex.js";

/**
 * Select + instrument the active LLM adapter. Pass `{ db }` so per-call ModelCall
 * rows (DM-19) are recorded; omit it for spans + metrics only (e.g. unit tests).
 */
export function createLlmPort(deps: InstrumentDeps = {}): LlmPort {
  // `STEWARD_LLM=dev-stub` pins the keyless deterministic adapter even when a real
  // VERTEX_AI_KEY is present — hermeticity for the deterministic test tier (LRN-27).
  const forceStub = process.env.STEWARD_LLM === "dev-stub";
  const adapter = !forceStub && process.env.VERTEX_AI_KEY ? createVertexLlm() : devStubLlm;
  return instrumentLlm(adapter, deps);
}
