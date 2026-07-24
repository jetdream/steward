/**
 * @module @backend/channels (ARC-18 seam — the ONBS-4 connect flow)
 *
 * Owns the DM-14 ChannelConnection lifecycle: the OAuth connect flow, the
 * encrypted-at-rest credential (SEC-10), and the DETERMINISTIC health state
 * machine (connected | expired | revoked | error). Connect is available in ANY
 * order at ANY time and is NEVER a gate (ONBS-4) — zero connections still let
 * drafts flow; publishing (PUBS-1, ARC-18) simply activates a destination once a
 * `connected` ChannelConnection exists.
 *
 * The credential never leaves the server: `list`/the router expose the SECRET-FREE
 * @shared `ChannelConnection` view; only `credentialFor` (the Publisher's server-
 * side read) opens the sealed blob. All logic here is deterministic (no LLM).
 *
 * @implements ONBS-4 v1  (channel connect — OAuth, any order, health machine)
 *
 * DEFERRED: the live Meta (IG-1) / X (IG-2) OAuth adapters (no app creds in
 * scope) — the dev connector stands in; the port is stable so they drop in later.
 */
import { randomUUID } from "node:crypto";
import {
  ChannelConnection,
  type ChannelConnectionRow,
  type ChannelConnectionStatus,
  type ChannelPlatform,
  type OrgId,
} from "@shared";
import { channelConnection } from "@shared/db/schema.js";
import { and, eq } from "drizzle-orm";
import { open, seal } from "../crypto/secret-box.js";
import type { Database } from "../db/client.js";
import type { OAuthConnector, OAuthCredential } from "../ports/oauth.js";

/**
 * The deterministic activation gate (ONBS-4): a destination publishes ONLY when
 * its connection is healthy. Pure — the single place "activates" is decided.
 */
export function activates(status: ChannelConnectionStatus): boolean {
  return status === "connected";
}

export interface ChannelsDeps {
  db: Database;
  oauth: OAuthConnector;
}

export interface Channels {
  connect(orgId: OrgId, platform: ChannelPlatform, authCode?: string): Promise<ChannelConnection>;
  reconnect(orgId: OrgId, platform: ChannelPlatform, authCode?: string): Promise<ChannelConnection>;
  list(orgId: OrgId): Promise<ChannelConnection[]>;
  health(orgId: OrgId, platform: ChannelPlatform): Promise<ChannelConnectionStatus | null>;
  isActivated(orgId: OrgId, platform: ChannelPlatform): Promise<boolean>;
  markExpired(orgId: OrgId, platform: ChannelPlatform, reason?: string): Promise<void>;
  markRevoked(orgId: OrgId, platform: ChannelPlatform, reason?: string): Promise<void>;
  /** Server-side ONLY (the Publisher, ARC-18): open the sealed credential. null unless healthy. */
  credentialFor(orgId: OrgId, platform: ChannelPlatform): Promise<OAuthCredential | null>;
}

/** Project a persisted row to the SECRET-FREE @shared boundary view (drops `credentialCipher`, SEC-10). */
function toView(row: ChannelConnectionRow): ChannelConnection {
  return ChannelConnection.parse({
    id: row.id,
    orgId: row.orgId,
    platform: row.platform,
    externalAccountRef: row.externalAccountRef,
    status: row.status,
    statusReason: row.statusReason,
    connectedAt: row.connectedAt,
    lastVerifiedAt: row.lastVerifiedAt,
  });
}

export function createChannels(deps: ChannelsDeps): Channels {
  const { db, oauth } = deps;

  async function rowFor(
    orgId: OrgId,
    platform: ChannelPlatform,
  ): Promise<ChannelConnectionRow | undefined> {
    const [row] = await db
      .select()
      .from(channelConnection)
      .where(and(eq(channelConnection.orgId, orgId), eq(channelConnection.platform, platform)));
    return row;
  }

  async function setStatus(
    orgId: OrgId,
    platform: ChannelPlatform,
    status: ChannelConnectionStatus,
    reason: string,
  ): Promise<void> {
    await db
      .update(channelConnection)
      .set({ status, statusReason: reason })
      .where(and(eq(channelConnection.orgId, orgId), eq(channelConnection.platform, platform)));
  }

  async function connect(
    orgId: OrgId,
    platform: ChannelPlatform,
    authCode?: string,
  ): Promise<ChannelConnection> {
    // A handshake failure throws (ONBS-4 plain-language retry) — nothing is persisted.
    const { externalAccountRef, credential } = await oauth.connect(platform, authCode);
    const cipher = seal(JSON.stringify(credential));
    const now = new Date();
    const values = {
      id: randomUUID(),
      orgId,
      platform,
      externalAccountRef,
      credentialCipher: cipher,
      tokenExpiresAt: credential.expiresAt ?? null,
      status: "connected" as const,
      statusReason: "",
      connectedAt: now,
      lastVerifiedAt: now,
    };
    const [row] = await db
      .insert(channelConnection)
      .values(values)
      .onConflictDoUpdate({
        // Reconnect reuses this same flow (ONBS-4): re-auth clears expired/revoked → connected.
        target: [channelConnection.orgId, channelConnection.platform],
        set: {
          externalAccountRef,
          credentialCipher: cipher,
          tokenExpiresAt: credential.expiresAt ?? null,
          status: "connected",
          statusReason: "",
          connectedAt: now,
          lastVerifiedAt: now,
        },
      })
      .returning();
    if (!row) throw new Error("channels.connect: insert…returning yielded no row");
    return toView(row);
  }

  return {
    connect,
    reconnect: connect,

    async list(orgId) {
      const rows = await db
        .select()
        .from(channelConnection)
        .where(eq(channelConnection.orgId, orgId));
      return rows.map(toView);
    },

    async health(orgId, platform) {
      const row = await rowFor(orgId, platform);
      return row?.status ?? null;
    },

    async isActivated(orgId, platform) {
      const row = await rowFor(orgId, platform);
      return row ? activates(row.status) : false;
    },

    markExpired: (
      orgId,
      platform,
      reason = "The channel's access token expired — reconnect to resume publishing.",
    ) => setStatus(orgId, platform, "expired", reason),

    markRevoked: (
      orgId,
      platform,
      reason = "Access was revoked on the platform — reconnect to resume publishing.",
    ) => setStatus(orgId, platform, "revoked", reason),

    async credentialFor(orgId, platform) {
      const row = await rowFor(orgId, platform);
      if (!row || !activates(row.status)) return null; // never hand out a credential for a dead channel
      // Revive the sealed JSON: expiresAt round-tripped as an ISO string → back to a Date.
      const parsed = JSON.parse(open(row.credentialCipher)) as {
        accessToken: string;
        refreshToken?: string;
        expiresAt?: string;
      };
      const cred: OAuthCredential = { accessToken: parsed.accessToken };
      if (parsed.refreshToken) cred.refreshToken = parsed.refreshToken;
      if (parsed.expiresAt) cred.expiresAt = new Date(parsed.expiresAt);
      return cred;
    },
  };
}
