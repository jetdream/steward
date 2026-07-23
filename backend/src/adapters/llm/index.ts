/**
 * @module @backend/adapters/llm
 *
 * Composition root for the LLM port (ADR-0003 environment-selected adapter): the
 * real Vertex/Gemini adapter (ADR-0008) when `VERTEX_AI_KEY` is set, else the
 * deterministic keyless dev stub so self-contained dev + CI run without a GCP
 * account. No adapter identity leaks past `createLlmPort()`.
 */
import type { LlmPort } from "../../ports/llm.js";
import { devStubLlm } from "./dev-stub.js";
import { createVertexLlm } from "./vertex.js";

/** Select the active LLM adapter from the environment (ADR-0003 selection seam). */
export function createLlmPort(): LlmPort {
  if (process.env.VERTEX_AI_KEY) return createVertexLlm();
  return devStubLlm;
}
