/**
 * Eval definition for the `plan-calendar` Skill (EVS-2, ADR-0010) — scores the
 * GENS-1 planner against a synthetic dataset (SEC-4). The teeth are DETERMINISTIC
 * (the agenda/taxonomy guard + the mix-quota designation engine), so they hold on
 * the keyless dev stub. Pairing QUALITY (does the model pick a good, varied
 * type×subject mix) is the keyed tier — dormant here.
 */
import { INTERNAL_TYPES, type PlannedSlot, planCalendar } from "../../content/planner.js";
import type { LlmPort } from "../../ports/llm.js";
import type { CaseProvenance, SkillEvalDef } from "../types.js";

interface PlanCase {
  id: string;
  provenance: CaseProvenance;
  label: "populated" | "empty";
  agenda: { id: string; description: string }[];
}

// A fixed start date keeps the plan deterministic across eval runs.
const START = new Date("2026-03-01T00:00:00.000Z");

const cases: PlanCase[] = [
  {
    id: "populated-1",
    provenance: "synthetic",
    label: "populated",
    agenda: [
      { id: "t1", description: "our weekend food bank" },
      { id: "t2", description: "volunteer stories" },
      { id: "t3", description: "after-school tutoring outcomes" },
    ],
  },
  {
    id: "populated-2",
    provenance: "synthetic",
    label: "populated",
    agenda: [{ id: "a1", description: "community garden" }],
  },
  {
    id: "empty-1",
    provenance: "synthetic",
    label: "empty",
    agenda: [],
  },
];

function run(port: LlmPort, c: PlanCase): Promise<PlannedSlot[]> {
  return planCalendar(port, { orgId: "eval", agenda: c.agenda, history: [], startDate: START });
}

type Row = { input: PlanCase; output: PlannedSlot[] };
const internal = new Set(INTERNAL_TYPES);

export const planCalendarEval: SkillEvalDef<PlanCase, PlannedSlot[]> = {
  skill: "plan-calendar",
  datasetVersion: 1,
  cases,
  run,
  scorers: [
    {
      // Deterministic: every slot's subject resolves to an agenda topic AND its
      // type is an allowed internal taxonomy type (the guard held). Over all slots.
      name: "every-slot-grounded",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        let passed = 0;
        let total = 0;
        for (const { input, output } of rows) {
          const ids = new Set(input.agenda.map((t) => t.id));
          for (const s of output) {
            total++;
            if (ids.has(s.topicId) && internal.has(s.type) && s.subject.length > 0) passed++;
          }
        }
        return { passed, total };
      },
    },
    {
      // Deterministic (STW-1): a populated agenda with empty history yields ≥1
      // impact/gratitude slot in the 28-day plan (the rhythm floor).
      name: "impact-rhythm-floor",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        const sub = rows.filter((r) => r.input.label === "populated");
        return {
          passed: sub.filter((r) => r.output.some((s) => s.designation === "impact_gratitude"))
            .length,
          total: sub.length,
        };
      },
    },
    {
      // Deterministic (GEN-1): designated fundraising asks never exceed 25% of the plan.
      name: "asks-within-cap",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => {
        let passed = 0;
        for (const { output } of rows) {
          const asks = output.filter((s) => s.designation === "fundraising_ask").length;
          if (output.length === 0 || asks / output.length <= 0.25) passed++;
        }
        return { passed, total: rows.length };
      },
    },
  ],
};
