/**
 * DM-14 ChannelConnection — an authorized publishing-channel connection (ONB-4),
 * read by the Publisher (PUBS-1) to activate a destination. This is the
 * CLIENT-SAFE cross-boundary shape: the OAuth credential (access/refresh tokens)
 * is an ENCRYPTED SECRET held server-side only (SEC-10) and is DELIBERATELY
 * ABSENT here — it is never surfaced to the client (DEC-39: the client shape omits
 * the server-only secret). The full persisted row (incl. `credentialCipher`) is
 * `ChannelConnectionRow`, derived from the Drizzle table and used only in @backend.
 */
import type { InferSelectModel } from "drizzle-orm";
import { z } from "zod";
import type { channelConnection } from "../db/channel-connection.js";
import { ChannelConnectionStatus, ChannelPlatform } from "../enums.js";
import { ChannelConnectionId, OrgId } from "../ids.js";

/** The full persisted DM-14 row (incl. the encrypted credential) — @backend only, never crosses the boundary. */
export type ChannelConnectionRow = InferSelectModel<typeof channelConnection>;

/** The ChannelConnection entity as exposed across the API boundary (no secrets). */
export const ChannelConnection = z.object({
  id: ChannelConnectionId,
  orgId: OrgId,
  platform: ChannelPlatform,
  /** The external page/handle id this connection publishes to. */
  externalAccountRef: z.string().min(1),
  /** connected | expired | revoked | error — a non-healthy state surfaces the needs-you card. */
  status: ChannelConnectionStatus,
  /** Plain-language reason for a non-healthy state (empty when connected) — the XO-4 needs-you card copy. */
  statusReason: z.string(),
  connectedAt: z.date(),
  /** Null until first verified. */
  lastVerifiedAt: z.date().nullable(),
});
export type ChannelConnection = z.infer<typeof ChannelConnection>;
