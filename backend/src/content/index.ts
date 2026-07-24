/**
 * @module @backend/content (ARC-15 — the Content Engine)
 *
 * The hub that turns Memory + Strategy + the editorial agenda + the Radar into a
 * steady, on-mission publishing rhythm (GEN). It is the single owner of
 * GENERATION — the founder-authored composer (APRS-5) and external drafts
 * (PIPE-3) enter the SAME chain, authorship is never a bypass (GENS-7).
 *
 * G1 slice (the first heavy Skill on the ARC-27/PIPE-4 substrate): the
 * `generate-draft` Skill — grounded master generation gated by the reusable VAL
 * guardrail chain (PIPE-2). This is where the deferred PIPE-4 `guardrailChain`
 * substrate comes into existence, evaluated day-one (ADR-0010).
 *
 * @implements GENS-7 v1  (grounded master generation through the VAL guardrail chain — generate.ts, guardrails.ts)
 *
 * Guardrail DETECTION is the `guardrail-check` LLM Skill (LRN-20 — a semantic
 * judgment, never a regex heuristic); `guardrails.ts` is the pure POLICY over its
 * findings.
 *
 * DEFERRED to later GEN slices (each its own Skill + eval on this substrate):
 * GENS-1 the rolling planner (needs STRS + TOPS), GENS-2 per-channel adaptation,
 * GENS-3/GENS-4 the picture gate + awaiting-picture state, GENS-5 the channel-fit
 * gate, GENS-6 performance feedback. G1b added DM-5 ContentItem PERSISTENCE
 * (store.ts, master-only); the ChannelVariant table lands with G2.
 */

export type { GenerateDraftInput } from "./generate.js";
export { assembleGrounding, draftForSlot, generateDraft } from "./generate.js";
export { regenerateHint, resolveOutcome } from "./guardrails.js";
export type { PersistDraftInput } from "./store.js";
export { getContentItem, listContentItems, persistDraft } from "./store.js";
export type { DraftResult, ValOutcome, ValReport } from "./types.js";
