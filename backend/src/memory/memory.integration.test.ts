/**
 * Integration tests for the @backend/memory brain spine against dev Postgres,
 * via the KEYLESS dev-stub LLM (no live model calls) — the deterministic tier
 * (EVS-1). Skips cleanly when DATABASE_URL is unset, so the pure-unit subset
 * still runs anywhere (CI self-contained, ADR-0003).
 *
 * @verifies MEMS-1 v2
 * @verifies MEMS-2 v1
 * @verifies MEMS-4 v1
 * @verifies MEMS-5 v1
 * @verifies MEMS-6 v1
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { organization } from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import { devStubLlm } from "../adapters/llm/dev-stub.js";
import { createDb, type Database } from "../db/client.js";
import type { ExtractedEntry, LlmPort } from "../ports/llm.js";
import { createMemory, type Memory } from "./index.js";
import { subjectKey } from "./subject-key.js";

const url = process.env.DATABASE_URL;
// In a GATING context (pre-push / CI, marked by STEWARD_GATE or CI) the dev-stub
// integration tier MUST run — a missing DB is a loud FAILURE, never a silent skip
// (EVS-1: the harness fails, not narrows, when its environment is unavailable).
// Only an ad-hoc local run may skip cleanly so the pure-unit subset still runs.
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error(
    "acceptance harness: DATABASE_URL is required in the gate (dev-stub integration tier) — start .coder/postgres or unset STEWARD_GATE/CI for an ad-hoc unit-only run",
  );
}
const opts = url
  ? {}
  : { skip: "DATABASE_URL not set (ad-hoc local run — deterministic-DB tier skipped)" };

// Controllable LLM: force the next extraction (to drive structured supersession
// deterministically), else delegate to the real dev stub; embeddings via dev stub.
let override: ExtractedEntry[] | null = null;
const llm: LlmPort = {
  name: "test",
  async extractEntries(raw, ctx) {
    if (override) {
      const o = override;
      override = null;
      return o;
    }
    return (await devStubLlm.extract(raw, ctx)).entries;
  },
  async embed(t, k) {
    return (await devStubLlm.embed(t, k)).vector;
  },
  async generateDraft(input) {
    return (await devStubLlm.generate(input)).master;
  },
  async checkGuardrails(input) {
    return (await devStubLlm.judgeGuardrails(input)).judgment;
  },
};

let db: Database;
let memory: Memory;
const orgIdRaw = `itest-${process.pid.toString(36)}-${process.hrtime.bigint().toString(36)}`;
const orgId = OrgId.parse(orgIdRaw);

before(async () => {
  if (!url) return;
  db = createDb(url);
  memory = createMemory(db, llm);
  await db
    .insert(organization)
    .values({ id: orgIdRaw, name: "Integration Test Org", slug: orgIdRaw, createdAt: new Date() });
});

after(async () => {
  if (!url || !db) return;
  await memory.purgeOrg(orgId);
  await db.delete(organization).where(eq(organization.id, orgIdRaw));
  // Close the postgres-js pool so the test process exits (else node:test hangs).
  await db.$client.end({ timeout: 5 });
});

test("MEMS-1: write persists with source + embedding + assumed=false", opts, async () => {
  const [e] = await memory.write("we run a weekend food bank", {
    orgId,
    source: { trigger: "dev-seed" },
    correctionChannel: false,
  });
  assert.equal(e?.source.trigger, "dev-seed");
  assert.equal(e?.assumed, false);
  assert.ok(e?.embedding && e.embedding.length === 1536);
});

test(
  "MEMS-2: identical restatement merges (touch), different claim stays separate",
  opts,
  async () => {
    const [first] = await memory.write("our mission is to end local hunger", {
      orgId,
      source: { trigger: "dev-seed" },
      correctionChannel: false,
    });
    const [again] = await memory.write("Our mission is to end local hunger.", {
      orgId,
      source: { trigger: "dev-seed" },
      correctionChannel: false,
    });
    assert.equal(again?.id, first?.id, "normalized-equal restatement merges");
    assert.ok(again?.reinforcedAt, "merge touches reinforcedAt");
    const [other] = await memory.write("we host an annual gala", {
      orgId,
      source: { trigger: "dev-seed" },
      correctionChannel: false,
    });
    assert.notEqual(other?.id, first?.id, "different claim is a separate row");
  },
);

test("MEMS-2: same-subject correction supersedes (one active row remains)", opts, async () => {
  override = [{ kind: "person", subject: "Jane", content: "Jane is our founder" }];
  const [v1] = await memory.write("Jane is our founder", {
    orgId,
    source: { trigger: "interview" },
    correctionChannel: false,
  });
  override = [{ kind: "person", subject: "Jane", content: "Jane is retiring this year" }];
  const [v2] = await memory.write("Jane is retiring this year", {
    orgId,
    source: { trigger: "chat" },
    correctionChannel: false,
  });
  assert.notEqual(v2?.id, v1?.id);
  const ctx = await memory.retrieveContext(orgId, "Jane");
  const active = ctx.grounding.filter((g) => g.kind === "person");
  assert.equal(active.length, 1);
  assert.match(active[0]?.content ?? "", /retiring/);
});

test("MEMS-1: correction-channel prohibition is coerced to a taboo", opts, async () => {
  const [t] = await memory.write("never name individual donors", {
    orgId,
    source: { trigger: "onboarding-review" },
    correctionChannel: true,
  });
  assert.equal(t?.kind, "taboo");
});

test(
  "MEMS-4: retrieveContext returns the full active overlay + nearest grounding",
  opts,
  async () => {
    const ctx = await memory.retrieveContext(orgId, "food assistance program");
    assert.ok(
      ctx.overlay.taboos.some((x) => /donors/.test(x.content)),
      "full taboo overlay, not similarity-gated",
    );
    assert.match(ctx.grounding[0]?.content ?? "", /food bank/, "nearest grounding first");
    assert.equal(ctx.thin, false);
  },
);

test("MEMS-5/6: resolved unknown not re-asked; blocking asked; else assumed", opts, async () => {
  const resolved = subjectKey("person", "Jane", "Jane is retiring this year");
  assert.deepEqual(await memory.shouldAsk(orgId, { subjectKey: resolved }), {
    decision: "assume",
    reason: "already-resolved",
  });
  assert.equal(
    (await memory.shouldAsk(orgId, { subjectKey: "person:brand-new", interruptClass: "blocking" }))
      .decision,
    "ask",
  );
  assert.deepEqual(await memory.shouldAsk(orgId, { subjectKey: "misc:defaultable" }), {
    decision: "assume",
    reason: "defaultable",
  });
});
