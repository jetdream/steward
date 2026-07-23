/**
 * Integration test for the instrumented LLM port (PIPE-5): a call inside an obs
 * context writes a DM-19 ModelCall row; a call outside one writes nothing.
 * Keyless (dev-stub LLM), against dev Postgres. Skips cleanly without a DB
 * (ad-hoc); FAILS in a gating context (STEWARD_GATE/CI) — see EVS-1.
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { modelCall, organization } from "@shared/db/schema.js";
import { and, eq } from "drizzle-orm";
import { devStubLlm } from "../adapters/llm/dev-stub.js";
import { createDb, type Database } from "../db/client.js";
import { runSkill } from "../harness/runtime.js";
import { withObsContext } from "./context.js";
import { instrumentLlm } from "./instrument.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error(
    "acceptance harness: DATABASE_URL required in the gate (ModelCall integration tier)",
  );
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run)" };

let db: Database;
const orgId = `obs-itest-${process.pid.toString(36)}-${process.hrtime.bigint().toString(36)}`;

before(async () => {
  if (!url) return;
  db = createDb(url);
  await db
    .insert(organization)
    .values({ id: orgId, name: "Obs Test Org", slug: orgId, createdAt: new Date() });
});

after(async () => {
  if (!url || !db) return;
  await db.delete(modelCall).where(eq(modelCall.orgId, orgId));
  await db.delete(organization).where(eq(organization.id, orgId));
  await db.$client.end({ timeout: 5 });
});

test("PIPE-5: a call inside an obs context records a ModelCall row", opts, async () => {
  const port = instrumentLlm(devStubLlm, { db });
  const vec = await withObsContext({ orgId, skill: "embed-memory" }, () =>
    port.embed("hello world", "RETRIEVAL_QUERY"),
  );
  assert.equal(vec.length, 1536); // the call still returns normally

  const rows = await db
    .select()
    .from(modelCall)
    .where(and(eq(modelCall.orgId, orgId)));
  assert.equal(rows.length, 1);
  const row = rows[0];
  assert.equal(row?.skill, "embed-memory");
  assert.equal(row?.operation, "embed");
  assert.equal(row?.outcome, "ok");
  assert.equal(row?.model, "dev-stub");
  assert.ok((row?.tokensIn ?? 0) > 0);
  assert.equal(row?.costUsd, 0); // dev-stub is free
});

test("PIPE-5: a call OUTSIDE an obs context records no row (un-attributed)", opts, async () => {
  const port = instrumentLlm(devStubLlm, { db });
  await port.embed("no context here", "RETRIEVAL_QUERY");
  const rows = await db.select().from(modelCall).where(eq(modelCall.orgId, orgId));
  assert.equal(rows.length, 1); // still just the one from the previous test — none added
});

test(
  "PIPE-4/5: runSkill carries the manifest prompt version onto the ModelCall",
  opts,
  async () => {
    const port = instrumentLlm(devStubLlm, { db });
    await runSkill({ orgId, skillId: "extract-memory" }, () =>
      port.extractEntries("we run a weekend food bank", { correctionChannel: false }),
    );
    const rows = await db
      .select()
      .from(modelCall)
      .where(and(eq(modelCall.orgId, orgId), eq(modelCall.operation, "generateObject")));
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.skill, "extract-memory");
    assert.equal(rows[0]?.promptVersion, "extract-memory@1");
  },
);
