/**
 * Unit tests for the pure stewardship reads (STWS-1), no DB/LLM: the consecutive-
 * week posting streak (G-4) and the trailing-window impact rhythm (STW-1).
 *
 * @verifies STWS-1 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { computeWeekStreak, hasImpactRhythm, RHYTHM_WINDOW_DAYS } from "./index.js";

const NOW = new Date("2026-07-24T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

test("computeWeekStreak counts consecutive trailing weeks with a post", () => {
  // Posts in each of the last 4 weeks → streak 4.
  const dates = [daysAgo(1), daysAgo(8), daysAgo(15), daysAgo(22)];
  assert.equal(computeWeekStreak(dates, NOW), 4);
});

test("the streak stops at the first empty week", () => {
  // Weeks 0 and 1 have posts, week 2 is empty (nothing 15–21d), week 3 has one.
  const dates = [daysAgo(1), daysAgo(8), daysAgo(23)];
  assert.equal(computeWeekStreak(dates, NOW), 2);
});

test("no posts ⇒ streak 0", () => {
  assert.equal(computeWeekStreak([], NOW), 0);
});

test("hasImpactRhythm is true iff an impact post is within the 28-day window (STW-1)", () => {
  assert.equal(hasImpactRhythm([daysAgo(10)], NOW), true);
  assert.equal(
    hasImpactRhythm([daysAgo(RHYTHM_WINDOW_DAYS + 1)], NOW),
    false,
    "just past the window",
  );
  assert.equal(hasImpactRhythm([], NOW), false, "no impact post at all");
});
