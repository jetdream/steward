/**
 * The Publisher (ARC-18) — scheduled, gated, official-API delivery of approved
 * ChannelVariants (PUBS-1) and the append-only publish log (PUBS-3).
 *
 * The publish GATE is DETERMINISTIC (`publishability`, pure): a variant posts
 * ONLY when it is `scheduled`, NOT paused (AUT-3 kill switch / per-channel pause,
 * @backend/autonomy), its ChannelConnection is HEALTHY (ONBS-4, @backend/channels),
 * and the org's subscription is publishing-eligible (BILS-2). A blocked variant
 * does NOT post and does NOT error — its state surfaces the needs-you card /
 * stays scheduled (VAL-3), never a silent failure.
 *
 * @implements PUBS-1 v3  (channels at launch — official APIs, scheduled, gated delivery)
 * @implements PUBS-3 v1  (append-only publish log — destination, time, link, exact text)
 */
import type { DeliveryState, OrgId } from "@shared";
import { channelVariant, contentItem } from "@shared/db/schema.js";
import { and, desc, eq } from "drizzle-orm";
import type { Autonomy } from "../autonomy/index.js";
import type { Channels } from "../channels/index.js";
import type { Database } from "../db/client.js";
import type { ChannelPublisher } from "../ports/publishing.js";

/** Why a variant cannot publish right now — a deterministic, specific reason (never silent). */
export type PublishBlock =
  | "not-scheduled"
  | "paused"
  | "connection-unhealthy"
  | "subscription-ineligible";

/** The pure PUBS-1 publish gate — the single place "may this post now?" is decided. */
export function publishability(input: {
  deliveryState: DeliveryState;
  paused: boolean;
  connectionHealthy: boolean;
  subscriptionEligible: boolean;
}): { ok: true } | { ok: false; block: PublishBlock } {
  // AUT-3 is the loudest signal, checked first: either the org/channel is paused,
  // OR the variant row was already flipped scheduled → paused by the kill switch.
  if (input.paused || input.deliveryState === "paused") return { ok: false, block: "paused" };
  if (input.deliveryState !== "scheduled") return { ok: false, block: "not-scheduled" };
  if (!input.connectionHealthy) return { ok: false, block: "connection-unhealthy" }; // ONBS-4 needs-you
  if (!input.subscriptionEligible) return { ok: false, block: "subscription-ineligible" }; // BILS-2
  return { ok: true };
}

/** One PUBS-3 log entry — the exact post that went out, its destination, time, and live link. */
export interface PublishLogEntry {
  variantId: string;
  platform: string;
  publishedAt: Date;
  url: string;
  text: string;
}

/** The outcome of a publish attempt: posted (with the live URL) or blocked (with the reason). */
export type PublishOutcome =
  | { published: true; url: string }
  | { published: false; block: PublishBlock };

export interface PublisherDeps {
  db: Database;
  publisher: ChannelPublisher;
  autonomy: Autonomy;
  channels: Channels;
  /**
   * Publishing-eligibility of the org's subscription (BILS-2). STUBBED to always
   * eligible until Billing (DM-11 / BIL) lands — a CANCELLED/lapsed org must stop
   * publishing, so this becomes a real subscription-status read then.
   * TODO(BIL): replace with the DM-11 Subscription status check.
   */
  subscriptionEligible?: (orgId: OrgId) => Promise<boolean>;
}

export interface Publisher {
  /** Move a `pending` variant to `scheduled` at its engagement-optimal slot (PUB-1). */
  schedule(orgId: OrgId, variantId: string, when: Date): Promise<void>;
  /** Attempt to publish a scheduled variant now — gated; posts via the official-API port on success. */
  publishVariant(orgId: OrgId, variantId: string): Promise<PublishOutcome>;
  /** The append-only publish log (PUBS-3), newest first — a view over published variants (DM-5). */
  publishLog(orgId: OrgId): Promise<PublishLogEntry[]>;
}

export function createPublisher(deps: PublisherDeps): Publisher {
  const { db, publisher, autonomy, channels } = deps;
  const subscriptionEligible = deps.subscriptionEligible ?? (async () => true);

  async function variantRow(orgId: OrgId, variantId: string) {
    const [row] = await db
      .select()
      .from(channelVariant)
      .where(and(eq(channelVariant.orgId, orgId), eq(channelVariant.id, variantId)));
    return row;
  }

  return {
    async schedule(orgId, variantId, when) {
      const row = await variantRow(orgId, variantId);
      if (!row) throw new Error("publishing.schedule: variant not found for org");
      // Only a fit-passed variant on an APPROVED item is deliverable (DM-5); guard it.
      const [item] = await db
        .select({ state: contentItem.editorialState })
        .from(contentItem)
        .where(and(eq(contentItem.orgId, orgId), eq(contentItem.id, row.contentItemId)));
      if (item?.state !== "approved") {
        throw new Error("publishing.schedule: only an approved item's variant can be scheduled");
      }
      await db
        .update(channelVariant)
        .set({ deliveryState: "scheduled", scheduledFor: when })
        .where(and(eq(channelVariant.orgId, orgId), eq(channelVariant.id, variantId)));
    },

    async publishVariant(orgId, variantId) {
      const row = await variantRow(orgId, variantId);
      if (!row) throw new Error("publishing.publishVariant: variant not found for org");

      const [paused, connectionHealthy, eligible] = await Promise.all([
        autonomy.isPaused(orgId, row.platform),
        channels.isActivated(orgId, row.platform),
        subscriptionEligible(orgId),
      ]);
      const verdict = publishability({
        deliveryState: row.deliveryState,
        paused,
        connectionHealthy,
        subscriptionEligible: eligible,
      });
      // A blocked variant simply does not post — it stays scheduled, no error (VAL-3).
      if (!verdict.ok) return { published: false, block: verdict.block };

      // Healthy ⇒ the credential opens server-side (SEC-10); post via the official-API port (GR-6).
      const credential = await channels.credentialFor(orgId, row.platform);
      if (!credential) return { published: false, block: "connection-unhealthy" };
      // A post FAILURE throws out to the caller — the PUBS-1 retry/operator-alert path (OPS-1, deferred).
      const { url } = await publisher.post(row.platform, credential, row.body);

      await db
        .update(channelVariant)
        .set({ deliveryState: "published", publishedUrl: url, publishedAt: new Date() })
        .where(and(eq(channelVariant.orgId, orgId), eq(channelVariant.id, variantId)));
      return { published: true, url };
    },

    async publishLog(orgId) {
      const rows = await db
        .select()
        .from(channelVariant)
        .where(and(eq(channelVariant.orgId, orgId), eq(channelVariant.deliveryState, "published")))
        .orderBy(desc(channelVariant.publishedAt));
      return rows.flatMap((r) =>
        r.publishedAt && r.publishedUrl
          ? [
              {
                variantId: r.id,
                platform: r.platform,
                publishedAt: r.publishedAt,
                url: r.publishedUrl,
                text: r.body, // the EXACT text sent (PUBS-3) — the variant body at publish time
              },
            ]
          : [],
      );
    },
  };
}
