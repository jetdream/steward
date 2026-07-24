/**
 * Eval definition for the `interview-questions` Skill (EVS-2, ADR-0010) — scores
 * the INTS-1 gap-driven questioning against a synthetic dataset (SEC-4). The teeth
 * are DETERMINISTIC structural invariants (questions tie to the supplied open gaps;
 * open gaps yield questions), holding on both tiers. Conversational QUALITY (open,
 * story-seeking phrasing) is the keyed catch-rate tier — a follow-on judge, dormant.
 */
import type { InterviewQuestion, LlmPort } from "../../ports/llm.js";
import type { CaseProvenance, SkillEvalDef } from "../types.js";

interface InterviewCase {
  id: string;
  provenance: CaseProvenance;
  grounding: string;
  openGaps: { category: string; why: string }[];
}

const cases: InterviewCase[] = [
  {
    id: "thin-profile",
    provenance: "synthetic",
    grounding: "fact: we run a weekend food bank",
    openGaps: [
      { category: "people", why: "naming the people lets drafts credit and quote them" },
      { category: "stories", why: "concrete stories are what make a post land" },
    ],
  },
  {
    id: "needs-style",
    provenance: "synthetic",
    grounding: "fact: an after-school tutoring program\nperson: Maria, volunteer",
    openGaps: [{ category: "style", why: "your voice keeps drafts sounding like you" }],
  },
];

function run(port: LlmPort, c: InterviewCase): Promise<InterviewQuestion[]> {
  return port.interviewQuestions({ grounding: c.grounding, openGaps: c.openGaps, count: 3 });
}

type Row = { input: InterviewCase; output: InterviewQuestion[] };

export const interviewQuestionsEval: SkillEvalDef<InterviewCase, InterviewQuestion[]> = {
  skill: "interview-questions",
  datasetVersion: 1,
  cases,
  run,
  scorers: [
    {
      // Deterministic (both tiers): every question ties to one of the supplied OPEN
      // gaps — the interviewer asks about what THIS org is missing (INTS-1), never
      // a generic script or a resolved gap (MEMS-6).
      name: "questions-tie-to-open-gaps",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        let passed = 0;
        let total = 0;
        for (const { input, output } of rows) {
          const cats = new Set(input.openGaps.map((g) => g.category));
          for (const q of output) {
            total++;
            if (cats.has(q.gapCategory)) passed++;
          }
        }
        return { passed, total };
      },
    },
    {
      // Deterministic: when gaps are open, the interviewer asks (never silent).
      name: "open-gaps-yield-questions",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        const sub = rows.filter((r) => r.input.openGaps.length > 0);
        return { passed: sub.filter((r) => r.output.length > 0).length, total: sub.length };
      },
    },
  ],
};
