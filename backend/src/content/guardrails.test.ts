/**
 * Unit tests for the VAL chain POLICY (GENS-7). Pure over the guardrail judge's
 * findings — deterministic, no content heuristic (detection is the LLM judge,
 * LRN-20). Feed findings, assert the resolved outcome + regenerate hint.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { GuardrailFinding } from "../ports/llm.js";
import { regenerateHint, resolveOutcome } from "./guardrails.js";

test("no findings → pass", () => {
  assert.equal(resolveOutcome([]), "pass");
});

test("a fixable finding → regenerate, with a hint", () => {
  const findings: GuardrailFinding[] = [
    { guardrail: "GR-1", severity: "fixable", reason: "promises an outcome" },
  ];
  assert.equal(resolveOutcome(findings), "regenerate");
  assert.match(regenerateHint(findings), /GR-1: promises an outcome/);
});

test("an escalate finding → escalate", () => {
  const findings: GuardrailFinding[] = [
    { guardrail: "GR-3", severity: "escalate", reason: "sensitive topic" },
  ];
  assert.equal(resolveOutcome(findings), "escalate");
});

test("escalate dominates a co-occurring fixable finding", () => {
  const findings: GuardrailFinding[] = [
    { guardrail: "GR-1", severity: "fixable", reason: "promise" },
    { guardrail: "GR-8", severity: "escalate", reason: "taboo not clearable" },
  ];
  assert.equal(resolveOutcome(findings), "escalate");
});

test("regenerateHint only includes fixable findings", () => {
  const findings: GuardrailFinding[] = [
    { guardrail: "GR-1", severity: "fixable", reason: "promise" },
    { guardrail: "GR-3", severity: "escalate", reason: "sensitive" },
  ];
  const hint = regenerateHint(findings);
  assert.match(hint, /GR-1/);
  assert.doesNotMatch(hint, /GR-3/);
});
