/**
 * Publishing router — the org-scoped API over @backend/publishing (PUBS-1/PUBS-3).
 * Org-confined via `orgProcedure` (ACC-3). Composes the deterministic publish gate
 * (Autonomy AUT-3 + Channels ONBS-4 + the BILS-2 subscription stub) and the
 * official-API publisher port. The kill switch itself lives on the `autonomy`
 * router (AUT-3) — publishing only READS the pause here.
 *
 * @implements PUBS-1 v3  (schedule / publish)
 * @implements PUBS-3 v1  (log)
 */
import { OrgId } from "@shared";
import { z } from "zod";
import { createOAuthConnector } from "../adapters/oauth/index.js";
import { createChannelPublisher } from "../adapters/publishing/index.js";
import { createAutonomy } from "../autonomy/index.js";
import { createChannels } from "../channels/index.js";
import type { Database } from "../db/client.js";
import { createPublisher } from "../publishing/index.js";
import { orgProcedure, router } from "../trpc.js";

function publisherFor(ctx: { db: Database }) {
  return createPublisher({
    db: ctx.db,
    publisher: createChannelPublisher(),
    autonomy: createAutonomy({ db: ctx.db }),
    channels: createChannels({ db: ctx.db, oauth: createOAuthConnector() }),
  });
}

export const publishingRouter = router({
  /** PUBS-1: schedule an approved variant for delivery at a slot. */
  schedule: orgProcedure
    .input(z.object({ variantId: z.string().min(1), when: z.coerce.date() }))
    .mutation(({ ctx, input }) =>
      publisherFor(ctx).schedule(OrgId.parse(ctx.orgId), input.variantId, input.when),
    ),

  /** PUBS-1: attempt to publish a scheduled variant now (gated — returns posted | blocked+reason). */
  publish: orgProcedure
    .input(z.object({ variantId: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      publisherFor(ctx).publishVariant(OrgId.parse(ctx.orgId), input.variantId),
    ),

  /** PUBS-3: the append-only publish log (Calendar/Published, UX-4), newest first. */
  log: orgProcedure.query(({ ctx }) => publisherFor(ctx).publishLog(OrgId.parse(ctx.orgId))),
});
