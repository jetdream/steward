/**
 * Eval definition for the `radar-discover` Skill (EVS-2, ADR-0010) — scores the
 * EXTS-1 discovery discipline against a synthetic dataset (SEC-4). The teeth are
 * DETERMINISTIC structural invariants that must hold on BOTH tiers: every emitted
 * candidate is provenance-bound (its URL is in the grounding `sources`) and answers
 * an agenda topic. Real relevance quality (are the picks genuinely on-mission) is
 * the keyed catch-rate tier — a follow-on judge + the R-4 precision review, dormant
 * here.
 */
import type { GroundedSearchResult, LlmPort } from "../../ports/llm.js";
import type { CaseProvenance, SkillEvalDef } from "../types.js";

interface RadarCase {
  id: string;
  provenance: CaseProvenance;
  topics: { id: string; description: string }[];
  geography: string;
}

const cases: RadarCase[] = [
  {
    id: "foodbank",
    provenance: "synthetic",
    topics: [
      { id: "t1", description: "local food insecurity and hunger relief" },
      { id: "t2", description: "volunteer community events" },
    ],
    geography: "a US county",
  },
  {
    id: "shelter",
    provenance: "synthetic",
    topics: [{ id: "t9", description: "animal rescue and adoption" }],
    geography: "a US state",
  },
];

function run(port: LlmPort, c: RadarCase): Promise<GroundedSearchResult> {
  return port.groundedSearch({ topics: c.topics, geography: c.geography, count: 5 });
}

type Row = { input: RadarCase; output: GroundedSearchResult };

export const radarDiscoverEval: SkillEvalDef<RadarCase, GroundedSearchResult> = {
  skill: "radar-discover",
  datasetVersion: 1,
  cases,
  run,
  scorers: [
    {
      // Deterministic (both tiers): every candidate is provenance-bound — its URL is
      // one the grounding actually cited (the R-4 anti-hallucination basis, EXTS-1).
      name: "candidates-provenance-bound",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        let passed = 0;
        let total = 0;
        for (const { output } of rows) {
          const sources = new Set(output.sources);
          for (const c of output.candidates) {
            total++;
            if (sources.has(c.url)) passed++;
          }
        }
        return { passed, total };
      },
    },
    {
      // Deterministic: every candidate answers one of the supplied agenda topics
      // (agenda-driven, never a static seed — EXTS-1 / TOPS-2).
      name: "candidates-on-agenda",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        let passed = 0;
        let total = 0;
        for (const { input, output } of rows) {
          const ids = new Set(input.topics.map((t) => t.id));
          for (const c of output.candidates) {
            total++;
            if (ids.has(c.topicId)) passed++;
          }
        }
        return { passed, total };
      },
    },
  ],
};
