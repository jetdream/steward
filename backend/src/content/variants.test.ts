/**
 * Unit tests for the GENS-5 technical-fit gate: an over-limit body is skipped with
 * a specific reason, a media-required channel with no picture is skipped, an
 * in-limit body fits. Pure, deterministic (against the PUBS-2 profile) — LRN-20.
 *
 * @verifies GENS-5 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { channelProfile } from "../publishing/index.js";
import { technicalFit } from "./variants.js";

test("an over-limit body is skipped with a specific reason", () => {
  const x = channelProfile("x"); // 280-char limit
  const verdict = technicalFit("a".repeat(300), x, false);
  assert.equal(verdict.fit, false);
  assert.match(verdict.reason, /280-char limit/);
});

test("a media-required channel with no picture is skipped", () => {
  const ig = channelProfile("instagram"); // mediaRequired
  const verdict = technicalFit("short caption", ig, false);
  assert.equal(verdict.fit, false);
  assert.match(verdict.reason, /requires an image/);
});

test("an in-limit body on a no-media-required channel fits", () => {
  const fb = channelProfile("facebook_page");
  const verdict = technicalFit("A warm, in-limit post about our food bank.", fb, false);
  assert.equal(verdict.fit, true);
  assert.equal(verdict.reason, "");
});

test("a media-required channel WITH a picture fits (within limit)", () => {
  const ig = channelProfile("instagram");
  assert.equal(technicalFit("short caption", ig, true).fit, true);
});
