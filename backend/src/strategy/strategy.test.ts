/**
 * Unit tests for the Posting Strategy (STRS-1/2/4): the section-(c) platform layer
 * and the STRS-2 SEMANTIC edit routing — a prohibition binds as a Memory rule
 * wherever it is typed, a soft preference stays an editorial doc edit. Pure, no DB,
 * no LLM (the routing reuses the MEMS-1 correction-channel policy — LRN-20).
 *
 * @verifies STRS-2 v1
 * @verifies STRS-4 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { PLATFORM_GUARDRAILS, routesToMemory } from "./index.js";

test("section (c) renders all six platform guardrails read-only (STRS-4)", () => {
  assert.equal(PLATFORM_GUARDRAILS.length, 6);
  for (const gr of ["GR-1", "GR-2", "GR-3", "GR-4", "GR-5", "GR-6"]) {
    assert.ok(
      PLATFORM_GUARDRAILS.some((g) => g.startsWith(gr)),
      `platform layer includes ${gr}`,
    );
  }
});

test("a section (c) edit always routes to Memory (the org overlay, DEC-22)", () => {
  assert.equal(routesToMemory("c", "we serve a specific county"), true);
});

test("a hard prohibition typed in section (a) routes to Memory, not soft (a) (STRS-2)", () => {
  assert.equal(routesToMemory("a", "never name individual donors"), true);
  assert.equal(routesToMemory("a", "don't post about politics"), true);
});

test("a soft editorial preference in (a) stays a doc edit, not a Memory rule", () => {
  assert.equal(routesToMemory("a", "post more volunteer stories"), false);
});

test("tone (b), standing instructions (d), channel (e) edits are always doc edits", () => {
  assert.equal(routesToMemory("b", "never sound corporate"), false);
  assert.equal(routesToMemory("d", "always sign off warmly"), false);
  assert.equal(routesToMemory("e", "keep X posts short"), false);
});
