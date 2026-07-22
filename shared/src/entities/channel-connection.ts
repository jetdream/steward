/**
 * DM-14 ChannelConnection — an authorized publishing-channel connection (ONB-4),
 * read by the Publisher (PUBS-1) to activate a destination. This is the
 * CLIENT-SAFE cross-boundary shape: the OAuth credential (access/refresh tokens)
 * is an ENCRYPTED SECRET held server-side only (SEC-10) and is DELIBERATELY
 * ABSENT here — it is never surfaced to the client.
 */
import { z } from "zod";
import { ChannelConnectionStatus, ChannelPlatform } from "../enums.js";
import { ChannelConnectionId, OrgId } from "../ids.js";

/** The ChannelConnection entity as exposed across the API boundary (no secrets). */
export const ChannelConnection = z.object({
  id: ChannelConnectionId,
  orgId: OrgId,
  platform: ChannelPlatform,
  /** The external page/handle id this connection publishes to. */
  externalAccountRef: z.string().min(1),
  /** connected | expired | revoked | error — a non-healthy state surfaces the needs-you card. */
  status: ChannelConnectionStatus,
  connectedAt: z.date(),
  /** Null until first verified. */
  lastVerifiedAt: z.date().nullable(),
});
export type ChannelConnection = z.infer<typeof ChannelConnection>;
