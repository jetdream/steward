/**
 * Channels router — the org-scoped API over @backend/channels (ONBS-4). Org-
 * confined via `orgProcedure` (ACC-3). Returns only the SECRET-FREE @shared
 * `ChannelConnection` view — the OAuth credential never crosses this boundary
 * (SEC-10). Connect is never a gate: it is callable any time, in any order.
 *
 * @implements ONBS-4 v1  (connect / reconnect / list / health)
 */
import { ChannelPlatform, OrgId } from "@shared";
import { z } from "zod";
import { createOAuthConnector } from "../adapters/oauth/index.js";
import { createChannels } from "../channels/index.js";
import type { Database } from "../db/client.js";
import { orgProcedure, router } from "../trpc.js";

function channelsFor(ctx: { db: Database }) {
  return createChannels({ db: ctx.db, oauth: createOAuthConnector() });
}

export const channelsRouter = router({
  /** ONBS-4: run the OAuth connect flow for a channel (any order, any time). */
  connect: orgProcedure
    .input(z.object({ platform: ChannelPlatform, authCode: z.string().min(1).optional() }))
    .mutation(({ ctx, input }) =>
      channelsFor(ctx).connect(OrgId.parse(ctx.orgId), input.platform, input.authCode),
    ),

  /** ONBS-4: re-auth an expired/revoked channel — reuses the connect flow. */
  reconnect: orgProcedure
    .input(z.object({ platform: ChannelPlatform, authCode: z.string().min(1).optional() }))
    .mutation(({ ctx, input }) =>
      channelsFor(ctx).reconnect(OrgId.parse(ctx.orgId), input.platform, input.authCode),
    ),

  /** The org's connections (secret-free) — feeds the connect surface + the XO-4 needs-you cards. */
  list: orgProcedure.query(({ ctx }) => channelsFor(ctx).list(OrgId.parse(ctx.orgId))),

  /** The health of one channel (connected | expired | revoked | error | null). */
  health: orgProcedure
    .input(z.object({ platform: ChannelPlatform }))
    .query(({ ctx, input }) => channelsFor(ctx).health(OrgId.parse(ctx.orgId), input.platform)),
});
