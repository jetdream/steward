/**
 * Eval definition for the `adapt-variant` Skill (EVS-2, ADR-0010) — scores GENS-2
 * adaptation against a synthetic dataset (SEC-4). The deterministic teeth (holding
 * on both tiers): adaptation produces a non-empty variant body. Fidelity (no new
 * facts) + true within-limit adherence are the keyed catch-rate tier (the fit gate
 * GENS-5 is the deterministic backstop that skips an over-limit variant regardless).
 */
import type { AdaptVariantInput, LlmPort } from "../../ports/llm.js";
import type { CaseProvenance, SkillEvalDef } from "../types.js";

interface AdaptCase {
  id: string;
  provenance: CaseProvenance;
  input: AdaptVariantInput;
}

const master = {
  title: "Nourishing Our Community",
  body: "This weekend our food bank served 40 families so no one goes hungry.",
  reasonLine: "impact update",
};

const cases: AdaptCase[] = [
  {
    id: "x-short",
    provenance: "synthetic",
    input: { master, platform: "x", maxChars: 280, channelInstruction: "punchy" },
  },
  {
    id: "fb-long",
    provenance: "synthetic",
    input: { master, platform: "facebook_page", maxChars: 63206, channelInstruction: "" },
  },
];

function run(port: LlmPort, c: AdaptCase): Promise<string> {
  return port.adaptVariant(c.input);
}

type Row = { input: AdaptCase; output: string };

export const adaptVariantEval: SkillEvalDef<AdaptCase, string> = {
  skill: "adapt-variant",
  datasetVersion: 1,
  cases,
  run,
  scorers: [
    {
      // Deterministic (both tiers): adaptation yields a non-empty variant body.
      name: "produces-a-variant",
      kind: "deterministic",
      target: 1.0,
      evaluate: (rows: Row[]) => ({
        passed: rows.filter((r) => r.output.trim().length > 0).length,
        total: rows.length,
      }),
    },
  ],
};
