/**
 * Integration test for the Interviewer (INTS-1/2/4) against dev Postgres via the
 * KEYLESS dev-stub LLM (STEWARD_LLM pins it): a session's gap-driven questions land
 * as assistant messages, an answer flows to Memory + the transcript, and the
 * open-questions list reflects the gap model. Skips without DATABASE_URL;
 * loud-fails in the gate.
 *
 * @verifies INTS-1 v1
 * @verifies INTS-2 v1
 * @verifies INTS-4 v1
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { memoryEntry, organization } from "@shared/db/schema.js";
import { and, eq } from "drizzle-orm";
import { createLlmPort } from "../adapters/llm/index.js";
import { createDb, type Database } from "../db/client.js";
import { createMemory, type Memory } from "../memory/index.js";
import { createInterviewer, type Interviewer } from "./index.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error("acceptance harness: DATABASE_URL required in the gate (INTS tier)");
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run — DB tier skipped)" };

const ORG = OrgId.parse(`org-int-int-${Date.now().toString(36)}`);

let db: Database;
let memory: Memory;
let interviewer: Interviewer;

before(async () => {
  if (!url) return;
  db = createDb(url);
  memory = createMemory(db, createLlmPort());
  interviewer = createInterviewer({ db, memory, port: createLlmPort() });
  await db
    .insert(organization)
    .values({ id: ORG, name: "Interview Test Org", slug: ORG, createdAt: new Date() });
});

after(async () => {
  if (!url || !db) return;
  await db.delete(organization).where(eq(organization.id, ORG));
  await db.$client.end({ timeout: 5 });
});

test("gap-driven questions are asked (capped) and recorded on the session", opts, async () => {
  const session = await interviewer.startSession(ORG);
  const questions = await interviewer.nextQuestions(ORG, session.id);
  assert.ok(questions.length >= 1, "a thin profile yields open questions");
  assert.ok(questions.length <= 3, "the per-turn cap holds (a FEW, never an interrogation)");
  const transcript = await interviewer.transcript(ORG, session.id);
  assert.equal(transcript.length, questions.length, "each question is recorded as a message");
  assert.ok(transcript.every((m) => m.role === "assistant"));
});

test("an answer flows to Memory (MEMS-1) and the transcript (INTS-2)", opts, async () => {
  const session = await interviewer.startSession(ORG);
  const written = await interviewer.recordAnswer(
    ORG,
    session.id,
    "Maria has volunteered every Saturday for two years.",
  );
  assert.ok(written.length >= 1, "the answer became a Memory entry");
  const memRows = await db
    .select()
    .from(memoryEntry)
    .where(and(eq(memoryEntry.orgId, ORG)));
  assert.ok(
    memRows.some((r) => r.source.trigger === "interview"),
    "attributed to the interview",
  );
  const transcript = await interviewer.transcript(ORG, session.id);
  assert.ok(
    transcript.some((m) => m.role === "user"),
    "the answer is in the transcript",
  );
});

test("the open-questions list reflects the gap model (INTS-4)", opts, async () => {
  const open = await interviewer.openQuestions(ORG);
  assert.ok(open.length > 0, "a thin org has open gaps to fill");
  assert.ok(
    open.every((q) => typeof q.why === "string" && q.why.length > 0),
    "each tied to why",
  );
});
