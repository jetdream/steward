/**
 * Unit tests for the TOPS-1 deterministic pieces — the evidence guard and the
 * canonical topic key. Pure, keyless; no content heuristic (LRN-20 — the guard
 * is set membership, identification quality is the keyed tier).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { CandidateTopic } from "../ports/llm.js";
import { applyEvidenceGuard } from "./identify.js";
import { topicKey } from "./store.js";

const topic = (theme: string, evidenceMemoryIds: string[]): CandidateTopic => ({
  theme,
  description: `about ${theme}`,
  whyItFits: "grounded",
  evidenceMemoryIds,
});

test("guard keeps a topic whose evidence resolves, narrowing to the resolvable subset", () => {
  const out = applyEvidenceGuard([topic("mission", ["m1", "m2", "ghost"])], ["m1", "m2", "m3"]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0]?.evidenceMemoryIds, ["m1", "m2"]); // "ghost" dropped
});

test("guard drops a topic with no resolvable evidence (fabricated pointer)", () => {
  const out = applyEvidenceGuard([topic("invented", ["ghost1", "ghost2"])], ["m1", "m2"]);
  assert.deepEqual(out, []);
});

test("guard drops a topic with empty evidence", () => {
  const out = applyEvidenceGuard([topic("ungrounded", [])], ["m1"]);
  assert.deepEqual(out, []);
});

test("topicKey is canonical: case, whitespace, and surrounding punctuation fold together", () => {
  assert.equal(topicKey("Student Wins!"), topicKey("  student   wins  "));
  assert.equal(topicKey("Student Wins!"), "student wins");
});
