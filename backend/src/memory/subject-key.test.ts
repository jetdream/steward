/**
 * Unit tests for the deterministic canonical-subject key (MEMS-2 dedup / MEMS-6
 * asked-set). Pure, keyless, no I/O — the every-commit deterministic tier (EVS-1).
 *
 * @verifies MEMS-2 v1
 * @verifies MEMS-6 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { normalize, subjectKey } from "./subject-key.js";

test("normalize: lowercases, collapses whitespace, strips trailing punctuation", () => {
  assert.equal(normalize("  Our   Food  Bank. "), "our food bank");
  assert.equal(normalize("Jane!!!"), "jane");
});

test("MEMS-2: structured entries key on kind+subject (same subject → same key)", () => {
  const a = subjectKey("person", "Jane", "Jane is our founder");
  const b = subjectKey("person", "Jane", "Jane is retiring this year");
  // Same subject, different claim → SAME key (the later supersedes, not duplicates).
  assert.equal(a, b);
  assert.equal(a, "person:jane");
});

test("MEMS-2: different subjects never collide", () => {
  assert.notEqual(subjectKey("person", "Jane", "x"), subjectKey("person", "Bob", "x"));
  assert.notEqual(
    subjectKey("program", "After-school", "x"),
    subjectKey("event", "After-school", "x"),
  );
});

test("MEMS-2: free-form facts key on the full normalized assertion (bias-to-not-merge)", () => {
  const a = subjectKey("fact", undefined, "we run a weekend food bank");
  const b = subjectKey("fact", undefined, "we run a weekday food bank");
  assert.notEqual(a, b); // two different claims stay separate
  assert.equal(subjectKey("fact", undefined, "We run a weekend food bank."), a); // normalized-equal merges
});
