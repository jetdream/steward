/**
 * The `generate-draft` SKILL (GENS-7 / PIPE-2) — grounded master generation
 * gated by the VAL guardrail chain, run through the ARC-27/PIPE-4 runtime so
 * every LLM call is attributed + cost-logged (PIPE-5) and eval-gated (ADR-0010).
 *
 * The core `generateDraft` is PURE over its grounding inputs (grounding string +
 * active overlay) so it is unit-testable and eval-runnable on the keyless tier;
 * `draftForSlot` wires the real MEMS-4 retrieval → generation seam that memory's
 * module note anticipated ("VAL-stage enforcement is delivered by GEN when that
 * vertical lands"). The bounded regenerate loop realizes the PIPE-4 agentPolicy
 * cap: a still-failing draft ESCALATES rather than looping.
 *
 * @implements GENS-7 v1  (grounded master generation through the VAL guardrail chain)
 */
import type { OrgId } from "@shared";
import { HARNESS } from "../harness/manifest.js";
import { runSkill } from "../harness/runtime.js";
import type { GroundedContext, Memory } from "../memory/index.js";
import type { ContentSlot, DraftGenInput, LlmPort } from "../ports/llm.js";
import { regenerateHint, resolveOutcome } from "./guardrails.js";
import type { DraftResult, ValReport } from "./types.js";

/** Everything `generateDraft` needs, grounding already assembled by the caller. */
export interface GenerateDraftInput {
  orgId: string;
  slot: ContentSlot;
  /** Assembled grounding text (Memory + Strategy) — the sole factual source (VAL-4). */
  grounding: string;
  /** The FULL active rule/taboo overlay (MEMS-3), routed to the VAL chain. */
  overlay: string[];
  /** External-sourced content triggers the GR-5 citation check. Default false. */
  isExternal?: boolean;
  /** Optional trajectory run id (eval / observability). */
  runId?: string;
}

/**
 * Generate a grounded master for a slot and gate it through the VAL chain, with a
 * bounded regenerate loop (GENS-7). Returns the master, its VAL verdict, and the
 * attempts used. A `pass` is queue-eligible (subject to the picture gate, GENS-3);
 * an `escalate` forces human approval regardless of Trust Level (GR-3/GR-8).
 */
export async function generateDraft(
  port: LlmPort,
  input: GenerateDraftInput,
): Promise<DraftResult> {
  const maxRegenerate = HARNESS["generate-draft"]?.agentPolicy.maxRegenerate ?? 0;
  const isExternal = input.isExternal ?? false;
  let attempts = 0;
  let hint: string | undefined;

  // Bounded VAL-driven regenerate loop (PIPE-2 / PIPE-4 agentPolicy cap).
  for (;;) {
    attempts++;
    const genInput: DraftGenInput = {
      slot: input.slot,
      grounding: input.grounding,
      overlay: input.overlay,
      ...(hint ? { regenerateHint: hint } : {}),
    };
    const skillCtx = {
      orgId: input.orgId,
      ...(input.runId ? { runId: input.runId } : {}),
    };
    // GENERATE the master (the generate-draft Skill)...
    const master = await runSkill({ ...skillCtx, skillId: "generate-draft" }, () =>
      port.generateDraft(genInput),
    );
    // ...then JUDGE it semantically (the guardrail-check Skill — LLM, not regex).
    const judgment = await runSkill({ ...skillCtx, skillId: "guardrail-check" }, () =>
      port.checkGuardrails({ master, overlay: input.overlay, isExternal }),
    );

    const base = { findings: judgment.findings, judged: judgment.judged };
    const outcome = resolveOutcome(judgment.findings);

    // Terminal outcomes: pass (queue-eligible) or escalate (force human approval).
    if (outcome === "pass" || outcome === "escalate") {
      return { master, val: { outcome, ...base }, attempts };
    }

    // outcome === "regenerate": past the cap, escalate rather than loop (PIPE-4).
    if (attempts > maxRegenerate) {
      const val: ValReport = {
        outcome: "escalate",
        ...base,
        note: `regenerate cap (${maxRegenerate}) reached — escalated to human approval (PIPE-4)`,
      };
      return { master, val, attempts };
    }
    hint = regenerateHint(judgment.findings);
  }
}

/**
 * Flatten a MEMS-4 grounded package into the generator's grounding string + the
 * active overlay string list. Pure — the retrieve→generate seam mapping.
 */
export function assembleGrounding(ctx: GroundedContext): { grounding: string; overlay: string[] } {
  const grounding = ctx.grounding
    .map((e) => (e.subject ? `${e.subject}: ${e.content}` : e.content))
    .join("\n");
  // Taboos first (MEMS-2 precedence), then style rules — the full active set.
  const overlay = [...ctx.overlay.taboos, ...ctx.overlay.styleRules].map((e) =>
    e.subject ? `${e.subject}: ${e.content}` : e.content,
  );
  return { grounding, overlay };
}

/**
 * The real MEMS-4 → GENS-7 path: retrieve the grounded context for the slot's
 * subject, then generate + VAL-gate. Thin Memory (a brand-new org) still yields a
 * grounded draft — the generator draws on whatever is present and never fabricates
 * (VAL-4); the empty-memory posture is MEMS-4's responsibility, not this seam's.
 */
export async function draftForSlot(
  memory: Memory,
  port: LlmPort,
  orgId: OrgId,
  slot: ContentSlot,
  opts: { isExternal?: boolean; runId?: string } = {},
): Promise<DraftResult> {
  const ctx = await memory.retrieveContext(orgId, slot.subject);
  const { grounding, overlay } = assembleGrounding(ctx);
  return generateDraft(port, {
    orgId,
    slot,
    grounding,
    overlay,
    ...(opts.isExternal !== undefined ? { isExternal: opts.isExternal } : {}),
    ...(opts.runId ? { runId: opts.runId } : {}),
  });
}
