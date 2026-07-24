/**
 * Unit tests for the GENS-3/4 picture gate: a pictureless draft is awaiting_picture,
 * a pictured one is draft, and approval is blocked without an attached picture.
 * Pure, deterministic (not an LLM hope) — LRN-20.
 *
 * @verifies GENS-3 v1
 * @verifies GENS-4 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { canApprove, editorialStateForDraft } from "./gate.js";

test("a pictureless draft lands awaiting_picture; a pictured one is draft (GENS-4)", () => {
  assert.equal(editorialStateForDraft(false), "awaiting_picture");
  assert.equal(editorialStateForDraft(true), "draft");
});

test("approval is blocked without an attached picture (GENS-3 hard invariant)", () => {
  assert.equal(canApprove({ mediaAssetId: null }), false);
  assert.equal(canApprove({ mediaAssetId: "media-1" }), true);
});
