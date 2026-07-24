/**
 * @module @backend/adapters/llm/dev-stub
 *
 * The KEYLESS, deterministic LLM adapter (ADR-0003 self-contained dev / ADR-0008
 * "keyless dev fallback"). Selected automatically when no Vertex credentials are
 * present, so `npm run` dev + CI exercise the brain-spine WIRING without a GCP
 * account or cost. It is NOT semantically intelligent — it exercises the plumbing
 * deterministically; real recall/extraction quality is only on the keyed Vertex
 * path.
 *
 * Embedding: FEATURE HASHING — each token is hashed to a bucket in the
 * EMBEDDING_DIM space and accumulated, then L2-normalized. This is deterministic
 * AND monotone in shared vocabulary, so cosine distance still ranks texts that
 * share words closer — enough for retrieveContext (MEMS-4) to demonstrably rank
 * in a smoke test. Extraction: a small rule-based classifier (imperative/
 * preference cues → styleRule/taboo, else fact); the write path's MEMS-1/MEMS-5
 * policy is the real authority regardless.
 */
import {
  type DraftGenInput,
  EMBEDDING_DIM,
  type EmbedTaskType,
  type ExtractedEntry,
  type ExtractionContext,
  type GeneratedMaster,
  type GuardrailFinding,
  type RawLlmAdapter,
} from "../../ports/llm.js";

/** Synthetic token estimate for the free dev path (~4 chars/token). */
const estTokens = (text: string): number => Math.ceil(text.length / 4);

/** A stable 32-bit FNV-1a hash (deterministic across processes; no Math.random). */
function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Lowercase alphanumeric tokens, length ≥ 2 (a tiny, dependency-free tokenizer). */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);
}

/** Deterministic feature-hashed, L2-normalized embedding of `text`. */
function hashEmbedding(text: string): number[] {
  const vec = new Array<number>(EMBEDDING_DIM).fill(0);
  for (const token of tokenize(text)) {
    const h = fnv1a(token);
    const idx = h % EMBEDDING_DIM;
    // Signed bucket (second hash bit) reduces collisions cancelling systematically.
    const sign = (fnv1a(`sign:${token}`) & 1) === 0 ? 1 : -1;
    vec[idx] = (vec[idx] ?? 0) + sign;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  if (norm === 0) return vec; // empty/blank input → zero vector (retrieval treats as far)
  return vec.map((v) => v / norm);
}

const RULE_CUES = /\b(always|never|don'?t|do not|avoid|prefer|please|make sure|keep it|no more)\b/i;
const TABOO_CUES = /\b(never|don'?t|do not|avoid|no more|stop)\b/i;

/** Naive rule-based classification (a deterministic stand-in for the LLM step). */
function classify(rawInput: string, context: ExtractionContext): ExtractedEntry {
  const content = rawInput.trim();
  if (context.correctionChannel || RULE_CUES.test(content)) {
    return { kind: TABOO_CUES.test(content) ? "taboo" : "styleRule", content };
  }
  return { kind: "fact", content };
}

/**
 * The keyless dev/CI adapter (RawLlmAdapter). Emits no OTel telemetry (it makes
 * no provider call) and reports synthetic usage priced at 0 (dev is free), so
 * the observability pipeline is exercised with non-zero token counts + a real
 * (zero-cost) ModelCall row on the tested path.
 */
export const devStubLlm: RawLlmAdapter = {
  name: "dev-stub",
  async extract(rawInput, context) {
    const trimmed = rawInput.trim();
    const entries = trimmed.length === 0 ? [] : [classify(trimmed, context)];
    return {
      entries,
      usage: {
        model: "dev-stub",
        tokensIn: estTokens(trimmed),
        tokensOut: estTokens(JSON.stringify(entries)),
      },
    };
  },
  async embed(text, _taskType: EmbedTaskType) {
    return {
      vector: hashEmbedding(text),
      usage: { model: "dev-stub", tokensIn: estTokens(text), tokensOut: 0 },
    };
  },
  // Deterministic master generation (GENS-7 plumbing): the stub is NOT a writer —
  // it ECHOES the grounding into the body so the pipeline has real text to carry.
  // A regenerate visibly changes the output via the hint. Real drafting quality
  // (and the semantic guardrail judgment) is the keyed path.
  async generate(input: DraftGenInput) {
    const { slot, grounding, regenerateHint } = input;
    const body = [regenerateHint ? `[revised: ${regenerateHint}]` : "", grounding.trim()]
      .filter(Boolean)
      .join(" ")
      .trim();
    const master: GeneratedMaster = {
      title: slot.subject,
      body: body || slot.subject,
      reasonLine: `Planned for "${slot.subject}" (${slot.type}${slot.designation === "none" ? "" : `, ${slot.designation}`}).`,
    };
    return {
      master,
      usage: {
        model: "dev-stub",
        tokensIn: estTokens(grounding + slot.subject),
        tokensOut: estTokens(JSON.stringify(master)),
      },
    };
  },
  // The guardrail JUDGE, DORMANT (GENS-7 / LRN-20). Semantic guardrail detection
  // is intrinsically an LLM judgment — the keyless stub performs NONE (no regex,
  // no keyword scan of the content; `judged:false` tells the eval its content
  // catch-rates are dormant on this tier). The ONLY finding is the STRUCTURAL
  // GR-8 backstop: an active taboo overlay EXISTS (a count, not a content
  // reading) and a non-model stub cannot confidently clear it, so escalate —
  // a taboo draft is never silently auto-passed (MEM-1 / GR-8), safe by default.
  async judgeGuardrails(input) {
    const findings: GuardrailFinding[] = [];
    if (input.overlay.length > 0) {
      findings.push({
        guardrail: "GR-8",
        severity: "escalate",
        reason:
          "an active taboo/rule overlay is present; the keyless stub cannot confidently clear it (GR-8 backstop)",
      });
    }
    const text = `${input.master.title}\n${input.master.body}\n${input.master.reasonLine}`;
    return {
      judgment: { findings, judged: false },
      usage: { model: "dev-stub", tokensIn: estTokens(text), tokensOut: 0 },
    };
  },
};
