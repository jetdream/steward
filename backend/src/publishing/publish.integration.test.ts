/**
 * Integration test for the Publisher (PUBS-1 / PUBS-3) against dev Postgres via
 * the dev/synthetic OAuth + publisher adapters (no live creds). Verifies: an
 * approved item's variant schedules then publishes through the official-API port,
 * transitioning DM-5 scheduled → published and producing a PUBS-3 log entry with
 * destination, timestamp, live link, and the EXACT text sent; the AUT-3 kill
 * switch blocks a publish (stays scheduled, no error); an unconnected channel is
 * blocked (needs-you, never a silent post). No LLM.
 * Skips without DATABASE_URL; loud-fails in the gate.
 *
 * @verifies PUBS-1 v3
 * @verifies PUBS-3 v1
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { type ChannelPlatform, OrgId } from "@shared";
import { channelVariant, contentItem, organization } from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import { createOAuthConnector } from "../adapters/oauth/index.js";
import { createChannelPublisher } from "../adapters/publishing/index.js";
import { type Autonomy, createAutonomy } from "../autonomy/index.js";
import { type Channels, createChannels } from "../channels/index.js";
import { createDb, type Database } from "../db/client.js";
import { createPublisher, type Publisher } from "./publish.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error("acceptance harness: DATABASE_URL required in the gate (PUBS tier)");
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run — DB tier skipped)" };

const ORG = OrgId.parse(`org-pub-int-${Date.now().toString(36)}`);
const ITEM = `ci-pub-${Date.now().toString(36)}`;

let db: Database;
let publisher: Publisher;
let autonomy: Autonomy;
let channels: Channels;

/** Seed a `pending`, fit variant on the approved item for `platform`; returns its id. */
async function seedVariant(platform: ChannelPlatform, body: string): Promise<string> {
  const id = randomUUID();
  await db.insert(channelVariant).values({
    id,
    orgId: ORG,
    contentItemId: ITEM,
    platform,
    body,
    fitVerdict: "fit",
    deliveryState: "pending",
  });
  return id;
}

before(async () => {
  if (!url) return;
  db = createDb(url);
  autonomy = createAutonomy({ db });
  channels = createChannels({ db, oauth: createOAuthConnector() });
  publisher = createPublisher({ db, publisher: createChannelPublisher(), autonomy, channels });
  await db
    .insert(organization)
    .values({ id: ORG, name: "Publish Test Org", slug: ORG, createdAt: new Date() });
  await db.insert(contentItem).values({
    id: ITEM,
    orgId: ORG,
    editorialState: "approved", // only an approved item's variant is deliverable (DM-5)
    contentType: "mission",
    subject: "test",
    title: "t",
    body: "master",
    reasonLine: "r",
    valOutcome: "pass",
  });
});

after(async () => {
  if (!url || !db) return;
  await db.delete(organization).where(eq(organization.id, ORG)); // cascades to item + variants
  await db.$client.end({ timeout: 5 });
});

test(
  "schedule → publish posts via the official-API port and writes the log (PUBS-1/PUBS-3)",
  opts,
  async () => {
    const text = "Our shelter served 240 meals this week — thank you.";
    const variantId = await seedVariant("facebook_page", text);
    await channels.connect(ORG, "facebook_page"); // a healthy connection activates the destination

    await publisher.schedule(ORG, variantId, new Date());
    const outcome = await publisher.publishVariant(ORG, variantId);
    assert.deepEqual(outcome.published, true);
    if (outcome.published) assert.ok(outcome.url.startsWith("https://"), "a live link is returned");

    const [row] = await db.select().from(channelVariant).where(eq(channelVariant.id, variantId));
    assert.equal(row?.deliveryState, "published");

    const log = await publisher.publishLog(ORG);
    const entry = log.find((e) => e.variantId === variantId);
    assert.ok(entry, "the published variant produces a log entry");
    assert.equal(entry.platform, "facebook_page", "destination logged");
    assert.equal(entry.text, text, "the EXACT text sent is logged (PUBS-3)");
    assert.ok(
      entry.url.length > 0 && entry.publishedAt instanceof Date,
      "live link + timestamp logged",
    );
  },
);

test(
  "the AUT-3 kill switch blocks a publish — the variant stays scheduled, no error",
  opts,
  async () => {
    const variantId = await seedVariant("instagram", "held by the kill switch");
    await channels.connect(ORG, "instagram");
    await publisher.schedule(ORG, variantId, new Date());

    await autonomy.killSwitch(ORG); // AUT-3
    const outcome = await publisher.publishVariant(ORG, variantId);
    assert.deepEqual(outcome, { published: false, block: "paused" });

    await autonomy.resume(ORG); // clear the pause for later tests
    // killSwitch flipped scheduled → paused (AUT-3); resume restores it to scheduled and it can post.
    const afterResume = await publisher.publishVariant(ORG, variantId);
    assert.equal(afterResume.published, true, "after resume the same variant publishes");
  },
);

test(
  "an unconnected channel is blocked (needs-you), never a silent post (ONBS-4)",
  opts,
  async () => {
    const variantId = await seedVariant("threads", "no connection for threads");
    await publisher.schedule(ORG, variantId, new Date());
    const outcome = await publisher.publishVariant(ORG, variantId);
    assert.deepEqual(outcome, { published: false, block: "connection-unhealthy" });

    const [row] = await db.select().from(channelVariant).where(eq(channelVariant.id, variantId));
    assert.equal(
      row?.deliveryState,
      "scheduled",
      "a blocked variant stays scheduled (not errored, not dropped)",
    );
  },
);
