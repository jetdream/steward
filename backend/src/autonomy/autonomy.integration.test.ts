/**
 * Integration test for Autonomy (AUTS-1 TL0 + AUTS-3 kill switch) against dev
 * Postgres. Verifies: a category's Trust Level round-trips (default TL0 → set
 * TL1); the global kill switch flips in-flight `scheduled` ChannelVariants →
 * `paused` and `isPaused` reports true; `resume` reverses both; a per-channel
 * pause halts only its platform. No LLM (deterministic policy).
 * Skips without DATABASE_URL; loud-fails in the gate.
 *
 * @verifies AUTS-1 v1
 * @verifies AUTS-3 v1
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { channelVariant, contentItem, organization } from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import { createDb, type Database } from "../db/client.js";
import { type Autonomy, createAutonomy } from "./index.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error("acceptance harness: DATABASE_URL required in the gate (AUTS tier)");
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run — DB tier skipped)" };

const ORG = OrgId.parse(`org-aut-int-${Date.now().toString(36)}`);
const ITEM = `ci-aut-${Date.now().toString(36)}`;

let db: Database;
let autonomy: Autonomy;

/** Seed a `scheduled` variant on the given platform (the kill-switch target). */
async function seedScheduledVariant(platform: "facebook_page" | "instagram"): Promise<string> {
  const id = randomUUID();
  await db.insert(channelVariant).values({
    id,
    orgId: ORG,
    contentItemId: ITEM,
    platform,
    body: "seed",
    fitVerdict: "fit",
    deliveryState: "scheduled",
  });
  return id;
}

async function stateOf(variantId: string): Promise<string> {
  const [row] = await db
    .select({ s: channelVariant.deliveryState })
    .from(channelVariant)
    .where(eq(channelVariant.id, variantId));
  assert.ok(row);
  return row.s;
}

before(async () => {
  if (!url) return;
  db = createDb(url);
  autonomy = createAutonomy({ db });
  await db
    .insert(organization)
    .values({ id: ORG, name: "Autonomy Test Org", slug: ORG, createdAt: new Date() });
  await db.insert(contentItem).values({
    id: ITEM,
    orgId: ORG,
    contentType: "mission",
    subject: "test",
    title: "t",
    body: "b",
    reasonLine: "r",
    valOutcome: "pass",
  });
});

after(async () => {
  if (!url || !db) return;
  await db.delete(organization).where(eq(organization.id, ORG)); // cascades to item + variants
  await db.$client.end({ timeout: 5 });
});

test("a category Trust Level defaults to TL0 and round-trips a set (AUTS-1)", opts, async () => {
  assert.equal(await autonomy.trustLevelFor(ORG, "impact-story"), "TL0", "launch default");
  await autonomy.setTrustLevel(ORG, "impact-story", "TL1", "hold-then-publish");
  assert.equal(await autonomy.trustLevelFor(ORG, "impact-story"), "TL1", "set level reads back");
});

test(
  "the global kill switch pauses scheduled variants and is reversible (AUTS-3)",
  opts,
  async () => {
    const fb = await seedScheduledVariant("facebook_page");
    await autonomy.killSwitch(ORG);
    assert.equal(await autonomy.isPaused(ORG), true, "org reports paused");
    assert.equal(await stateOf(fb), "paused", "scheduled variant flipped to paused");

    await autonomy.resume(ORG);
    assert.equal(await autonomy.isPaused(ORG), false, "resume clears the pause");
    assert.equal(await stateOf(fb), "scheduled", "resume restores the variant to scheduled");
  },
);

test("a per-channel pause halts only its platform (AUTS-3)", opts, async () => {
  const fb = await seedScheduledVariant("facebook_page");
  const ig = await seedScheduledVariant("instagram");
  await autonomy.pauseChannel(ORG, "facebook_page");

  assert.equal(await autonomy.isPaused(ORG, "facebook_page"), true, "facebook paused");
  assert.equal(await autonomy.isPaused(ORG, "instagram"), false, "instagram unaffected");
  assert.equal(await stateOf(fb), "paused");
  assert.equal(await stateOf(ig), "scheduled", "the other channel keeps its schedule");

  await autonomy.resume(ORG, "facebook_page");
  assert.equal(await stateOf(fb), "scheduled");
});
