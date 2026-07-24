/**
 * Registry of Skill eval definitions (EVS-2). As each Skill gains a dataset, it
 * is registered here so `npm run eval` scores it and `npm run eval:gate` requires
 * a passing eval for the current harness version.
 */
import type { SkillEvalDef } from "../types.js";
import { extractMemoryEval } from "./extract-memory.js";
import { generateDraftEval } from "./generate-draft.js";

// biome-ignore lint/suspicious/noExplicitAny: heterogeneous registry — each entry's case/output types differ; the generic runner re-binds them per entry.
export const EVAL_SKILLS: SkillEvalDef<any, any>[] = [extractMemoryEval, generateDraftEval];

export const EVAL_SKILL_IDS: string[] = EVAL_SKILLS.map((d) => d.skill);
