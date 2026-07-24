/**
 * Integration test for EXTS-2 external drafts against dev Postgres via the KEYLESS
 * dev-stub LLM (STEWARD_LLM pins it): a worth-a-post ExternalItem becomes an
 * external-type ContentItem sourced from it, run through the same VAL chain
 * (isExternal → GR-5 citation applies downstream). Skips without DATABASE_URL;
 * loud-fails in the gate.
 *
 * @verifies GENS-7 v1
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { externalItem, organization } from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import { createLlmPort } from "../adapters/llm/index.js";
import { createDb, type Database } from "../db/client.js";
import { draftExternalItem } from "./external.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error("acceptance harness: DATABASE_URL required in the gate (EXTS-2 tier)");
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run — DB tier skipped)" };

const ORG = OrgId.parse(`org-ext-int-${Date.now().toString(36)}`);
let db: Database;

before(async () => {
  if (!url) return;
  db = createDb(url);
  await db
    .insert(organization)
    .values({ id: ORG, name: "External Draft Test Org", slug: ORG, createdAt: new Date() });
});

after(async () => {
  if (!url || !db) return;
  await db.delete(organization).where(eq(organization.id, ORG));
  await db.$client.end({ timeout: 5 });
});

test(
  "a worth-a-post candidate becomes an external-type ContentItem sourced from it",
  opts,
  async () => {
    const extId = randomUUID();
    await db.insert(externalItem).values({
      id: extId,
      orgId: ORG,
      source: "Local Herald",
      url: "https://herald.example/food-insecurity-rises",
      title: "County food insecurity rises 12%",
      summary: "A new report shows rising need across the county.",
      relevanceRationale: "directly on our hunger-relief mission",
      disposition: "worth-a-post",
    });

    const item = await draftExternalItem({ db, port: createLlmPort() }, ORG, {
      id: extId,
      title: "County food insecurity rises 12%",
      summary: "A new report shows rising need across the county.",
      url: "https://herald.example/food-insecurity-rises",
      source: "Local Herald",
    });

    assert.equal(item.isExternal, true, "flagged external (GR-5 citation applies)");
    assert.equal(item.sourceExternalItemId, extId, "linked back to its ExternalItem (DM-5↔DM-8)");
    assert.equal(item.contentType, "relatedNews");
    assert.ok(item.body.length > 0);
  },
);
