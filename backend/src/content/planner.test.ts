/**
 * Unit tests for the GENS-1 planner's DETERMINISTIC core — the agenda/taxonomy
 * guard and the mix-quota designation engine. Pure, keyless; the quotas are
 * counted reservations, never a model classification (LRN-20).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { SlotPairing } from "../ports/llm.js";
import { applyPairingGuard, askRatio, designateAndSchedule, type HistorySlot } from "./planner.js";

const agenda = [
  { id: "t1", description: "food bank" },
  { id: "t2", description: "volunteers" },
];
const START = new Date("2026-03-01T00:00:00.000Z");
const DAY = 86_400_000;
const pairings = (n: number): SlotPairing[] =>
  Array.from({ length: n }, (_u, i) => ({
    type: "mission" as const,
    topicId: i % 2 === 0 ? "t1" : "t2",
  }));

test("guard drops pairings with an out-of-agenda topic or a non-internal type", () => {
  const out = applyPairingGuard(
    [
      { type: "mission", topicId: "t1" }, // ok
      { type: "mission", topicId: "ghost" }, // topic not in agenda → dropped
      { type: "relatedNews", topicId: "t2" }, // external type → dropped (deferred)
    ],
    new Set(["t1", "t2"]),
  );
  assert.equal(out.length, 1);
  assert.equal(out[0]?.topicId, "t1");
});

test("empty history → the plan reserves ≥1 impact/gratitude slot (STW-1 floor)", () => {
  const slots = designateAndSchedule(pairings(12), agenda, [], START, 28);
  assert.equal(slots.length, 12);
  assert.ok(slots.some((s) => s.designation === "impact_gratitude"));
  assert.ok(slots.every((s) => s.subject.length > 0)); // subjects resolved
  // dates ascending within the 28-day window
  let prev = Number.NEGATIVE_INFINITY;
  for (const s of slots) {
    assert.ok(s.scheduledFor.getTime() >= prev);
    prev = s.scheduledFor.getTime();
  }
});

test("a recent history impact suppresses an early forced impact (no double-reserve in-window)", () => {
  const history: HistorySlot[] = [
    { designation: "impact_gratitude", date: new Date(START.getTime() - 5 * DAY) },
  ];
  // With an impact 5 days before start, the first ~23 days need no new impact.
  const slots = designateAndSchedule(pairings(6), agenda, history, START, 28);
  const firstImpact = slots.find((s) => s.designation === "impact_gratitude");
  // Either none in this short block, or only once enough time has elapsed (> ~20d in).
  if (firstImpact) {
    assert.ok(firstImpact.scheduledFor.getTime() - START.getTime() > 20 * DAY);
  }
});

test("an OLD history impact (>window before start) forces an impact in the plan", () => {
  const history: HistorySlot[] = [
    { designation: "impact_gratitude", date: new Date(START.getTime() - 40 * DAY) },
  ];
  const slots = designateAndSchedule(pairings(6), agenda, history, START, 28);
  assert.ok(slots.some((s) => s.designation === "impact_gratitude"));
});

test("the base plan designates no fundraising asks → within the 25% cap", () => {
  const slots = designateAndSchedule(pairings(8), agenda, [], START, 28);
  assert.equal(slots.filter((s) => s.designation === "fundraising_ask").length, 0);
  assert.ok(askRatio(slots) <= 0.25);
});
