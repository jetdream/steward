/**
 * Integration tests for the TOPS-1 engine against dev Postgres via the KEYLESS
 * dev-stub LLM — the deterministic tier (EVS-1). Seeds Memory, identifies topics,
 * persists + reads the agenda. Skips cleanly without DATABASE_URL; a gating
 * context (STEWARD_GATE/CI) requires the DB (loud failure, never silent skip).
 *
 * @verifies TOPS-1 v1
 * @verifies TOPS-4 v1
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { organization } from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import { createLlmPort } from "../adapters/llm/index.js";
import { createDb, type Database } from "../db/client.js";
import { createMemory, type Memory } from "../memory/index.js";
import { createTopics, type Topics } from "./index.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error(
    "acceptance harness: DATABASE_URL is required in the gate (topics tier) — start .coder/postgres or unset STEWARD_GATE/CI for an ad-hoc unit-only run",
  );
}
const opts = url
  ? {}
  : { skip: "DATABASE_URL not set (ad-hoc local run — deterministic-DB tier skipped)" };

const port = createLlmPort(); // keyless dev-stub
let db: Database;
let memory: Memory;
let topics: Topics;
const orgIdRaw = `titest-${process.pid.toString(36)}-${process.hrtime.bigint().toString(36)}`;
const orgId = OrgId.parse(orgIdRaw);
const emptyOrgRaw = `${orgIdRaw}-empty`;
const emptyOrg = OrgId.parse(emptyOrgRaw);

before(async () => {
  if (!url) return;
  db = createDb(url);
  memory = createMemory(db, port);
  topics = createTopics({ db, memory, port });
  for (const id of [orgIdRaw, emptyOrgRaw]) {
    await db
      .insert(organization)
      .values({ id, name: "Topics Test Org", slug: id, createdAt: new Date() });
  }
  // Seed a little Memory for the populated org.
  await memory.write("we run a weekend food bank", {
    orgId,
    source: { trigger: "dev-seed" },
    correctionChannel: false,
  });
});

after(async () => {
  if (!url || !db) return;
  await memory.purgeOrg(orgId);
  for (const id of [orgIdRaw, emptyOrgRaw]) {
    await db.delete(organization).where(eq(organization.id, id)); // cascades topic rows
  }
  await db.$client.end({ timeout: 5 });
});

test(
  "identify grounds topics in Memory, persists them active, and getAgenda reads them",
  opts,
  async () => {
    const created = await topics.identify(orgId);
    assert.ok(created.length >= 1);
    for (const t of created) {
      assert.equal(t.status, "active");
      assert.equal(t.provenance, "system-derived");
      assert.ok(t.evidence.memoryEntryIds.length >= 1); // grounded (guard held)
    }
    const agenda = await topics.getAgenda(orgId);
    assert.ok(agenda.length >= 1);
    assert.ok(agenda.every((t) => t.orgId === orgId && t.status === "active"));
  },
);

test("a re-run does not duplicate an existing active theme (topicKey dedup)", opts, async () => {
  const before = (await topics.getAgenda(orgId)).length;
  const createdAgain = await topics.identify(orgId);
  assert.equal(createdAgain.length, 0); // same theme → dedup, nothing new
  assert.equal((await topics.getAgenda(orgId)).length, before);
});

test("an empty-Memory org gets no fabricated topics (MEMS-4 posture)", opts, async () => {
  const created = await topics.identify(emptyOrg);
  assert.equal(created.length, 0);
  assert.deepEqual(await topics.getAgenda(emptyOrg), []);
});
