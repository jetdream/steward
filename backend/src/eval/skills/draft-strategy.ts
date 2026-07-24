/**
 * Eval definition for the `draft-strategy` Skill (EVS-2, ADR-0010) — scores the
 * STRS-2 auto-draft against a synthetic dataset (SEC-4). The teeth are
 * DETERMINISTIC structural completeness (all core sections present; every named
 * channel gets a section-(e) entry), so they hold on the keyless dev stub. Draft
 * QUALITY (grounded voice vs generic) is the keyed catch-rate tier — a follow-on
 * judge, dormant here.
 */
import type { LlmPort, StrategyDraft } from "../../ports/llm.js";
import type { CaseProvenance, SkillEvalDef } from "../types.js";

interface StrategyCase {
  id: string;
  provenance: CaseProvenance;
  grounding: string;
  channels: string[];
}

const cases: StrategyCase[] = [
  {
    id: "foodbank",
    provenance: "synthetic",
    grounding:
      "fact: we run a weekend food bank\nprogram: after-school tutoring\nstyleRule: warm, plain-spoken voice",
    channels: ["fb", "ig"],
  },
  {
    id: "shelter",
    provenance: "synthetic",
    grounding: "fact: an animal shelter placing rescue dogs\nperson: Sam, our lead volunteer",
    channels: ["fb", "x"],
  },
];

function run(port: LlmPort, c: StrategyCase): Promise<StrategyDraft> {
  return port.draftStrategy({ grounding: c.grounding, channels: c.channels });
}

type Row = { input: StrategyCase; output: StrategyDraft };

export const draftStrategyEval: SkillEvalDef<StrategyCase, StrategyDraft> = {
  skill: "draft-strategy",
  datasetVersion: 1,
  cases,
  run,
  scorers: [
    {
      // Deterministic (both tiers): the three prose sections (a/b/d) are all drafted.
      name: "core-sections-present",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        let passed = 0;
        let total = 0;
        for (const { output } of rows) {
          total++;
          if (output.sectionA.trim() && output.sectionB.trim() && output.sectionD.trim()) passed++;
        }
        return { passed, total };
      },
    },
    {
      // Deterministic: every requested channel gets a section-(e) instruction.
      name: "every-channel-covered",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        let passed = 0;
        let total = 0;
        for (const { input, output } of rows) {
          for (const ch of input.channels) {
            total++;
            if ((output.sectionE[ch] ?? "").trim().length > 0) passed++;
          }
        }
        return { passed, total };
      },
    },
  ],
};
