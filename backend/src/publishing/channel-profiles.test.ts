/**
 * Unit tests for the PUBS-2 per-channel technical profiles: every launch channel
 * has a profile, profiles are per-channel + isolated (distinct limits), and known
 * platform quirks hold (Instagram requires media; X is the tightest char limit).
 * Pure config, no DB/LLM.
 *
 * @verifies PUBS-2 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { allChannelProfiles, channelProfile } from "./channel-profiles.js";

test("every launch channel has a technical profile (PUBS-2)", () => {
  for (const p of ["facebook_page", "instagram", "threads", "x"] as const) {
    const profile = channelProfile(p);
    assert.equal(profile.platform, p);
    assert.ok(profile.maxChars > 0 && profile.maxImages > 0 && profile.maxPostsPerDay > 0);
  }
  assert.equal(allChannelProfiles().length, 4);
});

test("profiles are isolated — each channel's limits are its own", () => {
  // X is the tightest char limit; Instagram is the one that requires media.
  assert.ok(channelProfile("x").maxChars < channelProfile("threads").maxChars);
  assert.equal(channelProfile("instagram").mediaRequired, true);
  assert.equal(channelProfile("facebook_page").mediaRequired, false);
  assert.equal(channelProfile("instagram").linkHandling, "profile-only");
});
