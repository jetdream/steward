/**
 * DM-5 ContentItem — the cross-boundary entity TYPE, DERIVED from the single
 * source (DEC-39): the `content_item` table. Type-only import, so this pulls no
 * runtime code (drizzle) into the client bundle. The Ready surface (APR, XH-5)
 * and the news renderer (NWS) consume this shape.
 */
import type { InferSelectModel } from "drizzle-orm";
import type { contentItem } from "../db/content.js";

/** A ContentItem row exactly as stored (the editorial master + its VAL verdict). */
export type ContentItem = InferSelectModel<typeof contentItem>;
