/**
 * @module @backend/adapters/llm/vertex
 *
 * The Google Vertex AI / Gemini adapter (ADR-0008, DEC-40) — the v1 real
 * provider, a RawLlmAdapter. Generation/extraction on `gemini-2.5-flash`
 * (structured output via `generateObject`); embeddings on `gemini-embedding-2`
 * pinned to 1536 dims. Reached only via the ADR-0003 port; no vendor type
 * escapes this file.
 *
 * TRACING is the AI SDK's built-in OpenTelemetry `telemetry` (GenAI semantic
 * conventions) — we do NOT hand-instrument spans (PIPE-5). `recordInputs/
 * recordOutputs: false` keeps prompt/response CONTENT off the spans (SEC-4);
 * `functionId`/`metadata` carry the skill + org from the obs context. Real token
 * `usage` is returned to the wrapper for cost + the DM-19 ModelCall (PIPE-5).
 *
 * Auth/config from env (the founder supplies real GCP creds — this keyed path is
 * intentionally UNTESTED for now, like Google OAuth): `VERTEX_AI_KEY`,
 * `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION`.
 */
import { createVertex } from "@ai-sdk/google-vertex";
import { MemoryEntryKind } from "@steward/shared";
import { embed as aiEmbed, generateObject } from "ai";
import { z } from "zod";
import { EXTRACT_MEMORY_PROMPT } from "../../harness/prompts/extract-memory.js";
import { currentObsContext } from "../../observability/context.js";
import {
  EMBEDDING_DIM,
  type EmbedTaskType,
  type ExtractedEntry,
  type ExtractionContext,
  type RawLlmAdapter,
} from "../../ports/llm.js";

const EXTRACT_MODEL = "gemini-2.5-flash";
const EMBED_MODEL = "gemini-embedding-2";

/** The structured-extraction schema Gemini must return (grounded classification, PIPE-1). */
const extractionSchema = z.object({
  entries: z.array(
    z.object({
      kind: MemoryEntryKind,
      subject: z.string().optional(),
      content: z.string(),
    }),
  ),
});

/** AI SDK telemetry settings for a call — spans on, CONTENT off (SEC-4), org/skill tagged. */
function telemetryFor(fallbackFn: string) {
  const ctx = currentObsContext();
  return {
    functionId: ctx?.skill ?? fallbackFn,
    recordInputs: false,
    recordOutputs: false,
    metadata: ctx?.orgId ? { orgId: ctx.orgId } : {},
  };
}

/**
 * Build the Vertex-backed adapter. Throws if `VERTEX_AI_KEY` is unset — callers
 * (adapters/llm/index.ts) only construct this when a key is present.
 */
export function createVertexLlm(): RawLlmAdapter {
  const apiKey = process.env.VERTEX_AI_KEY;
  if (!apiKey) throw new Error("createVertexLlm: VERTEX_AI_KEY is not set");

  // Build settings conditionally — exactOptionalPropertyTypes forbids passing an
  // explicit `undefined` project/location (the provider defaults them from env).
  const settings: Parameters<typeof createVertex>[0] = { apiKey };
  if (process.env.GOOGLE_VERTEX_PROJECT) settings.project = process.env.GOOGLE_VERTEX_PROJECT;
  if (process.env.GOOGLE_VERTEX_LOCATION) settings.location = process.env.GOOGLE_VERTEX_LOCATION;
  const vertex = createVertex(settings);

  return {
    name: "vertex:gemini",
    async extract(rawInput, context: ExtractionContext) {
      const { object, usage } = await generateObject({
        model: vertex(EXTRACT_MODEL),
        schema: extractionSchema,
        telemetry: telemetryFor("extract-memory"),
        // The system prompt is the versioned harness artifact (PIPE-4), not an
        // inline string — a change bumps its version + the manifest hash.
        system: EXTRACT_MEMORY_PROMPT.system,
        prompt:
          (context.correctionChannel
            ? "This input is an EXPLICIT correction/instruction — prefer styleRule or taboo over a bare fact.\n\n"
            : "") + rawInput,
      });
      // Drop an absent subject rather than carry an explicit undefined (exactOptional).
      const entries = object.entries.map((e) => {
        const entry: ExtractedEntry = { kind: e.kind, content: e.content };
        if (e.subject !== undefined) entry.subject = e.subject;
        return entry;
      });
      return {
        entries,
        usage: {
          model: EXTRACT_MODEL,
          tokensIn: usage.inputTokens ?? 0,
          tokensOut: usage.outputTokens ?? 0,
        },
      };
    },
    async embed(text, taskType: EmbedTaskType) {
      const { embedding, usage } = await aiEmbed({
        model: vertex.embeddingModel(EMBED_MODEL),
        value: text,
        telemetry: telemetryFor("embed-memory"),
        providerOptions: { vertex: { outputDimensionality: EMBEDDING_DIM, taskType } },
      });
      return {
        vector: embedding,
        usage: { model: EMBED_MODEL, tokensIn: usage.tokens ?? 0, tokensOut: 0 },
      };
    },
  };
}
