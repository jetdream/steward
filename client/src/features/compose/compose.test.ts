/**
 * @verifies APRS-5 v1  (the composer gathers; the engine and Ready do the gating)
 * @verifies GENS-4 v1  (a pictureless post is complete-but-blocked, never refused)
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type ComposeDraft,
  canCompose,
  EMPTY_COMPOSE,
  hasContent,
  parkedNote,
  whatIsMissing,
} from "./compose.js";

const draft = (over: Partial<ComposeDraft> = {}): ComposeDraft => ({
  ...EMPTY_COMPOSE,
  title: "Saturday",
  body: "Thank you to everyone who came.",
  ...over,
});

test("GENS-4: a post with NO picture is still composable — the gate is approval, not authorship", () => {
  assert.equal(canCompose(draft({ mediaAssetId: null })), true);
  // And the consequence is stated rather than enforced.
  assert.ok(
    whatIsMissing(draft({ mediaAssetId: null })).some((m) => /wait in Ready/.test(m)),
    "the pictureless consequence must be named",
  );
});

test("APRS-5: the words are the only thing the composer itself requires", () => {
  assert.equal(canCompose(EMPTY_COMPOSE), false);
  assert.equal(canCompose(draft({ title: "" })), false);
  assert.equal(canCompose(draft({ body: "   " })), false);
  assert.equal(canCompose(draft()), true);
  // Channels are optional — the fit gate picks when the founder does not.
  assert.equal(canCompose(draft({ channels: [] })), true);
});

test("nothing is missing once the founder has supplied all four", () => {
  assert.deepEqual(whatIsMissing(draft({ mediaAssetId: "m1", channels: ["facebook_page"] })), []);
});

test("XH-14: closing an unfinished sheet parks it, and says so HONESTLY", () => {
  assert.equal(parkedNote(EMPTY_COMPOSE), null, "an empty sheet parks nothing");
  const note = parkedNote(draft());
  assert.ok(note);
  // The scope must be truthful: the draft lives in memory, not on a server.
  assert.match(note, /this visit/i);
  assert.match(note, /isn't saved/i);
});

test("hasContent notices any of the four, not just the words", () => {
  assert.equal(hasContent(EMPTY_COMPOSE), false);
  assert.equal(hasContent({ ...EMPTY_COMPOSE, title: " " }), false);
  assert.equal(hasContent({ ...EMPTY_COMPOSE, mediaAssetId: "m1" }), true);
  assert.equal(hasContent({ ...EMPTY_COMPOSE, channels: ["x"] }), true);
});
