/**
 * DM-4 MediaAsset — the Drizzle table, the SINGLE source of its shape (DEC-39).
 * The media library: an image/video an org can attach to a post, either uploaded
 * by the founder or harvested at ingestion (ONBS-2), tagged for suggestion. The
 * bytes live in the blob store (ADR-0003 blob port); this row holds the reference
 * + metadata. Owned by Org (DM-1). AI image generation is disabled (GR-4) — every
 * asset is real (upload/harvested), never synthetic.
 */
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { mediaProvenances } from "../enums.js";
import { organization } from "./auth-schema.js";

export const mediaAsset = pgTable(
  "media_asset",
  {
    // Generated in the @backend write path (node crypto) — keeps @shared node-free.
    id: text("id").primaryKey(),
    /** Owning org (DM-1). Every query is org-scoped (ACC-3). */
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    /** The blob-store key the bytes live under (ADR-0003 blob port; MinIO dev / R2 prod). */
    blobKey: text("blob_key").notNull(),
    /** A resolvable URL to the asset (signed/public per the adapter). */
    url: text("url").notNull(),
    /** MIME type (e.g. image/jpeg). */
    contentType: text("content_type").notNull(),
    /** upload (founder) | harvested (ONBS-2 ingestion). */
    provenance: text("provenance", { enum: mediaProvenances }).notNull(),
    /** Tags for library suggestion, ranked from Memory (GENS-3) — string list. */
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("media_asset_org_idx").on(table.orgId)],
);
