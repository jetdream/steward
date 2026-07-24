/**
 * Integration test for channel connect (ONBS-4 / SEC-10) against dev Postgres via
 * the dev/synthetic OAuth connector (no live creds). Verifies: connect persists a
 * `connected` DM-14 row; the list view carries NO credential (SEC-10); the sealed
 * credential decrypts server-side via `credentialFor`; a later expiry flips the
 * health machine to `expired` with a needs-you reason and withholds the
 * credential; reconnect clears it back to `connected`; connect is idempotent per
 * (org, platform). No LLM.
 * Skips without DATABASE_URL; loud-fails in the gate.
 *
 * @verifies ONBS-4 v1
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { OrgId } from "@shared";
import { channelConnection, organization } from "@shared/db/schema.js";
import { eq } from "drizzle-orm";
import { createOAuthConnector } from "../adapters/oauth/index.js";
import { createDb, type Database } from "../db/client.js";
import { type Channels, createChannels } from "./index.js";

const url = process.env.DATABASE_URL;
const gating = !!(process.env.STEWARD_GATE || process.env.CI);
if (gating && !url) {
  throw new Error("acceptance harness: DATABASE_URL required in the gate (ONBS-4 tier)");
}
const opts = url ? {} : { skip: "DATABASE_URL not set (ad-hoc local run — DB tier skipped)" };

const ORG = OrgId.parse(`org-chan-int-${Date.now().toString(36)}`);

let db: Database;
let channels: Channels;

before(async () => {
  if (!url) return;
  db = createDb(url);
  channels = createChannels({ db, oauth: createOAuthConnector() });
  await db
    .insert(organization)
    .values({ id: ORG, name: "Channels Test Org", slug: ORG, createdAt: new Date() });
});

after(async () => {
  if (!url || !db) return;
  await db.delete(organization).where(eq(organization.id, ORG)); // cascades to connections
  await db.$client.end({ timeout: 5 });
});

test(
  "connect persists a connected connection; the view carries no secret (SEC-10)",
  opts,
  async () => {
    const view = await channels.connect(ORG, "facebook_page");
    assert.equal(view.status, "connected");
    assert.equal(view.platform, "facebook_page");
    assert.ok(view.externalAccountRef.length > 0);
    // The boundary view type has no credential field; assert nothing secret leaked into it.
    assert.ok(!JSON.stringify(view).includes("dev-access"), "no access token in the client view");

    // The credential IS persisted, but only as the sealed cipher (never plaintext).
    const [row] = await db.select().from(channelConnection).where(eq(channelConnection.orgId, ORG));
    assert.ok(row);
    assert.ok(!row.credentialCipher.includes("dev-access"), "the token is not stored in plaintext");

    // The server-side read decrypts it for the Publisher (ARC-18).
    const cred = await channels.credentialFor(ORG, "facebook_page");
    assert.equal(cred?.accessToken, "dev-access-facebook_page");
  },
);

test(
  "a later expiry surfaces the needs-you state and withholds the credential (ONBS-4)",
  opts,
  async () => {
    await channels.markExpired(ORG, "facebook_page");
    assert.equal(await channels.health(ORG, "facebook_page"), "expired");
    assert.equal(await channels.isActivated(ORG, "facebook_page"), false);
    assert.equal(
      await channels.credentialFor(ORG, "facebook_page"),
      null,
      "no credential for a dead channel",
    );

    const [expired] = (await channels.list(ORG)).filter((c) => c.platform === "facebook_page");
    assert.ok(expired && expired.statusReason.length > 0, "the needs-you card has a reason");
  },
);

test(
  "reconnect reuses the connect flow and clears the unhealthy state (ONBS-4)",
  opts,
  async () => {
    const view = await channels.reconnect(ORG, "facebook_page");
    assert.equal(view.status, "connected");
    assert.equal(view.statusReason, "");
    assert.equal(await channels.isActivated(ORG, "facebook_page"), true);
  },
);

test("connect is idempotent per (org, platform) — no duplicate rows", opts, async () => {
  await channels.connect(ORG, "x");
  await channels.connect(ORG, "x");
  const xs = (await channels.list(ORG)).filter((c) => c.platform === "x");
  assert.equal(xs.length, 1, "the unique (org, platform) constraint upserts, never duplicates");
});
