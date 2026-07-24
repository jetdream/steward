/**
 * Integration test for the Radar (EXTS-1/EXTS-5) against dev Postgres via the
 * KEYLESS dev-stub LLM (STEWARD_LLM pins it) + a fake dereferenceability check (no
 * network): a discovery run persists R-4-guarded candidates, they read back in the
 * pull-only feed, a "save for later" triage joins the saved pool and writes Memory.
 * Skips without DATABASE_URL; loud-fails in the gate.
 *
 * @verifies EXTS-1 v1
 * @verifies EXTS-5 v1
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { memoryEntry, organization } from "@shared/db/schema.js";
import { and, eq } from "drizzle-orm";
import { createLlmPort } from "../adapters/llm/index.js";
import { createDb, type Database } from "../db/client.js";
import { createMemory, type Memory } from "../memory/index.js";
import { createRadar, type Radar } from "./index.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error("acceptance harness: DATABASE_URL required in the gate (EXTS tier)");
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run — DB tier skipped)" };

const ORG = OrgId.parse(`org-radar-int-${Date.now().toString(36)}`);

let db: Database;
let memory: Memory;
let radar: Radar;

before(async () => {
  if (!url) return;
  db = createDb(url);
  memory = createMemory(db, createLlmPort());
  radar = createRadar({
    db,
    memory,
    port: createLlmPort(),
    // A static agenda + an always-live deref, so the run is deterministic + offline.
    agendaFor: async () => [{ id: "t1", description: "local food security" }],
    deref: async () => true,
  });
  await db
    .insert(organization)
    .values({ id: ORG, name: "Radar Test Org", slug: ORG, createdAt: new Date() });
});

after(async () => {
  if (!url || !db) return;
  await db.delete(organization).where(eq(organization.id, ORG));
  await db.$client.end({ timeout: 5 });
});

test("a discovery run persists R-4-guarded candidates readable in the feed", opts, async () => {
  const found = await radar.discoverRun(ORG);
  assert.ok(found.length >= 1, "at least one provenance-bound + live candidate persisted");
  for (const c of found) {
    assert.equal(c.topicId, "t1", "candidate answers the agenda topic");
    assert.equal(c.disposition, null, "a fresh candidate is untriaged");
    assert.ok(c.url.length > 0 && c.relevanceRationale.length > 0);
  }
  const feed = await radar.discoveries(ORG);
  assert.equal(feed.length, found.length);
});

test("a save-for-later triage joins the saved pool and writes Memory (EXTS-5)", opts, async () => {
  const [first] = await radar.discoveries(ORG);
  assert.ok(first);
  await radar.triage(ORG, first.id, "saved-for-later");

  const pool = await radar.savedPool(ORG);
  assert.ok(
    pool.some((p) => p.id === first.id),
    "the saved item is in the pool the planner draws from (GEN-1)",
  );
  const memRows = await db
    .select()
    .from(memoryEntry)
    .where(and(eq(memoryEntry.orgId, ORG)));
  assert.ok(
    memRows.some((r) => r.source.trigger === "discovery-triage"),
    "the triage wrote a Memory entry to tune future discovery",
  );
});
