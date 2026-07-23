/**
 * Unit tests for the minimal Skill/harness runtime (PIPE-4). Pure, keyless.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentObsContext, type ObsContext } from "../observability/context.js";
import { harnessManifestHash } from "./manifest.js";
import { runSkill } from "./runtime.js";

test("harnessManifestHash is deterministic (16 hex chars)", () => {
  assert.equal(harnessManifestHash(), harnessManifestHash());
  assert.match(harnessManifestHash(), /^[0-9a-f]{16}$/);
});

test("runSkill binds the obs context with the manifest prompt version", async () => {
  let seen: ObsContext | undefined;
  await runSkill({ orgId: "o1", skillId: "extract-memory" }, async () => {
    seen = currentObsContext();
  });
  assert.equal(seen?.orgId, "o1");
  assert.equal(seen?.skill, "extract-memory");
  assert.equal(seen?.promptVersion, "extract-memory@1");
});

test("runSkill for a promptless (embedding) skill carries no prompt version", async () => {
  let seen: ObsContext | undefined;
  await runSkill({ orgId: "o1", skillId: "retrieve-memory" }, async () => {
    seen = currentObsContext();
  });
  assert.equal(seen?.skill, "retrieve-memory");
  assert.equal(seen?.promptVersion, undefined);
});
