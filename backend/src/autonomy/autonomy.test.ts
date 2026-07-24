/**
 * Unit test for the deterministic AUT-1 auto-publish gate (`canAutoPublish`).
 * Pure — no DB, no LLM. Covers the TL0 launch default and the guardrail/veto
 * backstop overriding the level (AUTS-1's "backstop overrides the level").
 *
 * @verifies AUTS-1 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { canAutoPublish } from "./index.js";

test("TL0 (launch) never auto-publishes — every draft needs founder approval", () => {
  assert.equal(canAutoPublish({ level: "TL0", heldByGuardrail: false, vetoed: false }), false);
});

test("TL1/TL2 auto-publish a clean, unvetoed item", () => {
  assert.equal(canAutoPublish({ level: "TL1", heldByGuardrail: false, vetoed: false }), true);
  assert.equal(canAutoPublish({ level: "TL2", heldByGuardrail: false, vetoed: false }), true);
});

test("a GR-3/GR-8 hold overrides the level — never auto-publishes at any level", () => {
  assert.equal(canAutoPublish({ level: "TL2", heldByGuardrail: true, vetoed: false }), false);
  assert.equal(canAutoPublish({ level: "TL1", heldByGuardrail: true, vetoed: false }), false);
});

test("a vetoed item is never re-auto-approved regardless of level (VAL-3 durability)", () => {
  assert.equal(canAutoPublish({ level: "TL2", heldByGuardrail: false, vetoed: true }), false);
});
