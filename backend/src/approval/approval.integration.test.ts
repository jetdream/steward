/**
 * Integration test for the approval spine (APRS-1/3/5) against dev Postgres via the
 * KEYLESS dev-stub LLM (STEWARD_LLM pins it). Verifies: readyStack lists pending
 * drafts (QA-gate withholds pending-review); approve is GENS-4-gated (a pictured
 * draft approves, a pictureless one is blocked awaiting-picture); batchApprove
 * deterministically EXCLUDES escalated + awaiting-picture cards; editDraft writes an
 * edit_diff row; skip-reason + redirect write Memory (MEMS-1 correction path); the
 * composer routes a founder master through VAL → persist → adapt (no bypass).
 * Skips without DATABASE_URL; loud-fails in the gate.
 *
 * @verifies APRS-1 v3
 * @verifies APRS-3 v1
 * @verifies APRS-5 v1
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { contentItem, editDiff, mediaAsset, memoryEntry, organization } from "@shared/db/schema.js";
import { and, eq } from "drizzle-orm";
import { createLlmPort } from "../adapters/llm/index.js";
import { createDb, type Database } from "../db/client.js";
import { createMemory, type Memory } from "../memory/index.js";
import { type Approval, createApproval } from "./index.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error("acceptance harness: DATABASE_URL required in the gate (APRS tier)");
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run — DB tier skipped)" };

const ORG = OrgId.parse(`org-apr-int-${Date.now().toString(36)}`);

let db: Database;
let approval: Approval;
let memory: Memory;

/** Seed a draft ContentItem; returns its id. `picture` attaches a MediaAsset (clears GENS-4). */
async function seedDraft(opts_: {
  state?: "draft" | "awaiting_picture";
  escalated?: boolean;
  picture?: boolean;
  qa?: "n/a" | "pending-review";
}): Promise<string> {
  const id = randomUUID();
  let mediaAssetId: string | null = null;
  if (opts_.picture) {
    mediaAssetId = randomUUID();
    await db.insert(mediaAsset).values({
      id: mediaAssetId,
      orgId: ORG,
      blobKey: `k/${mediaAssetId}`,
      url: `memory://blob/${mediaAssetId}`,
      contentType: "image/jpeg",
      provenance: "upload",
    });
  }
  await db.insert(contentItem).values({
    id,
    orgId: ORG,
    editorialState: opts_.state ?? "draft",
    contentType: "mission",
    subject: "test",
    title: "t",
    body: "the original body",
    reasonLine: "r",
    valOutcome: opts_.escalated ? "escalate" : "pass",
    escalated: opts_.escalated ?? false,
    qaStatus: opts_.qa ?? "n/a",
    ...(mediaAssetId ? { mediaAssetId } : {}),
  });
  return id;
}

before(async () => {
  if (!url) return;
  db = createDb(url);
  memory = createMemory(db, createLlmPort());
  approval = createApproval({ db, memory, port: createLlmPort() });
  await db
    .insert(organization)
    .values({ id: ORG, name: "Approval Test Org", slug: ORG, createdAt: new Date() });
});

after(async () => {
  if (!url || !db) return;
  await db.delete(organization).where(eq(organization.id, ORG)); // cascades to items, diffs, media, memory
  await db.$client.end({ timeout: 5 });
});

test("readyStack lists pending drafts and withholds the OPSS-1 QA-gated draft", opts, async () => {
  const visible = await seedDraft({ picture: true });
  const withheld = await seedDraft({ qa: "pending-review" });
  const ids = (await approval.readyStack(ORG)).map((c) => c.item.id);
  assert.ok(ids.includes(visible), "a normal draft is on the spine");
  assert.ok(!ids.includes(withheld), "a pending-review draft is withheld (OPSS-1)");
});

test(
  "approve is GENS-4-gated: a pictured draft approves, a pictureless one is blocked",
  opts,
  async () => {
    const pictured = await seedDraft({ picture: true });
    assert.deepEqual(await approval.approve(ORG, pictured), { approved: true });
    const [row] = await db.select().from(contentItem).where(eq(contentItem.id, pictured));
    assert.equal(row?.editorialState, "approved");

    const pictureless = await seedDraft({ state: "awaiting_picture", picture: false });
    assert.deepEqual(await approval.approve(ORG, pictureless), {
      approved: false,
      block: "awaiting-picture",
    });
  },
);

test(
  "batchApprove excludes escalated + awaiting-picture, approves the rest (APRS-1)",
  opts,
  async () => {
    // Fresh org-local slate: seed one clean, one escalated, one awaiting-picture.
    const clean = await seedDraft({ picture: true });
    await seedDraft({ escalated: true, picture: true }); // held (GR-3/GR-8) — never batch-cleared
    await seedDraft({ state: "awaiting_picture", picture: false }); // GENS-4 — never batch-cleared

    const result = await approval.batchApprove(ORG);
    assert.ok(result.approved >= 1, "at least the clean card approved");
    assert.ok(result.excluded >= 2, "the escalated + awaiting-picture cards are excluded");
    const [cleanRow] = await db.select().from(contentItem).where(eq(contentItem.id, clean));
    assert.equal(cleanRow?.editorialState, "approved");
  },
);

test("editDraft writes an edit_diff row (APRS-3 learning-loop data)", opts, async () => {
  const item = await seedDraft({ picture: true });
  await approval.editDraft(ORG, item, "a shorter body");
  const [row] = await db.select().from(contentItem).where(eq(contentItem.id, item));
  assert.equal(row?.body, "a shorter body", "the master body is updated");
  const diffs = await db.select().from(editDiff).where(eq(editDiff.contentItemId, item));
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0]?.beforeText, "the original body");
  assert.equal(diffs[0]?.afterText, "a shorter body");
});

test("skip-reason and redirect write Memory via the correction path (MEMS-1)", opts, async () => {
  const item = await seedDraft({ picture: true });
  await approval.skip(ORG, item, "we don't post about politics");
  const skipped = await db.select().from(contentItem).where(eq(contentItem.id, item));
  assert.equal(skipped[0]?.editorialState, "skipped");

  const entry = await approval.redirect(ORG, item, "never name donors");
  assert.ok(entry, "the redirect binds a Memory entry");

  const mem = await db
    .select()
    .from(memoryEntry)
    .where(and(eq(memoryEntry.orgId, ORG)));
  assert.ok(mem.length >= 2, "the skip-reason and the redirect are both persisted");
});

test(
  "compose routes a founder master through the engine (no bypass, GENS-4 applies)",
  opts,
  async () => {
    const item = await approval.compose(ORG, {
      title: "Thank you volunteers",
      body: "Huge thanks to Saturday's volunteers — you moved 3 tons of food.",
    });
    // No picture attached ⇒ the same GENS-4 gate as a generated draft: awaiting_picture.
    assert.equal(
      item.editorialState,
      "awaiting_picture",
      "a composed post with no picture cannot yet approve",
    );
    assert.equal(
      await (await approval.approve(ORG, item.id)).approved,
      false,
      "and approve is blocked",
    );
  },
);
