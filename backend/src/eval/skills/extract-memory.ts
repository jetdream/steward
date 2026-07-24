/**
 * Eval definition for the `extract-memory` Skill (EVS-2, ADR-0010). Scores the
 * extraction harness (prompt+model, run via runSkill) + the MEMS-1
 * correction-channel policy against a synthetic, de-identified dataset (SEC-4 —
 * no real org content).
 *
 * Keyless (dev-stub) it exercises the framework + the DETERMINISTIC write-path
 * policy (correction-channel → never a bare fact); the CATCH-RATE metric becomes
 * a real LLM-quality signal only on the KEYED (Gemini) tier — untested until
 * creds land, like the rest of the Vertex path.
 */
import type { MemoryEntryKind } from "@shared";
import { runSkill } from "../../harness/runtime.js";
import { applyCorrectionPolicy } from "../../memory/write.js";
import type { LlmPort } from "../../ports/llm.js";
import type { CaseProvenance, SkillEvalDef } from "../types.js";

interface ExtractCase {
  id: string;
  /** SEC-4: every in-repo case is synthetic/curated/de-identified — never org-sourced. */
  provenance: CaseProvenance;
  rawInput: string;
  correctionChannel: boolean;
  /** The kind the extraction + MEMS-1 policy should yield. */
  expectKind: MemoryEntryKind;
}

/** Synthetic cases (SEC-4). Golden (free channel) + adversarial (correction). */
const cases: ExtractCase[] = [
  {
    id: "g1",
    provenance: "synthetic",
    rawInput: "we run a weekend food bank",
    correctionChannel: false,
    expectKind: "fact",
  },
  {
    id: "g2",
    provenance: "synthetic",
    rawInput: "always keep posts warm and personal",
    correctionChannel: false,
    expectKind: "styleRule",
  },
  {
    id: "g3",
    provenance: "synthetic",
    rawInput: "never post about partisan politics",
    correctionChannel: false,
    expectKind: "taboo",
  },
  // Adversarial: on a CORRECTION channel, input that reads factual must NOT be a
  // bare fact — the MEMS-1 policy forces a styleRule/taboo.
  {
    id: "a1",
    provenance: "synthetic",
    rawInput: "keep it short on X",
    correctionChannel: true,
    expectKind: "styleRule",
  },
  {
    id: "a2",
    provenance: "synthetic",
    rawInput: "do not name individual donors",
    correctionChannel: true,
    expectKind: "taboo",
  },
];

/** Run the extraction harness for a case → the final classified kind (post-policy). */
async function run(port: LlmPort, c: ExtractCase): Promise<MemoryEntryKind | undefined> {
  const entries = await runSkill({ orgId: "eval", skillId: "extract-memory" }, () =>
    port.extractEntries(c.rawInput, { correctionChannel: c.correctionChannel }),
  );
  const first = entries[0];
  if (!first) return undefined;
  return applyCorrectionPolicy(first.kind, first.content, c.correctionChannel);
}

export const extractMemoryEval: SkillEvalDef<ExtractCase, MemoryEntryKind | undefined> = {
  skill: "extract-memory",
  datasetVersion: 1,
  cases,
  run,
  scorers: [
    {
      name: "kind-match",
      kind: "deterministic",
      target: 1.0,
      evaluate: (scored) => ({
        passed: scored.filter((s) => s.output === s.input.expectKind).length,
        total: scored.length,
      }),
    },
    {
      // The MEMS-1 invariant: correction-channel input is never stored as a bare fact.
      name: "correction-never-bare-fact",
      kind: "catch-rate",
      target: 1.0,
      evaluate: (scored) => {
        const corr = scored.filter((s) => s.input.correctionChannel);
        return {
          passed: corr.filter((s) => s.output === "styleRule" || s.output === "taboo").length,
          total: corr.length,
        };
      },
    },
  ],
};
