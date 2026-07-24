/**
 * The VAL guardrail-chain POLICY (GENS-7 / PIPE-2) — the reusable guardrail stage
 * every generated master flows through before any queue, and the `guardrailChain`
 * component of the PIPE-4 Skill harness (this is its first consumer).
 *
 * DETECTION is NOT here: whether a master violates a guardrail is a SEMANTIC LLM
 * judgment (the `guardrail-check` Skill → `port.checkGuardrails`), never a
 * regex/keyword heuristic (LRN-20, the strict project rule). This module is the
 * pure, deterministic POLICY over the judge's findings: it resolves the PIPE-2
 * outcome and builds the regenerate hint. Being pure, it is unit-tested directly
 * by feeding findings — real teeth with no content heuristic.
 *
 * @implements GENS-7 v1  (VAL chain: three outcomes, escalate dominates, regenerate hint)
 */
import type { GuardrailFinding } from "../ports/llm.js";
import type { ValOutcome } from "./types.js";

/**
 * Resolve the PIPE-2 outcome from the judge's findings: any `escalate` finding →
 * ESCALATE (dominates — forcing human approval is never overridden by a fixable
 * violation: GR-3 sensitive, an unclearable GR-8 taboo); else any `fixable`
 * finding → REGENERATE; else PASS.
 */
export function resolveOutcome(findings: GuardrailFinding[]): ValOutcome {
  if (findings.some((f) => f.severity === "escalate")) return "escalate";
  if (findings.some((f) => f.severity === "fixable")) return "regenerate";
  return "pass";
}

/** The combined regenerate hint from the fixable findings (fed back to the generator). */
export function regenerateHint(findings: GuardrailFinding[]): string {
  return findings
    .filter((f) => f.severity === "fixable")
    .map((f) => `${f.guardrail}: ${f.reason}`)
    .join("; ");
}
