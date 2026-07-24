/**
 * @module @backend/adapters/llm/vertex
 *
 * The Google Vertex AI / Gemini adapter (ADR-0008, DEC-40) — the v1 real
 * provider, a RawLlmAdapter. Generation/extraction on `gemini-2.5-flash`
 * (structured output via `generateObject`); embeddings on `gemini-embedding-001`
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
import { contentTypes, MemoryEntryKind } from "@steward/shared";
import { embed as aiEmbed, generateObject, generateText } from "ai";
import { z } from "zod";
import { DRAFT_STRATEGY_PROMPT } from "../../harness/prompts/draft-strategy.js";
import { EXTRACT_MEMORY_PROMPT } from "../../harness/prompts/extract-memory.js";
import { GENERATE_DRAFT_PROMPT } from "../../harness/prompts/generate-draft.js";
import { GUARDRAIL_CHECK_PROMPT } from "../../harness/prompts/guardrail-check.js";
import { IDENTIFY_TOPICS_PROMPT } from "../../harness/prompts/identify-topics.js";
import { PLAN_CALENDAR_PROMPT } from "../../harness/prompts/plan-calendar.js";
import { RADAR_DISCOVER_PROMPT } from "../../harness/prompts/radar-discover.js";
import { currentObsContext } from "../../observability/context.js";
import {
  type CandidateTopic,
  type DraftGenInput,
  type DraftStrategyInput,
  EMBEDDING_DIM,
  type EmbedTaskType,
  type ExtractedEntry,
  type ExtractionContext,
  type GeneratedMaster,
  type GroundedSearchInput,
  type GuardrailCheckInput,
  type GuardrailFinding,
  type PlanSlotInput,
  type RawLlmAdapter,
  type SearchCandidate,
  type SlotPairing,
  type StrategyDraft,
  type TopicIdInput,
} from "../../ports/llm.js";

const EXTRACT_MODEL = "gemini-2.5-flash";
const GENERATE_MODEL = "gemini-2.5-flash";
// The guardrail judge is a cheap classification (LRN-20 — LLM detection, not regex).
const GUARDRAIL_MODEL = "gemini-2.5-flash";
const TOPICS_MODEL = "gemini-2.5-flash";
const PLAN_MODEL = "gemini-2.5-flash";
const STRATEGY_MODEL = "gemini-2.5-flash";
const SEARCH_MODEL = "gemini-2.5-flash";
const EMBED_MODEL = "gemini-embedding-001";

/** The structured discovery candidates the radar returns (EXTS-1). */
const candidatesSchema = z.object({
  candidates: z.array(
    z.object({
      source: z.string(),
      url: z.string(),
      title: z.string(),
      summary: z.string(),
      relevanceRationale: z.string(),
      topicId: z.string(),
      eventDate: z.string().optional(),
    }),
  ),
});

/** Assemble the discovery user prompt: the agenda + geography + how many to find. */
function searchPrompt(input: GroundedSearchInput): string {
  const agenda = input.topics.map((t) => `${t.id}: ${t.description}`).join("\n");
  return (
    `EDITORIAL AGENDA:\n${agenda}\n\nGEOGRAPHY: ${input.geography}\n\n` +
    `Find up to ${input.count} recent, relevant external items (events/news/research) to comment on.`
  );
}

/**
 * The structured Strategy draft Gemini must return (STRS-2 — sections a/b/d/e).
 * Section (e) is an ARRAY of {channel, instruction} (not a free dictionary) — a
 * more reliable structured-output shape that reliably elicits one entry per named
 * channel; the adapter maps it to the port's Record shape.
 */
const strategySchema = z.object({
  sectionA: z.string(),
  sectionB: z.string(),
  sectionD: z.string(),
  sectionE: z.array(z.object({ channel: z.string(), instruction: z.string() })),
});

/** Assemble the strategy-draft user prompt: the grounding + the channels to cover. */
function strategyPrompt(input: DraftStrategyInput): string {
  const channels = input.channels.join(", ") || "(none connected yet)";
  return (
    `ORGANIZATION MEMORY (the ONLY grounding — do not invent, VAL-4):\n${input.grounding}\n\n` +
    `Return one section (e) entry for EACH of these channels: ${channels}.`
  );
}

/** The structured pairing set the planner must return (GENS-1). */
const planSchema = z.object({
  pairings: z.array(z.object({ type: z.enum(contentTypes), topicId: z.string() })),
});

/** Assemble the planner's user prompt: the agenda + how many slots to pair. */
function planPrompt(input: PlanSlotInput): string {
  const agenda = input.agenda.map((t) => `${t.id}: ${t.description}`).join("\n");
  return `EDITORIAL AGENDA (choose subjects only from these topic ids):\n${agenda}\n\nPair ${input.count} calendar slots.`;
}

/** The structured topic set the identifier must return (TOPS-1). */
const topicsSchema = z.object({
  topics: z.array(
    z.object({
      theme: z.string(),
      description: z.string(),
      whyItFits: z.string(),
      evidenceMemoryIds: z.array(z.string()),
    }),
  ),
});

/** Assemble the identifier's user prompt: the grounding + available evidence ids + agenda. */
function topicsPrompt(input: TopicIdInput): string {
  const existing =
    input.existingThemes.length > 0
      ? `\n\nCURRENT AGENDA (do not re-propose these): ${input.existingThemes.join(", ")}`
      : "\n\n(no agenda yet — this is the first run)";
  return (
    `ORGANIZATION MEMORY (each line is a groundable entry):\n${input.grounding}\n\n` +
    `AVAILABLE EVIDENCE ENTRY IDS (cite only from these): ${input.groundingIds.join(", ") || "(none)"}` +
    existing
  );
}

/** The structured verdict the guardrail judge must return (GENS-7). */
const guardrailSchema = z.object({
  findings: z.array(
    z.object({
      guardrail: z.enum(["GR-1", "GR-2", "GR-3", "GR-5", "GR-8"]),
      severity: z.enum(["fixable", "escalate"]),
      reason: z.string(),
    }),
  ),
});

/** Assemble the judge's user prompt: the master to read + the active overlay. */
function guardrailPrompt(input: GuardrailCheckInput): string {
  const { master, overlay, isExternal } = input;
  const overlayBlock =
    overlay.length > 0
      ? `\n\nACTIVE RULES/TABOOS:\n- ${overlay.join("\n- ")}`
      : "\n\n(no active taboos)";
  return (
    `${isExternal ? "This is EXTERNAL-sourced content (GR-5 citation applies).\n\n" : ""}` +
    `TITLE: ${master.title}\nBODY: ${master.body}\nREASON: ${master.reasonLine}` +
    overlayBlock
  );
}

/** The structured-draft schema Gemini must return (the DM-5 master fields, GENS-7). */
const draftSchema = z.object({
  title: z.string(),
  body: z.string(),
  reasonLine: z.string(),
});

/** Assemble the grounded user prompt from the slot + grounding + overlay (GENS-7). */
function draftPrompt(input: DraftGenInput): string {
  const { slot, grounding, overlay, regenerateHint } = input;
  const overlayBlock =
    overlay.length > 0
      ? `\n\nACTIVE RULES/TABOOS (never violate; steer clear):\n- ${overlay.join("\n- ")}`
      : "";
  const designation = slot.designation === "none" ? "" : `\nOverlay to honor: ${slot.designation}.`;
  const hint = regenerateHint ? `\n\nREVISION REQUIRED: ${regenerateHint}` : "";
  return (
    `Content type: ${slot.type}\nSubject (from the editorial agenda): ${slot.subject}.${designation}\n\n` +
    `GROUNDING (the ONLY factual source — do not invent facts or events, VAL-4):\n${grounding}` +
    overlayBlock +
    hint
  );
}

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
    async generate(input: DraftGenInput) {
      const { object, usage } = await generateObject({
        model: vertex(GENERATE_MODEL),
        schema: draftSchema,
        telemetry: telemetryFor("generate-draft"),
        system: GENERATE_DRAFT_PROMPT.system,
        prompt: draftPrompt(input),
      });
      const master: GeneratedMaster = {
        title: object.title,
        body: object.body,
        reasonLine: object.reasonLine,
      };
      return {
        master,
        usage: {
          model: GENERATE_MODEL,
          tokensIn: usage.inputTokens ?? 0,
          tokensOut: usage.outputTokens ?? 0,
        },
      };
    },
    async judgeGuardrails(input: GuardrailCheckInput) {
      const { object, usage } = await generateObject({
        model: vertex(GUARDRAIL_MODEL),
        schema: guardrailSchema,
        telemetry: telemetryFor("guardrail-check"),
        system: GUARDRAIL_CHECK_PROMPT.system,
        prompt: guardrailPrompt(input),
      });
      const findings: GuardrailFinding[] = object.findings.map((f) => ({
        guardrail: f.guardrail,
        severity: f.severity,
        reason: f.reason,
      }));
      return {
        judgment: { findings, judged: true },
        usage: {
          model: GUARDRAIL_MODEL,
          tokensIn: usage.inputTokens ?? 0,
          tokensOut: usage.outputTokens ?? 0,
        },
      };
    },
    async identifyTopics(input: TopicIdInput) {
      const { object, usage } = await generateObject({
        model: vertex(TOPICS_MODEL),
        schema: topicsSchema,
        telemetry: telemetryFor("identify-topics"),
        system: IDENTIFY_TOPICS_PROMPT.system,
        prompt: topicsPrompt(input),
      });
      const topics: CandidateTopic[] = object.topics.map((t) => ({
        theme: t.theme,
        description: t.description,
        whyItFits: t.whyItFits,
        evidenceMemoryIds: t.evidenceMemoryIds,
      }));
      return {
        topics,
        usage: {
          model: TOPICS_MODEL,
          tokensIn: usage.inputTokens ?? 0,
          tokensOut: usage.outputTokens ?? 0,
        },
      };
    },
    async planSlots(input: PlanSlotInput) {
      const { object, usage } = await generateObject({
        model: vertex(PLAN_MODEL),
        schema: planSchema,
        telemetry: telemetryFor("plan-calendar"),
        system: PLAN_CALENDAR_PROMPT.system,
        prompt: planPrompt(input),
      });
      const pairings: SlotPairing[] = object.pairings.map((p) => ({
        type: p.type,
        topicId: p.topicId,
      }));
      return {
        pairings,
        usage: {
          model: PLAN_MODEL,
          tokensIn: usage.inputTokens ?? 0,
          tokensOut: usage.outputTokens ?? 0,
        },
      };
    },
    async draftStrategy(input: DraftStrategyInput) {
      const { object, usage } = await generateObject({
        model: vertex(STRATEGY_MODEL),
        schema: strategySchema,
        telemetry: telemetryFor("draft-strategy"),
        system: DRAFT_STRATEGY_PROMPT.system,
        prompt: strategyPrompt(input),
      });
      const sectionE: Record<string, string> = {};
      for (const e of object.sectionE) sectionE[e.channel] = e.instruction;
      const draft: StrategyDraft = {
        sectionA: object.sectionA,
        sectionB: object.sectionB,
        sectionD: object.sectionD,
        sectionE,
      };
      return {
        draft,
        usage: {
          model: STRATEGY_MODEL,
          tokensIn: usage.inputTokens ?? 0,
          tokensOut: usage.outputTokens ?? 0,
        },
      };
    },
    async groundedSearch(input: GroundedSearchInput) {
      // Pass 1: grounded search — Gemini + Google Search (IG-3). `sources` is the
      // grounding PROVENANCE (the URLs the retrieval actually cited), the R-4
      // anti-hallucination basis the caller's guard checks against.
      const grounded = await generateText({
        model: vertex(SEARCH_MODEL),
        tools: { google_search: vertex.tools.googleSearch({}) },
        telemetry: telemetryFor("radar-discover"),
        system: RADAR_DISCOVER_PROMPT.system,
        prompt: searchPrompt(input),
      });
      const sources = Array.from(
        new Set(
          (grounded.sources ?? []).flatMap((s) =>
            s.sourceType === "url" && typeof s.url === "string" ? [s.url] : [],
          ),
        ),
      );
      // Pass 2: structure the grounded findings into candidates that cite only the
      // provenance URLs (no grounding needed for structuring).
      const structured = await generateObject({
        model: vertex(SEARCH_MODEL),
        schema: candidatesSchema,
        telemetry: telemetryFor("radar-discover"),
        system: RADAR_DISCOVER_PROMPT.system,
        prompt:
          `${searchPrompt(input)}\n\nGROUNDED FINDINGS:\n${grounded.text}\n\n` +
          `SOURCE URLS (cite only these):\n${sources.join("\n") || "(none)"}`,
      });
      const candidates: SearchCandidate[] = structured.object.candidates.map((c) => {
        const cand: SearchCandidate = {
          source: c.source,
          url: c.url,
          title: c.title,
          summary: c.summary,
          relevanceRationale: c.relevanceRationale,
          topicId: c.topicId,
        };
        if (c.eventDate) cand.eventDate = c.eventDate;
        return cand;
      });
      return {
        result: { candidates, sources },
        usage: {
          model: SEARCH_MODEL,
          tokensIn: (grounded.usage.inputTokens ?? 0) + (structured.usage.inputTokens ?? 0),
          tokensOut: (grounded.usage.outputTokens ?? 0) + (structured.usage.outputTokens ?? 0),
        },
      };
    },
  };
}
