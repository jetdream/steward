/**
 * The `identify-topics` SKILL (TOPS-1) — grounded editorial-agenda identification
 * run through the ARC-27/PIPE-4 runtime (attributed + cost-logged, PIPE-5) and
 * eval-gated (ADR-0010).
 *
 * The LLM proposes candidate topics grounded in Memory; the DETERMINISTIC
 * EVIDENCE GUARD then drops any topic whose cited evidence does not RESOLVE into
 * the grounding set (LRN-20 — the deterministic half; rationale quality is the
 * keyed catch-rate tier). `deriveTopics` is pure over its grounding inputs (eval-
 * runnable, keyless); `identifyForOrg` wires the MEMS listGrounding → identify →
 * guard path.
 *
 * @implements TOPS-1 v1  (grounded topic identification + the evidence guard)
 */
import type { OrgId } from "@shared";
import { runSkill } from "../harness/runtime.js";
import type { Memory } from "../memory/index.js";
import type { CandidateTopic, LlmPort, TopicIdInput } from "../ports/llm.js";

/**
 * The DETERMINISTIC grounding guard (TOPS-1 / LRN-20): keep only topics whose
 * evidence resolves into the available grounding ids, and narrow each topic's
 * evidence to that resolvable subset. A topic with no resolvable pointer is
 * dropped — never persisted. Pure set membership, no content heuristic.
 */
export function applyEvidenceGuard(
  candidates: CandidateTopic[],
  groundingIds: string[],
): CandidateTopic[] {
  const available = new Set(groundingIds);
  const guarded: CandidateTopic[] = [];
  for (const c of candidates) {
    const resolvable = c.evidenceMemoryIds.filter((id) => available.has(id));
    if (resolvable.length > 0) guarded.push({ ...c, evidenceMemoryIds: resolvable });
  }
  return guarded;
}

/** What `deriveTopics` needs, grounding already assembled (eval-runnable, no DB). */
export interface DeriveTopicsInput extends TopicIdInput {
  orgId: string;
  runId?: string;
}

/**
 * Run the identify-topics Skill and apply the evidence guard → the grounded,
 * guarded candidate set (not yet persisted). Pure over its inputs.
 */
export async function deriveTopics(
  port: LlmPort,
  input: DeriveTopicsInput,
): Promise<CandidateTopic[]> {
  const candidates = await runSkill(
    {
      orgId: input.orgId,
      skillId: "identify-topics",
      ...(input.runId ? { runId: input.runId } : {}),
    },
    () =>
      port.identifyTopics({
        grounding: input.grounding,
        groundingIds: input.groundingIds,
        existingThemes: input.existingThemes,
      }),
  );
  return applyEvidenceGuard(candidates, input.groundingIds);
}

/** Format an active grounding entry as one groundable, id-tagged line for the prompt. */
function groundingLine(e: { id: string; subject: string | null; content: string }): string {
  return `${e.id}: ${e.subject ? `${e.subject} — ` : ""}${e.content}`;
}

/**
 * The wired MEMS → TOPS-1 path: read the org's active grounding (broad, not
 * similarity), identify topics against the current agenda, apply the guard, and
 * return the guarded candidates. Thin Memory (a brand-new org) simply yields
 * fewer / cause-level candidates — MEMS owns the empty-memory posture (MEMS-4);
 * the guard ensures nothing ungrounded is produced. Persistence is the caller's
 * (`persistTopics`).
 */
export async function identifyForOrg(
  deps: { memory: Memory; port: LlmPort },
  orgId: OrgId,
  existingThemes: string[],
): Promise<CandidateTopic[]> {
  const grounding = await deps.memory.listGrounding(orgId);
  return deriveTopics(deps.port, {
    orgId,
    grounding: grounding.map(groundingLine).join("\n"),
    groundingIds: grounding.map((e) => e.id),
    existingThemes,
  });
}
