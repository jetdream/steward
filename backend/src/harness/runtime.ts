/**
 * @module @backend/harness/runtime
 *
 * The agent runtime assembler (ARC-27 / PIPE-4), minimal form (B5). `runSkill`
 * binds the observability context for a Skill invocation — the skill id, its
 * manifest prompt version, and an optional trajectory run id — so every LLM call
 * underneath is attributed + cost-logged (PIPE-5) to that Skill. Today it is
 * SINGLE-SHOT (`maxSteps: 1` for every Skill): it binds context and runs the
 * body once.
 *
 * DEFERRED to GEN (its first consumer): the bounded multi-step tool-calling loop
 * (plan → call tool → observe → repeat → finalize), the tool registry, and the
 * VAL guardrail chain. This function is the seam they extend — the body it runs
 * becomes the loop, bounded by the Skill's agentPolicy.
 */
import { withObsContext } from "../observability/context.js";
import { HARNESS } from "./manifest.js";

/** Identifies a Skill invocation for an org (+ an optional trajectory run). */
export interface SkillContext {
  orgId: string;
  /** A key in the HARNESS manifest (e.g. "extract-memory", "retrieve-memory"). */
  skillId: string;
  runId?: string;
}

/** Run a single-shot Skill body under its bound observability context. */
export function runSkill<T>(ctx: SkillContext, body: () => Promise<T>): Promise<T> {
  const entry = HARNESS[ctx.skillId];
  return withObsContext(
    {
      orgId: ctx.orgId,
      skill: ctx.skillId,
      ...(entry?.promptRef ? { promptVersion: entry.promptRef } : {}),
      ...(ctx.runId ? { runId: ctx.runId } : {}),
    },
    body,
  );
}
