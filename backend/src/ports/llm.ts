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
import type { ContentType, MemoryEntryKind, SlotDesignation } from "@steward/shared";

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

/**
 * A calendar slot the generator writes for (GENS-7 input): the taxonomy TYPE
 * (HOW to frame) paired with an agenda SUBJECT (WHAT to talk about, a TOPS-4
 * topic), plus the plan-time overlay DESIGNATION the master must honor (GEN-1
 * v4). Assembled by the planner (GENS-1); for the G1 slice it is fed directly.
 */
export interface ContentSlot {
  type: ContentType;
  subject: string;
  designation: SlotDesignation;
}

/**
 * The grounded generation input (GENS-7). The DOMAIN caller (@backend/content)
 * assembles the grounding + overlay from Memory (MEMS-4) + Strategy and passes
 * them in — the port itself does NO retrieval (it stays a dumb provider surface,
 * ADR-0003). On a VAL-driven regenerate, `regenerateHint` carries the failed
 * check's fix instruction (the bounded PIPE-2 regenerate loop).
 */
export interface DraftGenInput {
  slot: ContentSlot;
  /** Grounding package text (Memory retrieval + Strategy) — the sole factual source (VAL-4). */
  grounding: string;
  /** The FULL active rule/taboo overlay (MEMS-3), routed in so generation steers clear. */
  overlay: string[];
  /** A VAL-driven regenerate fix hint from a failed guardrail check, if any. */
  regenerateHint?: string;
}

/** The generated MASTER story before VAL (GENS-7) — the DM-5 master content fields. */
export interface GeneratedMaster {
  title: string;
  body: string;
  /** The founder-facing "why this, why now" line (the GEN-1 ReasonLine). */
  reasonLine: string;
}

/** The guardrails the VAL judge can flag (GENS-7 / PIPE-2). */
export type GuardrailId = "GR-1" | "GR-2" | "GR-3" | "GR-5" | "GR-8";

/**
 * One guardrail the JUDGE flagged on a master. `fixable` → a regenerate with a
 * hint (GR-1/GR-2/GR-5); `escalate` → force human approval regardless of Trust
 * Level (GR-3 sensitive, a GR-8 taboo that cannot be confidently cleared).
 */
export interface GuardrailFinding {
  guardrail: GuardrailId;
  severity: "fixable" | "escalate";
  reason: string;
}

/**
 * The guardrail JUDGE's verdict (GENS-7). Detection is a semantic LLM judgment
 * (LRN-20 — NEVER a regex/keyword heuristic): the keyed tier reads the master and
 * returns the findings it is confident about. `judged: false` marks the DORMANT
 * keyless path (no live judgment performed) so the eval treats content catch-rates
 * as dormant on that tier — only the structural GR-8 backstop still fires.
 */
export interface GuardrailJudgment {
  findings: GuardrailFinding[];
  judged: boolean;
}

/** Input to the guardrail judge: the master to read + the routed overlay (MEMS-3). */
export interface GuardrailCheckInput {
  master: GeneratedMaster;
  /** The FULL active rule/taboo overlay (MEMS-3) the master must not violate. */
  overlay: string[];
  /** External-sourced content triggers the GR-5 citation requirement. */
  isExternal: boolean;
}

/**
 * Grounded input to topic identification (TOPS-1). The DOMAIN caller
 * (@backend/topics) assembles the grounding from Memory (MEMS-4 retrieveContext —
 * cause profile, mission, programs, people, audience) and passes the available
 * evidence ids; the port does NO retrieval. `existingThemes` is the active agenda
 * (empty on a cold-start first run) so identification does not re-propose.
 */
export interface TopicIdInput {
  /** Retrieved Memory text — the sole grounding (nothing fabricated, VAL-4). */
  grounding: string;
  /** The Memory entry ids available as evidence — the resolvability set for the guard. */
  groundingIds: string[];
  /** Active-agenda theme labels to avoid re-deriving (empty on cold start). */
  existingThemes: string[];
}

/**
 * A candidate topic the identifier proposes (TOPS-1). `evidenceMemoryIds` MUST
 * resolve into the input `groundingIds` — the deterministic grounding guard drops
 * any topic with no resolvable pointer (LRN-20); rationale quality is the keyed
 * catch-rate tier.
 */
export interface CandidateTopic {
  /** A short canonical theme label → the deterministic `topicKey`. */
  theme: string;
  description: string;
  /** Why this fits THIS org — the grounded rationale. */
  whyItFits: string;
  /** Cited Memory entry ids backing the topic (guard: must be a subset of groundingIds). */
  evidenceMemoryIds: string[];
}

/** Input to the calendar-pairing step (GENS-1): the agenda to draw subjects from. */
export interface PlanSlotInput {
  /** The editorial agenda — active topics to pair subjects from (id + description). */
  agenda: { id: string; description: string }[];
  /** How many slots to pair for the plan block. */
  count: number;
}

/**
 * One planner pairing (GENS-1): a taxonomy TYPE paired with an agenda SUBJECT (by
 * topic id). The type↔subject pairing is the grounded LLM step; the deterministic
 * guard (@backend/content) drops a pairing whose topicId is not in the agenda or
 * whose type is not an allowed taxonomy type. Overlay DESIGNATION + quotas are a
 * separate deterministic plan-time step, NOT chosen by the model (LRN-20 split).
 */
export interface SlotPairing {
  type: ContentType;
  topicId: string;
}

/**
 * Grounded input to Strategy auto-draft (STRS-2). The DOMAIN caller
 * (@backend/strategy) assembles the grounding from Memory (style findings + facts)
 * and passes it in; the port does NO retrieval. Nothing is invented (VAL-4) — the
 * sections are drawn only from the grounding.
 */
export interface DraftStrategyInput {
  /** Retrieved Memory text — the sole grounding for the draft (VAL-4). */
  grounding: string;
  /** The channels to write section (e) instructions for (fb / ig / threads / x). */
  channels: string[];
}

/**
 * The auto-drafted Strategy sections (STRS-2). Section (c) is NEVER drafted — it
 * is a live derived view over the platform guardrails + Memory overlay (DEC-22).
 */
export interface StrategyDraft {
  /** (a) what to post / what not to post — soft editorial preferences. */
  sectionA: string;
  /** (b) tone of voice — description + concrete examples. */
  sectionB: string;
  /** (d) specific standing instructions. */
  sectionD: string;
  /** (e) channel-specific instructions, keyed by platform. */
  sectionE: Record<string, string>;
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
 * The LLM port — the CLEAN surface every brain module calls. Returns plain
 * results; usage/cost/observability are handled by the instrumenting wrapper
 * (observability/instrument.ts), not the caller. All policy (dedup, supersede,
 * rule-vs-fact, asked-set) lives in @backend/memory, never here.
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
  /**
   * Generate the grounded MASTER story for a slot (GENS-7 / PIPE-2). Returns the
   * raw master only; the VAL guardrail chain (@backend/content) gates it before
   * any queue — generation is never a bypass of the guardrails.
   */
  generateDraft(input: DraftGenInput): Promise<GeneratedMaster>;
  /**
   * The VAL guardrail JUDGE (GENS-7 / PIPE-2): read a master and flag guardrail
   * violations SEMANTICALLY (LRN-20 — an LLM judgment with a residual miss rate,
   * never a regex/keyword heuristic). The keyless stub is dormant (`judged:false`);
   * the caller's chain resolves findings → pass / regenerate / escalate.
   */
  checkGuardrails(input: GuardrailCheckInput): Promise<GuardrailJudgment>;
  /**
   * Derive candidate content topics grounded in Memory (TOPS-1). Returns raw
   * candidates; the caller (@backend/topics) applies the deterministic evidence
   * guard + persists the surviving topics (DM-13).
   */
  identifyTopics(input: TopicIdInput): Promise<CandidateTopic[]>;
  /**
   * Pair calendar slots — a taxonomy TYPE with an agenda SUBJECT (GENS-1, the
   * grounded LLM pairing step). Returns raw pairings; the caller applies the
   * deterministic agenda/taxonomy guard + the plan-time mix-quota designations.
   */
  planSlots(input: PlanSlotInput): Promise<SlotPairing[]>;
  /**
   * Auto-draft the Strategy sections (a/b/d/e) grounded in Memory (STRS-2). Returns
   * the raw draft; the caller (@backend/strategy) persists it as a StrategyDoc
   * version. Section (c) is never drafted — it is a derived view (DEC-22).
   */
  draftStrategy(input: DraftStrategyInput): Promise<StrategyDraft>;
}

/** Provider-reported (or estimated) token usage for one call — cost input (PIPE-5). */
export interface LlmUsage {
  /** The concrete model id used (e.g. "gemini-2.5-flash"), for the price table. */
  model: string;
  tokensIn: number;
  tokensOut: number;
}

/**
 * The RAW adapter surface (internal): the same operations, but each returns the
 * value PLUS the provider-reported usage. The instrumenting wrapper adapts a
 * RawLlmAdapter → LlmPort, computing cost + recording a DM-19 ModelCall from the
 * usage while OpenTelemetry TRACING is emitted by the provider adapter itself
 * (the Vercel AI SDK's built-in `telemetry`, GenAI conventions — we do not
 * hand-instrument spans). Vertex + the keyless dev stub implement this.
 */
export interface RawLlmAdapter {
  readonly name: string;
  extract(
    rawInput: string,
    context: ExtractionContext,
  ): Promise<{ entries: ExtractedEntry[]; usage: LlmUsage }>;
  embed(text: string, taskType: EmbedTaskType): Promise<{ vector: number[]; usage: LlmUsage }>;
  generate(input: DraftGenInput): Promise<{ master: GeneratedMaster; usage: LlmUsage }>;
  judgeGuardrails(
    input: GuardrailCheckInput,
  ): Promise<{ judgment: GuardrailJudgment; usage: LlmUsage }>;
  identifyTopics(input: TopicIdInput): Promise<{ topics: CandidateTopic[]; usage: LlmUsage }>;
  planSlots(input: PlanSlotInput): Promise<{ pairings: SlotPairing[]; usage: LlmUsage }>;
  draftStrategy(input: DraftStrategyInput): Promise<{ draft: StrategyDraft; usage: LlmUsage }>;
}
