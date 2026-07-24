/**
 * Integration test for the media library + picture gate (GENS-3/4) against dev
 * Postgres + the in-memory blob store: a pictureless draft is awaiting_picture,
 * an uploaded asset appears in the library, and attaching it clears the gate →
 * draft. Skips without DATABASE_URL; loud-fails in the gate.
 *
 * @verifies GENS-3 v1
 * @verifies GENS-4 v1
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { organization } from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import { createBlobStore } from "../adapters/blob/index.js";
import { getContentItem, persistDraft } from "../content/store.js";
import { createDb, type Database } from "../db/client.js";
import { createMedia, type Media } from "./index.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error("acceptance harness: DATABASE_URL required in the gate (GENS-3/4 tier)");
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run — DB tier skipped)" };

const ORG = OrgId.parse(`org-media-int-${Date.now().toString(36)}`);
let db: Database;
let media: Media;

before(async () => {
  if (!url) return;
  db = createDb(url);
  media = createMedia({ db, blob: createBlobStore() });
  await db
    .insert(organization)
    .values({ id: ORG, name: "Media Test Org", slug: ORG, createdAt: new Date() });
});

after(async () => {
  if (!url || !db) return;
  await db.delete(organization).where(eq(organization.id, ORG));
  await db.$client.end({ timeout: 5 });
});

test(
  "a pictureless draft is awaiting_picture; attaching a picture clears it (GENS-3/4)",
  opts,
  async () => {
    const item = await persistDraft(db, {
      orgId: ORG,
      slot: { type: "mission", subject: "our food bank", designation: "none" },
      result: {
        master: {
          title: "A Weekend of Care",
          body: "We served 40 families.",
          reasonLine: "impact",
        },
        val: { outcome: "pass", findings: [], judged: false },
        attempts: 1,
      },
    });
    assert.equal(item.editorialState, "awaiting_picture", "no picture yet → blocked (GENS-4)");
    assert.equal(item.mediaAssetId, null);

    const asset = await media.upload(ORG, {
      bytes: new Uint8Array([1, 2, 3]),
      contentType: "image/jpeg",
      provenance: "upload",
      tags: ["volunteers"],
    });
    const lib = await media.library(ORG);
    assert.ok(
      lib.some((a) => a.id === asset.id),
      "uploaded asset is in the library",
    );

    const ok = await media.attach(ORG, item.id, asset.id);
    assert.equal(ok, true);
    const cleared = await getContentItem(db, ORG, item.id);
    assert.equal(cleared?.editorialState, "draft", "attaching a picture clears awaiting_picture");
    assert.equal(cleared?.mediaAssetId, asset.id);
  },
);

test("attach refuses a media asset from another org (ACC-3)", opts, async () => {
  const item = await persistDraft(db, {
    orgId: ORG,
    slot: { type: "people", subject: "a volunteer", designation: "none" },
    result: {
      master: { title: "Meet Sam", body: "Sam volunteers weekly.", reasonLine: "people" },
      val: { outcome: "pass", findings: [], judged: false },
      attempts: 1,
    },
  });
  const ok = await media.attach(ORG, item.id, "not-this-orgs-asset");
  assert.equal(ok, false, "an unknown/other-org asset is refused");
});
