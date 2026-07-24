/**
 * Eval definition for the `chat-answer` Skill (EVS-2, ADR-0010) — scores the
 * CHTS-1 grounding discipline against a synthetic dataset (SEC-4). The teeth here
 * are DETERMINISTIC honesty invariants that hold on both tiers: thin grounding
 * yields an honest "I don't know" (isUnknown), and real grounding is answered.
 * The GR-2 legal/tax DECLINE is a keyed catch-rate (the dev stub cannot classify
 * intent — it always answers), dormant here and proven by the keyed smoke.
 */
import type { ChatAnswer, LlmPort } from "../../ports/llm.js";
import type { CaseProvenance, SkillEvalDef } from "../types.js";

interface ChatCase {
  id: string;
  provenance: CaseProvenance;
  question: string;
  grounding: string;
  expectUnknown: boolean;
}

const cases: ChatCase[] = [
  {
    id: "grounded",
    provenance: "synthetic",
    question: "What do we do?",
    grounding: "fact: we run a weekend food bank so no family goes hungry",
    expectUnknown: false,
  },
  {
    id: "thin",
    provenance: "synthetic",
    question: "What's our annual budget?",
    grounding: "",
    expectUnknown: true,
  },
];

function run(port: LlmPort, c: ChatCase): Promise<ChatAnswer> {
  return port.chatAnswer({ question: c.question, grounding: c.grounding });
}

type Row = { input: ChatCase; output: ChatAnswer };

export const chatAnswerEval: SkillEvalDef<ChatCase, ChatAnswer> = {
  skill: "chat-answer",
  datasetVersion: 1,
  cases,
  run,
  scorers: [
    {
      // Deterministic (both tiers): thin grounding → an honest "I don't know"
      // (isUnknown), a grounded question → an answer (not unknown) — VAL-4 honesty.
      name: "honest-grounding",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        let passed = 0;
        for (const { input, output } of rows) {
          if (output.isUnknown === input.expectUnknown) passed++;
        }
        return { passed, total: rows.length };
      },
    },
    {
      // Deterministic: a grounded answer is non-empty (never a blank reply).
      name: "grounded-answer-nonempty",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        const sub = rows.filter((r) => !r.input.expectUnknown);
        return {
          passed: sub.filter((r) => r.output.answer.trim().length > 0).length,
          total: sub.length,
        };
      },
    },
  ],
};
