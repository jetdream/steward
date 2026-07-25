/**
 * @verifies ONBS-4 v1  (unconnected is never a problem; broken is never silent)
 * @verifies AUTS-1 v1  (permanently capped categories are stated, not hidden)
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { type ChannelRow, isCapped, presentChannel } from "./controls.js";

const row = (over: Partial<ChannelRow> = {}): ChannelRow => ({
  platform: "facebook_page",
  status: null,
  statusReason: "",
  ...over,
});

test("ONBS-4: never connected is an INVITATION, never a needs-you card", () => {
  const p = presentChannel(row({ status: null }));
  assert.equal(p.action, "connect");
  assert.equal(p.needsYou, false, "connecting is not a gate — it must not nag");
  assert.match(p.summary, /drafts still flow/i);
});

test("a healthy channel offers nothing and asks for nothing", () => {
  const p = presentChannel(row({ status: "connected" }));
  assert.equal(p.action, null);
  assert.equal(p.needsYou, false);
});

test("ONBS-4: a channel that BROKE is pinned, explained, and repairable", () => {
  for (const status of ["expired", "revoked", "error"] as const) {
    const p = presentChannel(row({ status }));
    assert.equal(p.action, "reconnect", status);
    assert.equal(p.needsYou, true, `${status} must not be discovered silently`);
    assert.match(p.summary, /can't post here/i, status);
  }
});

test("the server's own reason wins over the generic phrasing", () => {
  const p = presentChannel(
    row({ status: "expired", statusReason: "the token expired on Tuesday" }),
  );
  assert.match(p.summary, /the token expired on Tuesday/);
  // …and a blank reason still yields a sentence rather than a dangling dash.
  const blank = presentChannel(row({ status: "expired", statusReason: "   " }));
  assert.match(blank.summary, /timed out/);
  assert.doesNotMatch(blank.summary, /— \./);
});

test("AUTS-1: asks and external content are permanently capped", () => {
  assert.equal(isCapped("fundraising_ask"), true);
  assert.equal(isCapped("external"), true);
  assert.equal(isCapped("caseStudy"), false);
});
