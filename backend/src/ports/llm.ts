/**
 * @module @backend/ports/llm
 *
 * The LLM/search PORT (ADR-0003 ports & adapters; the Vercel AI SDK provider
 * abstraction is itself an instance of this principle). A narrow, domain-defined
 * interface the brain modules (ARC-11 Memory, ARC-12 Onboarding, later GEN/CHT/
 * INT) call; no vendor type leaks past it. The v1 adapter is Google Vertex AI /
 * Gemini (ADR-0008, DEC-40); a deterministic keyless adapter backs self-contained
 * dev + CI (ADR-0003).
 *
 * Scope here is the two operations the brain SPINE needs: EXTRACTION (raw input →
 * typed candidate entries, PIPE-1's grounded classification step) and EMBEDDING
 * (text → a fixed-dim vector for pgvector retrieval, MEMS-4). Generation (GEN)
 * and search-grounding (EXT/IG-3) extend this port as those verticals land.
 */
import type { MemoryEntryKind } from "@steward/shared";

/** The embedding dimension every adapter must return (ADR-0008: 1536). */
export const EMBEDDING_DIM = 1536 as const;

/**
 * Vertex embedding task types (context7: google-vertex embeddingModel). We use
 * asymmetric retrieval types — documents on write, queries on retrieve — which
 * improves recall vs. a single symmetric type. The dev adapter ignores them.
 */
export type EmbedTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

/** A single candidate entry the extractor proposes from raw input (MEMS-1). */
export interface ExtractedEntry {
  /** The classified type — one of the seven DM-2 kinds. */
  kind: MemoryEntryKind;
  /** The subject/title for a structured entry (person/program/event); else undefined. */
  subject?: string;
  /** The normalized assertion/body. */
  content: string;
}

/** Context passed to extraction so classification is grounded, not blind. */
export interface ExtractionContext {
  /**
   * Whether the raw input arrived on an EXPLICIT correction channel (an APR
   * rejection/edit/skip, a CHT confirmed redirect, or the ONBS-5 review) — the
   * write path uses this for the MEMS-1 "never a bare fact" policy; the
   * extractor may use it as a hint.
   */
  correctionChannel: boolean;
}

/**
 * The LLM port. Adapters are dumb: they translate to/from a vendor and return
 * plain data. All policy (dedup, supersede, rule-vs-fact, asked-set) lives in
 * @backend/memory, never here. The grounded-extraction guard + catch-rate
 * discipline (LRN-20) is applied by the caller, not asserted here.
 */
export interface LlmPort {
  /** A short label of the active adapter (for logs / ops — PIPE-1 "everything logged"). */
  readonly name: string;
  /**
   * Classify raw free-text input into one or more typed candidate entries.
   * Returns candidates only; the caller enforces the grounded guard (LRN-20).
   */
  extractEntries(rawInput: string, context: ExtractionContext): Promise<ExtractedEntry[]>;
  /** Embed text into an EMBEDDING_DIM-length vector for pgvector retrieval (MEMS-4). */
  embed(text: string, taskType: EmbedTaskType): Promise<number[]>;
}
