/**
 * Integration test for the stewardship status read (STWS-1) against dev Postgres.
 * Verifies the home read (XH-1): the posting streak counts published variants, and
 * the impact-rhythm flag reflects an impact/gratitude-designated ContentItem in the
 * trailing 28-day window. No LLM.
 * Skips without DATABASE_URL; loud-fails in the gate.
 *
 * @verifies STWS-1 v1
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { channelVariant, contentItem, organization } from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import { createDb, type Database } from "../db/client.js";
import { createStewardship, type Stewardship } from "./index.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error("acceptance harness: DATABASE_URL required in the gate (STWS tier)");
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run — DB tier skipped)" };

const ORG = OrgId.parse(`org-stw-int-${Date.now().toString(36)}`);
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

let db: Database;
let stewardship: Stewardship;

/** Seed a ContentItem with a designation + creation date; returns its id. */
async function seedItem(
  designation: "none" | "impact_gratitude",
  createdAt: Date,
): Promise<string> {
  const id = randomUUID();
  await db.insert(contentItem).values({
    id,
    orgId: ORG,
    editorialState: "approved",
    contentType: "mission",
    subject: "test",
    designation,
    title: "t",
    body: "b",
    reasonLine: "r",
    valOutcome: "pass",
    scheduledFor: createdAt,
  });
  return id;
}

/** Seed a published variant on `item`, delivered `at`. */
async function seedPublished(itemId: string, at: Date): Promise<void> {
  await db.insert(channelVariant).values({
    id: randomUUID(),
    orgId: ORG,
    contentItemId: itemId,
    platform: "facebook_page",
    body: "posted",
    fitVerdict: "fit",
    deliveryState: "published",
    publishedAt: at,
  });
}

before(async () => {
  if (!url) return;
  db = createDb(url);
  stewardship = createStewardship({ db });
  await db
    .insert(organization)
    .values({ id: ORG, name: "Stewardship Test Org", slug: ORG, createdAt: new Date() });
});

after(async () => {
  if (!url || !db) return;
  await db.delete(organization).where(eq(organization.id, ORG)); // cascades to items + variants
  await db.$client.end({ timeout: 5 });
});

test("a fresh org has no streak and no recent impact", opts, async () => {
  const status = await stewardship.status(ORG);
  assert.equal(status.weekStreak, 0);
  assert.equal(status.hasRecentImpact, false);
  assert.equal(status.lastImpactAt, null);
  assert.equal(status.windowDays, 28);
});

test(
  "published posts build the streak; an impact item lights the rhythm (STWS-1)",
  opts,
  async () => {
    const impact = await seedItem("impact_gratitude", daysAgo(3));
    await seedPublished(impact, daysAgo(3));
    const plain = await seedItem("none", daysAgo(10));
    await seedPublished(plain, daysAgo(10));

    const status = await stewardship.status(ORG);
    assert.ok(status.weekStreak >= 2, "posts in the last two weeks → streak ≥ 2");
    assert.equal(status.hasRecentImpact, true, "an impact post within 28 days lights the rhythm");
    assert.ok(status.lastImpactAt instanceof Date, "the last impact date is surfaced");
  },
);
