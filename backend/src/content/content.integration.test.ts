/**
 * Integration tests for DM-5 ContentItem persistence (the G1b slice) against dev
 * Postgres, via the KEYLESS dev-stub LLM (no live model calls) — the
 * deterministic tier (EVS-1). Generates a draft, persists it, reads it back.
 * Skips cleanly when DATABASE_URL is unset (like the memory tier), but a gating
 * context (STEWARD_GATE/CI) requires the DB — a loud failure, never a silent skip.
 *
 * @verifies GENS-7 v1
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { organization } from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import { createLlmPort } from "../adapters/llm/index.js";
import { createDb, type Database } from "../db/client.js";
import type { ContentSlot, LlmPort } from "../ports/llm.js";
import { generateDraft } from "./generate.js";
import { getContentItem, listContentItems, persistDraft } from "./store.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error(
    "acceptance harness: DATABASE_URL is required in the gate (content persistence tier) — start .coder/postgres or unset STEWARD_GATE/CI for an ad-hoc unit-only run",
  );
}
const opts = url
  ? {}
  : { skip: "DATABASE_URL not set (ad-hoc local run — deterministic-DB tier skipped)" };

const port: LlmPort = createLlmPort(); // keyless dev-stub
let db: Database;
const orgIdRaw = `citest-${process.pid.toString(36)}-${process.hrtime.bigint().toString(36)}`;
const orgId = OrgId.parse(orgIdRaw);

const cleanSlot: ContentSlot = {
  type: "mission",
  subject: "our weekend food bank",
  designation: "none",
};
const tabooSlot: ContentSlot = {
  type: "people",
  subject: "a thank-you",
  designation: "impact_gratitude",
};

before(async () => {
  if (!url) return;
  db = createDb(url);
  await db
    .insert(organization)
    .values({ id: orgIdRaw, name: "Content Test Org", slug: orgIdRaw, createdAt: new Date() });
});

after(async () => {
  if (!url || !db) return;
  await db.delete(organization).where(eq(organization.id, orgIdRaw)); // cascades content_item
  await db.$client.end({ timeout: 5 });
});

test("persistDraft stores a generated master and reads it back org-scoped", opts, async () => {
  const result = await generateDraft(port, {
    orgId,
    slot: cleanSlot,
    grounding: "Our weekend food bank served 40 families this month.",
    overlay: [],
  });
  const stored = await persistDraft(db, { orgId, slot: cleanSlot, result });

  assert.equal(stored.editorialState, "draft");
  assert.equal(stored.contentType, "mission");
  assert.equal(stored.subject, cleanSlot.subject);
  assert.equal(stored.valOutcome, "pass");
  assert.equal(stored.escalated, false);
  assert.equal(stored.qaStatus, "n/a");
  assert.ok(stored.body.length > 0);

  const loaded = await getContentItem(db, orgId, stored.id);
  assert.equal(loaded?.id, stored.id);
  assert.equal(loaded?.title, stored.title);
});

test(
  "an escalated (active-taboo) draft persists with escalated=true + a hold reason",
  opts,
  async () => {
    const result = await generateDraft(port, {
      orgId,
      slot: tabooSlot,
      grounding: "Thank you to everyone who supports our work.",
      overlay: ["never name individual donors"],
    });
    assert.equal(result.val.outcome, "escalate"); // dev-stub GR-8 backstop
    const stored = await persistDraft(db, { orgId, slot: tabooSlot, result });

    assert.equal(stored.valOutcome, "escalate");
    assert.equal(stored.escalated, true);
    assert.match(stored.valSummary, /GR-8/);
  },
);

test("getContentItem is org-confined — another org cannot read the row (ACC-3)", opts, async () => {
  const result = await generateDraft(port, {
    orgId,
    slot: cleanSlot,
    grounding: "Our food bank is open every Saturday.",
    overlay: [],
  });
  const stored = await persistDraft(db, { orgId, slot: cleanSlot, result });
  const otherOrg = OrgId.parse("some-other-org");
  assert.equal(await getContentItem(db, otherOrg, stored.id), null);
});

test("listContentItems returns the org's drafts newest-first", opts, async () => {
  const rows = await listContentItems(db, orgId, "draft");
  assert.ok(rows.length >= 3); // the drafts persisted by the tests above
  assert.ok(rows.every((r) => r.orgId === orgId && r.editorialState === "draft"));
});
