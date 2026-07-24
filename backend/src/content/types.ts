/**
 * @module @backend/content/types
 *
 * The VAL chain outcome + draft contract types (GENS-7 / PIPE-2). Guardrail
 * DETECTION is the LLM judge (`GuardrailFinding` from the port, LRN-20 — never a
 * regex heuristic); this module's chain is the deterministic POLICY that turns
 * findings into an outcome and drives the bounded regenerate loop.
 */
import type { ValOutcome } from "@shared";
import type { GuardrailFinding } from "../ports/llm.js";

export type { ValOutcome };

/** The VAL chain's verdict on a master (PIPE-2). */
export interface ValReport {
  outcome: ValOutcome;
  /** The guardrail judge's findings (empty ⇒ nothing flagged). */
  findings: GuardrailFinding[];
  /**
   * Whether the LLM guardrail judge actually RAN (keyed tier) vs was DORMANT
   * (keyless dev stub). The eval treats content catch-rates as dormant when
   * false — only the structural GR-8 backstop fires on the keyless tier (LRN-20).
   */
  judged: boolean;
  /** Set when the outcome is forced by the PIPE-4 regenerate-cap backstop. */
  note?: string;
}

/** The generateDraft result (GENS-7): the master, its VAL verdict, and attempts used. */
export interface DraftResult {
  master: import("../ports/llm.js").GeneratedMaster;
  val: ValReport;
  /** Total generations run (1 + VAL-driven regenerates), bounded by the policy. */
  attempts: number;
}
