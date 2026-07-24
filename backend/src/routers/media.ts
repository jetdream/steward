/**
 * Media router — the org-scoped API surface over @backend/media (ARC-15 / GEN-3/4).
 * Org-confined via `orgProcedure` (ACC-3). Upload carries base64 bytes over the
 * wire; the blob store persists them, the DM-4 row holds the reference.
 *
 * @implements GENS-3 v1  (upload / library)
 * @implements GENS-4 v1  (attach — clears awaiting_picture)
 */
import { MediaProvenance, OrgId } from "@shared";
import { z } from "zod";
import { createBlobStore } from "../adapters/blob/index.js";
import type { Database } from "../db/client.js";
import { createMedia } from "../media/index.js";
import { orgProcedure, router } from "../trpc.js";

function mediaFor(ctx: { db: Database }) {
  return createMedia({ db: ctx.db, blob: createBlobStore() });
}

export const mediaRouter = router({
  /** GENS-3: upload a picture (base64 bytes) into the library. */
  upload: orgProcedure
    .input(
      z.object({
        contentBase64: z.string().min(1),
        contentType: z.string().min(1),
        provenance: MediaProvenance.default("upload"),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      mediaFor(ctx).upload(OrgId.parse(ctx.orgId), {
        bytes: new Uint8Array(Buffer.from(input.contentBase64, "base64")),
        contentType: input.contentType,
        provenance: input.provenance,
        tags: input.tags ?? [],
      }),
    ),

  /** GENS-4: attach a library picture to a ContentItem → clears awaiting_picture. */
  attach: orgProcedure
    .input(z.object({ contentItemId: z.string().min(1), mediaAssetId: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      mediaFor(ctx).attach(OrgId.parse(ctx.orgId), input.contentItemId, input.mediaAssetId),
    ),

  /** GENS-3: the org's media library (suggestion source). */
  library: orgProcedure.query(({ ctx }) => mediaFor(ctx).library(OrgId.parse(ctx.orgId))),
});
