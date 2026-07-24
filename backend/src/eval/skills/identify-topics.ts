/**
 * Eval definition for the `identify-topics` Skill (EVS-2, ADR-0010) — scores the
 * TOPS-1 grounding discipline against a synthetic dataset (SEC-4). The teeth are
 * DETERMINISTIC (the evidence guard + the empty-Memory posture), so they hold on
 * the keyless dev stub. Rationale QUALITY (grounded vs plausibly-fabricated over
 * real ids) is the keyed catch-rate tier — a follow-on rationale judge, dormant
 * here (like the guardrail judge before its keyed activation).
 */

import type { CandidateTopic, LlmPort } from "../../ports/llm.js";
import { deriveTopics } from "../../topics/identify.js";
import type { CaseProvenance, SkillEvalDef } from "../types.js";

interface TopicCase {
  id: string;
  provenance: CaseProvenance;
  label: "populated" | "empty";
  grounding: string;
  groundingIds: string[];
}

const cases: TopicCase[] = [
  {
    id: "populated-1",
    provenance: "synthetic",
    label: "populated",
    grounding:
      "m1: Mission — we run a weekend food bank\nm2: Program — after-school tutoring\nm3: Story — 40 families served in June",
    groundingIds: ["m1", "m2", "m3"],
  },
  {
    id: "populated-2",
    provenance: "synthetic",
    label: "populated",
    grounding: "m9: Person — Maria, a two-year volunteer\nm10: Program — community garden",
    groundingIds: ["m9", "m10"],
  },
  {
    // A brand-new org with no grounding — must not fabricate topics (MEMS-4 posture).
    id: "empty-1",
    provenance: "synthetic",
    label: "empty",
    grounding: "",
    groundingIds: [],
  },
];

function run(port: LlmPort, c: TopicCase): Promise<CandidateTopic[]> {
  return deriveTopics(port, {
    orgId: "eval",
    grounding: c.grounding,
    groundingIds: c.groundingIds,
    existingThemes: [],
  });
}

type Row = { input: TopicCase; output: CandidateTopic[] };

export const identifyTopicsEval: SkillEvalDef<TopicCase, CandidateTopic[]> = {
  skill: "identify-topics",
  datasetVersion: 1,
  cases,
  run,
  scorers: [
    {
      // Deterministic (both tiers): every derived topic resolves into its grounding
      // — the evidence guard holds (LRN-20). Scored over all derived topics.
      name: "every-topic-grounded",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        let passed = 0;
        let total = 0;
        for (const { input, output } of rows) {
          const available = new Set(input.groundingIds);
          for (const t of output) {
            total++;
            if (
              t.evidenceMemoryIds.length > 0 &&
              t.evidenceMemoryIds.every((i) => available.has(i))
            )
              passed++;
          }
        }
        return { passed, total };
      },
    },
    {
      // Deterministic: a populated-Memory case yields at least one topic (auto-draft).
      name: "populated-yields-topics",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        const sub = rows.filter((r) => r.input.label === "populated");
        return { passed: sub.filter((r) => r.output.length > 0).length, total: sub.length };
      },
    },
    {
      // Deterministic: an empty-Memory org yields NO fabricated topics (MEMS-4 posture).
      name: "empty-memory-no-fabrication",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        const sub = rows.filter((r) => r.input.label === "empty");
        return { passed: sub.filter((r) => r.output.length === 0).length, total: sub.length };
      },
    },
  ],
};
