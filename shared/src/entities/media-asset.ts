/**
 * MediaAsset (DM-4) entity type — derived from the Drizzle table (DEC-39), never
 * re-declared. A library image/video + its provenance + tags. Client-safe
 * (type-only; no drizzle at runtime).
 */
import type { InferSelectModel } from "drizzle-orm";
import type { mediaAsset } from "../db/media-asset.js";

export type MediaAsset = InferSelectModel<typeof mediaAsset>;
