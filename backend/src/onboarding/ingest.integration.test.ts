/**
 * Integration test for ONBS-2 ingestion against dev Postgres via the KEYLESS
 * dev-stub LLM (STEWARD_LLM pins it): a fetched website artifact flows through the
 * real Memory write path and lands as active entries, each carrying its source
 * pointer + `assumed: true` for the ONBS-5 review. Skips cleanly without
 * DATABASE_URL; loud-fails under the gate (EVS-1).
 *
 * @verifies ONBS-2 v1
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { memoryEntry, organization } from "@shared/db/schema.js";
import { and, eq } from "drizzle-orm";
import { createLlmPort } from "../adapters/llm/index.js";
import { createDb, type Database } from "../db/client.js";
import { createMemory, type Memory } from "../memory/index.js";
import type { SourceFetchPort } from "../ports/sources.js";
import { ingestSources } from "./ingest.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error("acceptance harness: DATABASE_URL required in the gate (ONBS-2 ingestion tier)");
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run — DB tier skipped)" };

const ORG = OrgId.parse(`org-ingest-int-${Date.now().toString(36)}`);
const SITE = "https://example.org/mission";

// A fake source-fetch port with a canned website artifact — the network is never touched.
const sources: SourceFetchPort = {
  name: "fake",
  async scrapeSite(u) {
    return [
      {
        ref: u,
        text: "Our mission is to end hunger. We run a weekend food bank.",
        kind: "website",
      },
    ];
  },
  async harvestMeta() {
    return [];
  },
};

let db: Database;
let memory: Memory;

before(() => {
  if (!url) return;
  db = createDb(url);
  memory = createMemory(db, createLlmPort());
});

after(async () => {
  if (!url || !db) return;
  await db.delete(organization).where(eq(organization.id, ORG)); // cascade clears entries
  // Close the postgres-js pool so the test process exits (else node:test hangs).
  await db.$client.end({ timeout: 5 });
});

test("ingested website facts land in Memory, each source-pointed + assumed", opts, async () => {
  await db
    .insert(organization)
    .values({ id: ORG, name: "Ingest Test Org", slug: ORG, createdAt: new Date() });

  const result = await ingestSources({ memory, sources }, ORG, { siteUrls: [SITE] });
  assert.equal(result.fetched, 1);
  assert.ok(result.written.length >= 1, "at least one entry extracted + written");

  const rows = await db
    .select()
    .from(memoryEntry)
    .where(and(eq(memoryEntry.orgId, ORG)));
  assert.ok(rows.length >= 1);
  for (const r of rows) {
    assert.equal(r.assumed, true, "ingested entries are assumed (ONBS-5 review)");
    assert.equal(r.source.trigger, "onboarding-ingest");
    assert.equal(r.source.ref, SITE, "each entry points at its source artifact");
  }
});
