/**
 * Unit test for the DSS-2 accent guard. DOM-free by construction: the guard
 * takes a `ParentNode`, so a hand-rolled stub exercises the counting rule
 * without a jsdom runner (the root test glob is `.test.ts` and the repo has no
 * DOM test environment — keeping client unit tests DOM-free is deliberate).
 *
 * The RENDERED-state assertion over the real shell is the e2e suite's job (E5);
 * this pins the counting contract both sides share.
 *
 * @verifies DSS-2 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ACCENT_FOCAL_ATTR,
  ACCENT_FOCAL_SELECTOR,
  accentFocal,
  countAccentFocals,
} from "./accent.js";

/** Minimal ParentNode stub — only `querySelectorAll` is exercised by the guard. */
function rootWith(focalCount: number): ParentNode {
  const nodes = Array.from({ length: focalCount }, () => ({}));
  return {
    querySelectorAll(selector: string) {
      assert.equal(selector, ACCENT_FOCAL_SELECTOR, "the guard must count the marked attribute");
      return nodes as unknown as NodeListOf<Element>;
    },
  } as unknown as ParentNode;
}

test("a surface with exactly one accent focal is the compliant case (DSS-2)", () => {
  assert.equal(countAccentFocals(rootWith(1)), 1);
});

test("a surface with no accent focal is allowed — not every surface has a primary action", () => {
  assert.equal(countAccentFocals(rootWith(0)), 0);
});

test("two accent focals is the violation the guard exists to catch", () => {
  assert.equal(countAccentFocals(rootWith(2)), 2);
});

test("the marker attribute and selector agree — dev guard and e2e assert the same thing", () => {
  assert.equal(ACCENT_FOCAL_SELECTOR, `[${ACCENT_FOCAL_ATTR}]`);
  assert.deepEqual(accentFocal, { [ACCENT_FOCAL_ATTR]: "" });
});
