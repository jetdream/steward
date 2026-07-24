/**
 * @module @backend/media — the media library + picture gate (ARC-15 / GEN-3/4)
 *
 * Owns the DM-4 MediaAsset library (upload/harvest → blob store + row) and the
 * attach flow that clears the GENS-4 awaiting_picture gate. AI imagery is disabled
 * (GR-4) — assets are real uploads / ONBS-2 harvests only. The deterministic gate
 * logic is `gate.ts` (editorialStateForDraft / canApprove).
 *
 * @implements GENS-3 v1  (every post carries a picture — the media library + the hard gate)
 * @implements GENS-4 v1  (awaiting_picture — complete-but-blocked; attach clears it)
 */
import { randomUUID } from "node:crypto";
import type { MediaAsset, MediaProvenance, OrgId } from "@shared";
import { contentItem, mediaAsset } from "@shared/db/schema.js";
import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import type { BlobStore } from "../ports/blob.js";
import { editorialStateForDraft } from "./gate.js";

export interface MediaDeps {
  db: Database;
  blob: BlobStore;
}

/** A media upload (founder per-post/batch, or an ONBS-2 harvest). */
export interface UploadInput {
  bytes: Uint8Array;
  contentType: string;
  provenance: MediaProvenance;
  tags?: string[];
}

export interface Media {
  upload(orgId: OrgId, input: UploadInput): Promise<MediaAsset>;
  attach(orgId: OrgId, contentItemId: string, mediaAssetId: string): Promise<boolean>;
  library(orgId: OrgId): Promise<MediaAsset[]>;
}

export function createMedia(deps: MediaDeps): Media {
  return {
    /** Store the bytes in the blob store + persist the DM-4 row. */
    async upload(orgId, input) {
      const key = `${orgId}/${randomUUID()}`;
      const { url } = await deps.blob.put(key, input.bytes, input.contentType);
      const [row] = await deps.db
        .insert(mediaAsset)
        .values({
          id: randomUUID(),
          orgId,
          blobKey: key,
          url,
          contentType: input.contentType,
          provenance: input.provenance,
          tags: input.tags ?? [],
        })
        .returning();
      if (!row) throw new Error("upload: insert returned no row");
      return row;
    },

    /**
     * GENS-3/4: attach a library picture to a ContentItem (org-confined both sides).
     * If the item was `awaiting_picture`, the attach clears the gate → `draft`.
     * Returns false if the asset or item is not this org's.
     */
    async attach(orgId, contentItemId, mediaAssetId) {
      const [asset] = await deps.db
        .select({ id: mediaAsset.id })
        .from(mediaAsset)
        .where(and(eq(mediaAsset.orgId, orgId), eq(mediaAsset.id, mediaAssetId)));
      if (!asset) return false;
      const [item] = await deps.db
        .select({ id: contentItem.id, editorialState: contentItem.editorialState })
        .from(contentItem)
        .where(and(eq(contentItem.orgId, orgId), eq(contentItem.id, contentItemId)));
      if (!item) return false;
      const nextState =
        item.editorialState === "awaiting_picture"
          ? editorialStateForDraft(true)
          : item.editorialState;
      await deps.db
        .update(contentItem)
        .set({ mediaAssetId, editorialState: nextState })
        .where(and(eq(contentItem.orgId, orgId), eq(contentItem.id, contentItemId)));
      return true;
    },

    /** The org's media library, newest first (GENS-3 suggestion source). */
    library: (orgId) =>
      deps.db
        .select()
        .from(mediaAsset)
        .where(eq(mediaAsset.orgId, orgId))
        .orderBy(desc(mediaAsset.createdAt)),
  };
}

export { canApprove, editorialStateForDraft } from "./gate.js";
