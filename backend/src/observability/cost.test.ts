/**
 * Unit tests for LLM cost estimation (PIPE-5). Pure, keyless — deterministic tier.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { costUsd, estimateTokens } from "./cost.js";

test("estimateTokens: ~4 chars per token, rounds up", () => {
  assert.equal(estimateTokens(""), 0);
  assert.equal(estimateTokens("abcd"), 1);
  assert.equal(estimateTokens("abcde"), 2);
});

test("costUsd: priced model computes from the per-Mtok table", () => {
  // gemini-2.5-flash: $0.30/Mtok in, $2.50/Mtok out
  assert.ok(Math.abs(costUsd("gemini-2.5-flash", 1_000_000, 0) - 0.3) < 1e-9);
  assert.ok(Math.abs(costUsd("gemini-2.5-flash", 0, 1_000_000) - 2.5) < 1e-9);
});

test("costUsd: unknown / dev-stub models are free (0)", () => {
  assert.equal(costUsd("dev-stub", 1_000_000, 1_000_000), 0);
  assert.equal(costUsd("test", 999, 999), 0);
});
