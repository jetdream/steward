/**
 * Integration test for agentic chat (CHTS-1/2/5) against dev Postgres via the
 * KEYLESS dev-stub LLM (STEWARD_LLM pins it): a grounded answer is recorded on the
 * session, redirect confirm-back does NOT write until applied, and an applied
 * redirect becomes a Memory rule (styleRule/taboo). Skips without DATABASE_URL;
 * loud-fails in the gate.
 *
 * @verifies CHTS-1 v1
 * @verifies CHTS-2 v1
 * @verifies CHTS-5 v1
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { memoryEntry, organization } from "@shared/db/schema.js";
import { and, eq } from "drizzle-orm";
import { createLlmPort } from "../adapters/llm/index.js";
import { createDb, type Database } from "../db/client.js";
import { getTranscript } from "../interviewer/store.js";
import { createMemory, type Memory } from "../memory/index.js";
import { type Chat, createChat } from "./index.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error("acceptance harness: DATABASE_URL required in the gate (CHTS tier)");
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run — DB tier skipped)" };

const ORG = OrgId.parse(`org-chat-int-${Date.now().toString(36)}`);

let db: Database;
let memory: Memory;
let chat: Chat;

before(async () => {
  if (!url) return;
  db = createDb(url);
  memory = createMemory(db, createLlmPort());
  chat = createChat({ db, memory, port: createLlmPort() });
  await db
    .insert(organization)
    .values({ id: ORG, name: "Chat Test Org", slug: ORG, createdAt: new Date() });
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

test("a grounded answer is returned and both Q + A are recorded (CHTS-1)", opts, async () => {
  const session = await chat.startSession(ORG);
  const result = await chat.answer(ORG, session.id, "What do we do?");
  assert.equal(result.declined, false);
  assert.ok(result.answer.length > 0);
  const transcript = await getTranscript(db, ORG, session.id);
  assert.equal(transcript.length, 2, "question + answer recorded");
  assert.deepEqual(
    transcript.map((m) => m.role),
    ["user", "assistant"],
  );
});

test("openings are never blank and each carries a reason (CHTS-4/5)", opts, async () => {
  const openings = await chat.suggestOpenings(ORG);
  assert.ok(openings.length > 0, "the composer is never blank");
  assert.ok(
    openings.every((o) => o.reason.trim().length > 0),
    "every opening carries a reason",
  );
});

test("redirect confirm-back does not write until applied (CHTS-2)", opts, async () => {
  const before = await db.select().from(memoryEntry).where(eq(memoryEntry.orgId, ORG));
  const preview = chat.previewRedirect("never name individual donors");
  assert.ok(preview.interpretation.includes("Confirm"));
  const afterPreview = await db.select().from(memoryEntry).where(eq(memoryEntry.orgId, ORG));
  assert.equal(
    afterPreview.length,
    before.length,
    "preview writes nothing (the confirm-back gate)",
  );

  const rule = await chat.applyRedirect(ORG, "never name individual donors");
  assert.ok(
    rule && (rule.kind === "taboo" || rule.kind === "styleRule"),
    "bound as a rule, not a fact",
  );
  const taboos = await db
    .select()
    .from(memoryEntry)
    .where(and(eq(memoryEntry.orgId, ORG), eq(memoryEntry.kind, "taboo")));
  assert.ok(taboos.length >= 1, "the confirmed redirect is now an enforced taboo");
});
