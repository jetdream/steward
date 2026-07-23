/**
 * @module @backend/adapters/llm/vertex
 *
 * The Google Vertex AI / Gemini adapter for the LLM port (ADR-0008, DEC-40) —
 * the v1 real provider. Generation/extraction on `gemini-2.5-flash`
 * (structured output via `generateObject`); embeddings on `gemini-embedding-2`
 * pinned to 1536 dims with asymmetric retrieval task types. Reached only via
 * the ADR-0003 port; no vendor type escapes this file.
 *
 * Auth/config from env (the founder supplies real GCP creds — this keyed path
 * is intentionally UNTESTED for now, like Google OAuth): `VERTEX_AI_KEY`
 * (→ provider `apiKey`), `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION`. When
 * `VERTEX_AI_KEY` is absent the composition root selects the keyless dev stub
 * instead (adapters/llm/index.ts).
 */
import { createVertex } from "@ai-sdk/google-vertex";
import { MemoryEntryKind } from "@steward/shared";
import { embed, generateObject } from "ai";
import { z } from "zod";
import {
  EMBEDDING_DIM,
  type EmbedTaskType,
  type ExtractedEntry,
  type ExtractionContext,
  type LlmPort,
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

/**
 * Build the Vertex-backed LLM port. Throws if `VERTEX_AI_KEY` is unset — callers
 * (adapters/llm/index.ts) only construct this when a key is present.
 */
export function createVertexLlm(): LlmPort {
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
    async extractEntries(rawInput, context: ExtractionContext): Promise<ExtractedEntry[]> {
      const { object } = await generateObject({
        model: vertex(EXTRACT_MODEL),
        schema: extractionSchema,
        system:
          "You extract an org's durable knowledge into typed Memory entries. " +
          "Classify each into exactly one kind: fact, story, styleRule, taboo, person, program, event. " +
          "styleRule = a positive writing preference; taboo = a prohibition. " +
          "Only assert what the input supports; never invent facts (ground strictly in the text).",
        prompt:
          (context.correctionChannel
            ? "This input is an EXPLICIT correction/instruction — prefer styleRule or taboo over a bare fact.\n\n"
            : "") + rawInput,
      });
      // Normalize: drop an absent subject rather than carry an explicit
      // `undefined` (exactOptionalPropertyTypes).
      return object.entries.map((e) => {
        const entry: ExtractedEntry = { kind: e.kind, content: e.content };
        if (e.subject !== undefined) entry.subject = e.subject;
        return entry;
      });
    },
    async embed(text, taskType: EmbedTaskType): Promise<number[]> {
      const { embedding } = await embed({
        model: vertex.embeddingModel(EMBED_MODEL),
        value: text,
        providerOptions: { vertex: { outputDimensionality: EMBEDDING_DIM, taskType } },
      });
      return embedding;
    },
  };
}
