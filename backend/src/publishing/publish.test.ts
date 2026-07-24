/**
 * Unit tests for the pure PUBS-1 publish gate (`publishability`), no DB/no LLM.
 * The gate is deterministic and ordered: scheduled → not-paused (AUT-3) →
 * connection-healthy (ONBS-4) → subscription-eligible (BILS-2).
 *
 * @verifies PUBS-1 v3
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { publishability } from "./publish.js";

const ok = {
  deliveryState: "scheduled" as const,
  paused: false,
  connectionHealthy: true,
  subscriptionEligible: true,
};

test("a scheduled, unpaused, connected, eligible variant may publish", () => {
  assert.deepEqual(publishability(ok), { ok: true });
});

test("only a `scheduled` variant publishes — pending/published/unpublished do not", () => {
  for (const s of ["pending", "published", "unpublished"] as const) {
    assert.deepEqual(publishability({ ...ok, deliveryState: s }), {
      ok: false,
      block: "not-scheduled",
    });
  }
});

test("the kill switch (AUT-3) blocks publishing — org/channel pause OR a paused variant row", () => {
  assert.deepEqual(publishability({ ...ok, paused: true }), { ok: false, block: "paused" });
  assert.deepEqual(publishability({ ...ok, deliveryState: "paused" }), {
    ok: false,
    block: "paused",
  });
});

test("an unhealthy connection (ONBS-4) blocks publishing (needs-you, not a silent post)", () => {
  assert.deepEqual(publishability({ ...ok, connectionHealthy: false }), {
    ok: false,
    block: "connection-unhealthy",
  });
});

test("an ineligible subscription (BILS-2) blocks publishing — the account-level stop", () => {
  assert.deepEqual(publishability({ ...ok, subscriptionEligible: false }), {
    ok: false,
    block: "subscription-ineligible",
  });
});

test("the gate is ordered: the AUT-3 pause wins over every other block", () => {
  assert.deepEqual(
    publishability({
      deliveryState: "pending",
      paused: true,
      connectionHealthy: false,
      subscriptionEligible: false,
    }),
    { ok: false, block: "paused" },
  );
});
