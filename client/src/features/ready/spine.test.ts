/**
 * @verifies APRS-1 v3  (batch approve NEVER clears a held / awaiting-picture card)
 * @verifies UXS-3 v1   (holds pin; the spine is finite and states its count)
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { batchExclusion, batchPlan, partitionSpine, spineHeader } from "./spine.js";

const card = (over: Partial<Parameters<typeof batchExclusion>[0]> = {}) => ({
  id: "c1",
  editorialState: "draft" as const,
  escalated: false,
  hasPicture: true,
  ...over,
});

test("UXS-3: a held card PINS and a clean one does not", () => {
  const held = card({ id: "held", escalated: true });
  const clean = card({ id: "clean" });
  const blocked = card({ id: "blocked", editorialState: "awaiting_picture", hasPicture: false });

  const { pinned, spine } = partitionSpine([clean, held, blocked]);
  assert.deepEqual(
    pinned.map((c) => c.id),
    ["held"],
  );
  // Awaiting-picture is complete-but-blocked, NOT a failure — it stays in the
  // spine rather than pinning (GENS-4: "reads as awaiting-picture, not an error").
  assert.deepEqual(
    spine.map((c) => c.id),
    ["clean", "blocked"],
  );
});

test("APRS-1: batch approve excludes held, awaiting-picture, and non-drafts", () => {
  assert.equal(batchExclusion(card()), null, "a clean draft is eligible");
  assert.equal(batchExclusion(card({ escalated: true })), "held");
  assert.equal(batchExclusion(card({ editorialState: "awaiting_picture" })), "awaiting-picture");
  assert.equal(batchExclusion(card({ hasPicture: false })), "awaiting-picture");
  assert.equal(batchExclusion(card({ editorialState: "approved" })), "not-a-draft");
  assert.equal(batchExclusion(card({ editorialState: "skipped" })), "not-a-draft");
});

test("APRS-1: a held card is excluded even when it is otherwise perfect", () => {
  // The dangerous case: everything about it looks batchable except the hold.
  const held = card({ escalated: true, editorialState: "draft", hasPicture: true });
  assert.equal(batchExclusion(held), "held");
  assert.deepEqual(batchPlan([held]), { eligible: 0, excluded: 1 });
});

test("APRS-1: the plan counts what will and will NOT be swept", () => {
  const plan = batchPlan([
    card({ id: "a" }),
    card({ id: "b" }),
    card({ id: "held", escalated: true }),
    card({ id: "nopic", hasPicture: false }),
  ]);
  assert.deepEqual(plan, { eligible: 2, excluded: 2 });
});

test("UXS-3: the header states the count, which is what makes the spine finite", () => {
  assert.equal(spineHeader(3, 5), "Ready for you · 3 of 5 · about 6 minutes");
  assert.equal(spineHeader(1, 4), "Ready for you · 1 of 4 · about 2 minutes");
});

test("the estimate never claims less than a minute, and never says '1 minutes'", () => {
  assert.match(spineHeader(1, 1), /about 2 minutes$/);
  // A half-card estimate would round to 1 — the singular must still read right.
  assert.equal(spineHeader(0, 3), "Ready for you · 0 of 3 · about 1 minute");
});

test("an empty stack says so plainly rather than counting to zero", () => {
  assert.equal(spineHeader(0, 0), "Nothing waiting for you");
});
