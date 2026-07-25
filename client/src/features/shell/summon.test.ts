/**
 * Unit test for the DSS-24 region-inertness rule — the load-bearing logic of the
 * summoned pane, and the exact thing four challenger rounds were spent getting
 * right (LRN-29). Pure, DOM-free.
 *
 * The rendered-state assertions (focus actually returns, the pinned zone is
 * actually reachable, the pane is actually NOT in the top layer) are the e2e
 * suite's job in E5; this pins the rule both sides share.
 *
 * @verifies DSS-24 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  HOME_REGIONS,
  inertRegions,
  isRegionInert,
  scrimRegions,
  shouldLockScroll,
} from "./summon.js";

test("no pane open ⇒ nothing is inert, in either mode", () => {
  assert.deepEqual(inertRegions({ mode: "desktop", paneOpen: false }), []);
  assert.deepEqual(inertRegions({ mode: "phone", paneOpen: false }), []);
});

test("desktop: the stream is inert but the PINNED ZONE stays live (XH-12)", () => {
  const inert = inertRegions({ mode: "desktop", paneOpen: true });
  assert.ok(!inert.includes("pinned"), "the pinned zone is never inert on desktop");
  assert.deepEqual([...inert], ["ready", "conversation", "terminus"]);
});

test("phone: a takeover inerts ALL regions — an off-screen reachable pinned zone is a defect", () => {
  assert.deepEqual([...inertRegions({ mode: "phone", paneOpen: true })], [...HOME_REGIONS]);
});

test("the chrome is never a region, so it can never be inerted (AUTS-3 kill switch)", () => {
  // The kill switch lives in the chrome. If the chrome were ever in HOME_REGIONS
  // it could be inerted by a takeover, stranding a P0-hard guarantee.
  assert.ok(!(HOME_REGIONS as readonly string[]).includes("chrome"));
  for (const mode of ["phone", "desktop"] as const) {
    assert.ok(!inertRegions({ mode, paneOpen: true }).some((r) => String(r) === "chrome"));
  }
});

test("desktop dims exactly what it inerts; phone dims nothing under an opaque takeover", () => {
  assert.deepEqual(
    [...scrimRegions({ mode: "desktop", paneOpen: true })],
    [...inertRegions({ mode: "desktop", paneOpen: true })],
  );
  assert.deepEqual(scrimRegions({ mode: "phone", paneOpen: true }), []);
});

test("scroll lock follows inertness, never the body — a pinned card stays scrollable", () => {
  assert.equal(shouldLockScroll("ready", { mode: "desktop", paneOpen: true }), true);
  assert.equal(
    shouldLockScroll("pinned", { mode: "desktop", paneOpen: true }),
    false,
    "locking the pinned zone would hide a below-the-fold held card (DS-4)",
  );
});

test("isRegionInert agrees with inertRegions for every region and state", () => {
  for (const mode of ["phone", "desktop"] as const) {
    for (const paneOpen of [true, false]) {
      for (const region of HOME_REGIONS) {
        assert.equal(
          isRegionInert(region, { mode, paneOpen }),
          inertRegions({ mode, paneOpen }).includes(region),
          `${region} @ ${mode}/${paneOpen}`,
        );
      }
    }
  }
});
