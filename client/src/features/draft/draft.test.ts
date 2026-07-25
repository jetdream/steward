/**
 * @verifies APRS-1 v3  (per-channel variants with their fit, schedules in plain language)
 * @verifies GENS-5 v1  (a skipped channel stays VISIBLE with its reason)
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultVariant, plainWhen, scheduleLines } from "./draft.js";

const v = (over: Partial<Parameters<typeof scheduleLines>[0][number]> = {}) => ({
  id: "v1",
  platform: "facebook_page",
  body: "…",
  fitVerdict: "fit",
  fitReason: "",
  overridden: false,
  scheduledFor: null,
  ...over,
});

test("APRS-1: the pane opens on a FITTING variant, not on an explanation", () => {
  const picked = defaultVariant([
    { platform: "x", fitVerdict: "skipped" },
    { platform: "instagram", fitVerdict: "fit" },
  ]);
  assert.equal(picked?.platform, "instagram");
});

test("GENS-5: an all-skipped draft still opens somewhere — skips are overridable", () => {
  const picked = defaultVariant([
    { platform: "x", fitVerdict: "skipped" },
    { platform: "threads", fitVerdict: "skipped" },
  ]);
  assert.equal(picked?.platform, "x");
  assert.equal(defaultVariant([]), undefined);
});

test("APRS-1: a delivery slot reads as a person says it", () => {
  // 2026-07-28 is a Tuesday. Constructed in local time — the founder's clock is
  // the one that matters for "when your followers are around".
  assert.equal(plainWhen(new Date(2026, 6, 28, 9, 5)), "Tuesday 9:05 am");
  assert.equal(plainWhen(new Date(2026, 6, 28, 17, 30)), "Tuesday 5:30 pm");
  // Midnight and noon are the two the 12-hour clock gets wrong.
  assert.equal(plainWhen(new Date(2026, 6, 28, 0, 0)), "Tuesday 12:00 am");
  assert.equal(plainWhen(new Date(2026, 6, 28, 12, 0)), "Tuesday 12:00 pm");
});

test("an unscheduled or unparseable slot says nothing rather than something wrong", () => {
  assert.equal(plainWhen(null), undefined);
  assert.equal(plainWhen(undefined), undefined);
  assert.equal(plainWhen("not a date"), undefined);
});

test("GENS-5: a skipped channel KEEPS its row — the omission must be visible", () => {
  const rows = scheduleLines([
    v({ platform: "facebook_page", scheduledFor: new Date(2026, 6, 28, 9, 5) }),
    v({ platform: "x", fitVerdict: "skipped", fitReason: "too long for X" }),
  ]);
  assert.deepEqual(rows, [
    { platform: "facebook_page", when: "Tuesday 9:05 am" },
    { platform: "x", skipped: true },
  ]);
});

test("an OVERRIDDEN skip is no longer skipped — the founder's call wins", () => {
  const [row] = scheduleLines([v({ fitVerdict: "skipped", overridden: true })]);
  assert.equal(row?.skipped, undefined);
});
