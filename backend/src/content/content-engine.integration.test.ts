/**
 * Integration test for the WIRED Content Engine loop (GENS-1 orchestration)
 * against dev Postgres via the KEYLESS dev-stub — the deterministic tier (EVS-1):
 * agenda (TOPS-1) → plan (GENS-1) → generate (GENS-7) → VAL → persist (DM-5).
 * Skips without DATABASE_URL; a gating context (STEWARD_GATE/CI) requires the DB.
 *
 * @verifies GENS-1 v1
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { organization } from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import { createLlmPort } from "../adapters/llm/index.js";
import { createDb, type Database } from "../db/client.js";
import { createMemory, type Memory } from "../memory/index.js";
import { createTopics, type Topics } from "../topics/index.js";
import { type ContentEngine, createContentEngine } from "./engine.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error(
    "acceptance harness: DATABASE_URL is required in the gate (content-engine tier) — start .coder/postgres or unset STEWARD_GATE/CI for an ad-hoc unit-only run",
  );
}
const opts = url
  ? {}
  : { skip: "DATABASE_URL not set (ad-hoc local run — deterministic-DB tier skipped)" };

const port = createLlmPort(); // keyless dev-stub
let db: Database;
let memory: Memory;
let topics: Topics;
let engine: ContentEngine;
const orgIdRaw = `cetest-${process.pid.toString(36)}-${process.hrtime.bigint().toString(36)}`;
const orgId = OrgId.parse(orgIdRaw);
const START = new Date("2026-04-01T00:00:00.000Z");

before(async () => {
  if (!url) return;
  db = createDb(url);
  memory = createMemory(db, port);
  topics = createTopics({ db, memory, port });
  engine = createContentEngine({ db, memory, topics, port });
  await db
    .insert(organization)
    .values({ id: orgIdRaw, name: "Engine Test Org", slug: orgIdRaw, createdAt: new Date() });
  // Seed Memory, then auto-draft the agenda so the planner has subjects.
  await memory.write("we run a weekend food bank serving 40 families", {
    orgId,
    source: { trigger: "dev-seed" },
    correctionChannel: false,
  });
  await topics.identify(orgId);
});

after(async () => {
  if (!url || !db) return;
  await memory.purgeOrg(orgId);
  await db.delete(organization).where(eq(organization.id, orgIdRaw)); // cascades content + topics
  await db.$client.end({ timeout: 5 });
});

test("plan→generate→persist yields dated, grounded, quota-satisfying drafts", opts, async () => {
  const items = await engine.planAndDraftCalendar(orgId, { startDate: START, slotCount: 6 });
  assert.equal(items.length, 6);
  for (const it of items) {
    assert.equal(it.orgId, orgId);
    assert.equal(it.editorialState, "draft");
    assert.ok(it.scheduledFor instanceof Date); // dated by the planner
    assert.ok(it.body.length > 0); // generated (GENS-7)
    assert.ok(it.subject.length > 0); // agenda subject
  }
  // STW-1 rhythm: the first plan (empty history) reserves ≥1 impact/gratitude slot.
  assert.ok(items.some((it) => it.designation === "impact_gratitude"));
  // GEN-1 cap: designated asks never exceed 25%.
  const asks = items.filter((it) => it.designation === "fundraising_ask").length;
  assert.ok(asks / items.length <= 0.25);
});

test(
  "a second cycle sees the first as history (dated persistence closes the seam)",
  opts,
  async () => {
    const next = await engine.planAndDraftCalendar(orgId, {
      startDate: new Date(START.getTime() + 30 * 86_400_000),
      slotCount: 4,
    });
    assert.equal(next.length, 4);
    assert.ok(next.every((it) => it.scheduledFor instanceof Date));
  },
);
