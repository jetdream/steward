/**
 * @verifies CHTS-4 v1  (no system-initiated message ships without a reason)
 * @verifies CHTS-5 v1  (the composer is never blank)
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { canSend, leadingOpenings } from "./conversation.js";

test("CHTS-5: there is ALWAYS at least one opening, whatever the server returns", () => {
  // Every way the server can leave us empty-handed.
  for (const suggested of [undefined, [], [{ opening: "  ", reason: "x" }]]) {
    for (const hasOpenGaps of [true, false]) {
      const out = leadingOpenings(suggested, hasOpenGaps);
      assert.ok(out.length >= 1, `blank composer with ${JSON.stringify(suggested)}/${hasOpenGaps}`);
    }
  }
});

test("CHTS-4: an opening with no reason is DROPPED, never shown reasonless", () => {
  const out = leadingOpenings(
    [
      { opening: "With a reason", reason: "because it changed" },
      { opening: "No reason", reason: "" },
      { opening: "Whitespace reason", reason: "   " },
    ],
    false,
  );
  assert.deepEqual(
    out.map((o) => o.opening),
    ["With a reason"],
  );
  // And whatever survives carries a non-empty reason — the structural gate.
  assert.ok(out.every((o) => o.reason.trim().length > 0));
});

test("CHTS-4: even the fallback floor carries its reason", () => {
  const [floor] = leadingOpenings([], false);
  assert.ok(floor);
  assert.ok(floor.reason.trim().length > 0);
});

test("CHTS-5: the interview invitation appears only while gaps remain", () => {
  const withGaps = leadingOpenings([], true);
  assert.ok(withGaps.some((o) => o.kind === "interview"));

  const noGaps = leadingOpenings(
    [{ opening: "Look at the drafts?", reason: "3 are ready" }],
    false,
  );
  assert.ok(!noGaps.some((o) => o.kind === "interview"));
});

test("server suggestions lead, and duplicates collapse", () => {
  const out = leadingOpenings(
    [
      { opening: "Look at the drafts?", reason: "3 are ready" },
      { opening: "look at the drafts?", reason: "duplicate, different case" },
    ],
    true,
  );
  assert.deepEqual(
    out.map((o) => o.opening),
    ["Look at the drafts?", "Ask me something"],
  );
});

test("the limit is honoured, keeping the server's suggestions first", () => {
  const many = Array.from({ length: 8 }, (_, i) => ({ opening: `o${i}`, reason: `r${i}` }));
  const out = leadingOpenings(many, true, 3);
  assert.deepEqual(
    out.map((o) => o.opening),
    ["o0", "o1", "o2"],
  );
});

test("canSend gates on real content, not whitespace", () => {
  assert.equal(canSend(""), false);
  assert.equal(canSend("   \n "), false);
  assert.equal(canSend(" hi "), true);
});
