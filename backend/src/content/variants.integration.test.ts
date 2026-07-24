/**
 * Integration test for GENS-2/GENS-5 against dev Postgres via the KEYLESS dev-stub
 * LLM (STEWARD_LLM pins it): adapting a persisted master produces a ChannelVariant
 * per channel, each fit-gated — the short/no-media channels fit, Instagram (media
 * required, no picture yet) is SKIPPED with a reason and RETAINED. Skips without
 * DATABASE_URL; loud-fails in the gate.
 *
 * @verifies GENS-2 v1
 * @verifies GENS-5 v1
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { organization } from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import { createLlmPort } from "../adapters/llm/index.js";
import { createDb, type Database } from "../db/client.js";
import { persistDraft } from "./store.js";
import { adaptContentItem, listVariants } from "./variants.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error("acceptance harness: DATABASE_URL required in the gate (GENS-2/5 tier)");
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run — DB tier skipped)" };

const ORG = OrgId.parse(`org-var-int-${Date.now().toString(36)}`);
let db: Database;

before(async () => {
  if (!url) return;
  db = createDb(url);
  await db
    .insert(organization)
    .values({ id: ORG, name: "Variant Test Org", slug: ORG, createdAt: new Date() });
});

after(async () => {
  if (!url || !db) return;
  await db.delete(organization).where(eq(organization.id, ORG));
  await db.$client.end({ timeout: 5 });
});

test("adaptation persists a fit-gated variant per channel (GENS-2/5)", opts, async () => {
  const item = await persistDraft(db, {
    orgId: ORG,
    slot: { type: "mission", subject: "our food bank", designation: "none" },
    result: {
      master: {
        title: "Nourishing Our Community",
        body: "We served 40 families this weekend.",
        reasonLine: "impact",
      },
      val: { outcome: "pass", findings: [], judged: false },
      attempts: 1,
    },
  });

  const variants = await adaptContentItem({ db, port: createLlmPort() }, ORG, item.id);
  assert.equal(variants.length, 4, "one variant per launch channel");

  const stored = await listVariants(db, ORG, item.id);
  assert.equal(stored.length, 4);
  const ig = stored.find((v) => v.platform === "instagram");
  assert.ok(ig && ig.fitVerdict === "skipped", "Instagram is skipped (media required, no picture)");
  assert.ok(ig.fitReason.length > 0, "the skip carries a visible reason (VAL-3)");
  const fb = stored.find((v) => v.platform === "facebook_page");
  assert.ok(fb && fb.fitVerdict === "fit", "Facebook fits (no media requirement, within limit)");
});
