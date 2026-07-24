/**
 * Unit tests for the pure APRS-1 batch-approve filter (`batchEligible`), no DB/LLM.
 * The load-bearing invariant: batch approve NEVER clears a held (GR-3/GR-8),
 * awaiting-picture (GENS-4), or non-draft card (DEC-18 One-Home invariant).
 *
 * @verifies APRS-1 v3
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { batchEligible } from "./dispositions.js";

test("a plain, unescalated draft WITH a picture is batch-eligible", () => {
  assert.equal(
    batchEligible({ editorialState: "draft", escalated: false, hasPicture: true }),
    true,
  );
});

test("an escalated (GR-3/GR-8) draft is NEVER batch-cleared", () => {
  assert.equal(
    batchEligible({ editorialState: "draft", escalated: true, hasPicture: true }),
    false,
  );
});

test("an awaiting-picture draft (GENS-4) is NEVER batch-cleared", () => {
  assert.equal(
    batchEligible({ editorialState: "awaiting_picture", escalated: false, hasPicture: false }),
    false,
  );
});

test("a draft missing its picture is excluded even if state reads `draft`", () => {
  assert.equal(
    batchEligible({ editorialState: "draft", escalated: false, hasPicture: false }),
    false,
  );
});

test("already-approved / skipped cards are not re-batched", () => {
  assert.equal(
    batchEligible({ editorialState: "approved", escalated: false, hasPicture: true }),
    false,
  );
  assert.equal(
    batchEligible({ editorialState: "skipped", escalated: false, hasPicture: true }),
    false,
  );
});
