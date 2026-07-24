/**
 * @module @backend/harness/manifest
 *
 * The HARNESS MANIFEST (ARC-27 / PIPE-4): the single source mapping each Skill
 * to its versioned harness — prompt reference, model, and bounded agent policy.
 * A change to any harness artifact (a prompt version, a model, a policy) changes
 * `harnessManifestHash()`, which the ADR-0010 regression gate (B6) keys on: a
 * harness change with no passing eval on record cannot merge.
 *
 * SCOPE (B5, DEC-41 minimal-harness decision): today every Skill is single-shot
 * (`maxSteps: 1`). The multi-step tool-calling loop + the tool registry + the VAL
 * guardrail chain land with GEN — their first real consumer — not here.
 */
import { createHash } from "node:crypto";
import { EXTRACT_MEMORY_PROMPT, EXTRACT_MEMORY_PROMPT_REF } from "./prompts/extract-memory.js";
import { GENERATE_DRAFT_PROMPT, GENERATE_DRAFT_PROMPT_REF } from "./prompts/generate-draft.js";
import { GUARDRAIL_CHECK_PROMPT, GUARDRAIL_CHECK_PROMPT_REF } from "./prompts/guardrail-check.js";

/** The bound on a Skill's runtime (PIPE-4). `maxSteps: 1` ⇒ a single-shot skill. */
export interface AgentPolicy {
  maxSteps: number;
  /** Per-invocation cost ceiling (USD), tied to the PIPE-1 COGS target. */
  costBudgetUsd?: number;
  /**
   * The bound on the PIPE-2 VAL-driven REGENERATE loop (GENS-7): after this many
   * regenerate attempts a still-failing draft ESCALATES rather than looping —
   * "unbounded loops are structurally impossible" (PIPE-4). Absent ⇒ 0 (no
   * regenerate; a violation escalates immediately).
   */
  maxRegenerate?: number;
}

/** One Skill's harness: what prompt + model + policy the runtime assembles. */
export interface HarnessEntry {
  /** Versioned prompt ref (`id@version`), or null for a promptless op (embedding). */
  promptRef: string | null;
  /** The prompt system text, or null — the versioned artifact body. */
  promptSystem: string | null;
  /** The model id (ADR-0008). */
  model: string;
  agentPolicy: AgentPolicy;
}

/** The manifest — insertion order is stable, so `harnessManifestHash()` is deterministic. */
export const HARNESS: Record<string, HarnessEntry> = {
  "extract-memory": {
    promptRef: EXTRACT_MEMORY_PROMPT_REF,
    promptSystem: EXTRACT_MEMORY_PROMPT.system,
    model: "gemini-2.5-flash",
    agentPolicy: { maxSteps: 1, costBudgetUsd: 0.05 },
  },
  "retrieve-memory": {
    promptRef: null,
    promptSystem: null,
    model: "gemini-embedding-2",
    agentPolicy: { maxSteps: 1 },
  },
  "generate-draft": {
    promptRef: GENERATE_DRAFT_PROMPT_REF,
    promptSystem: GENERATE_DRAFT_PROMPT.system,
    model: "gemini-2.5-flash",
    // Single-shot generation (maxSteps: 1) with a bounded VAL regenerate loop
    // (GENS-7 / PIPE-2): up to 2 regenerate attempts, then escalate.
    agentPolicy: { maxSteps: 1, costBudgetUsd: 0.1, maxRegenerate: 2 },
  },
  "guardrail-check": {
    // The semantic VAL guardrail judge (GENS-7 / LRN-20) — LLM detection, not
    // regex. Cheap model; single-shot classification.
    promptRef: GUARDRAIL_CHECK_PROMPT_REF,
    promptSystem: GUARDRAIL_CHECK_PROMPT.system,
    model: "gemini-2.5-flash",
    agentPolicy: { maxSteps: 1, costBudgetUsd: 0.02 },
  },
};

/**
 * A stable short hash of the whole harness (prompts + versions + models +
 * policy). The ADR-0010 CI check compares it against the last-evaluated hash to
 * detect an un-evaluated harness change (B6 consumes this).
 */
export function harnessManifestHash(): string {
  return createHash("sha256").update(JSON.stringify(HARNESS)).digest("hex").slice(0, 16);
}
