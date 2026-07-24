/**
 * Integration test for the Posting Strategy (STRS-1/2/4) against dev Postgres via
 * the KEYLESS dev-stub LLM (STEWARD_LLM pins it): auto-draft persists a versioned
 * StrategyDoc, getStrategy returns the five sections with (c) derived live, a soft
 * edit appends a version, and a prohibition edit routes to Memory and surfaces in
 * the section-(c) org overlay. Skips without DATABASE_URL; loud-fails in the gate.
 *
 * @verifies STRS-1 v1
 * @verifies STRS-2 v1
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { organization } from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import { createLlmPort } from "../adapters/llm/index.js";
import { createDb, type Database } from "../db/client.js";
import { createMemory, type Memory } from "../memory/index.js";
import { createStrategy, type Strategy } from "./index.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error("acceptance harness: DATABASE_URL required in the gate (STRS tier)");
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run — DB tier skipped)" };

const ORG = OrgId.parse(`org-strat-int-${Date.now().toString(36)}`);

let db: Database;
let memory: Memory;
let strategy: Strategy;

before(async () => {
  if (!url) return;
  db = createDb(url);
  memory = createMemory(db, createLlmPort());
  strategy = createStrategy({ db, memory, port: createLlmPort() });
  await db
    .insert(organization)
    .values({ id: ORG, name: "Strategy Test Org", slug: ORG, createdAt: new Date() });
  // Seed grounding so auto-draft has real Memory to draw from (VAL-4).
  await memory.write("We run a weekend food bank so no family goes hungry.", {
    orgId: ORG,
    source: { trigger: "dev-seed", detail: "seed" },
    correctionChannel: false,
  });
});

after(async () => {
  if (!url || !db) return;
  await db.delete(organization).where(eq(organization.id, ORG));
  await db.$client.end({ timeout: 5 });
});

test("auto-draft persists v1; getStrategy returns 5 sections with (c) derived", opts, async () => {
  const drafted = await strategy.autoDraft(ORG);
  assert.equal(drafted.version, 1);

  const view = await strategy.getStrategy(ORG);
  assert.equal(view.version, 1);
  assert.ok(view.sectionA.length > 0, "section (a) auto-drafted from grounding");
  assert.equal(view.sectionC.platform.length, 6, "section (c) platform layer is the 6 guardrails");
});

test(
  "a soft edit appends a version; a prohibition routes to Memory + shows in (c)",
  opts,
  async () => {
    const soft = await strategy.editSection(ORG, "b", "Warm, plain-spoken, never corporate.");
    assert.deepEqual(soft, { routed: "doc", version: 2 });

    const rule = await strategy.editSection(ORG, "a", "never name individual donors");
    assert.equal(rule.routed, "memory");

    const view = await strategy.getStrategy(ORG);
    assert.equal(
      view.version,
      2,
      "the prohibition did not bump the doc version (it went to Memory)",
    );
    assert.ok(
      view.sectionC.org.some((r) => /donor/i.test(r)),
      "the prohibition is now in the derived section (c) org overlay",
    );
  },
);
