/**
 * ExternalItem (DM-8) entity type — derived from the Drizzle table (DEC-39), never
 * re-declared. A Radar discovery candidate + its post-read triage. Client-safe
 * (type-only; no drizzle at runtime).
 */
import type { InferSelectModel } from "drizzle-orm";
import type { externalItem } from "../db/external-item.js";

export type ExternalItem = InferSelectModel<typeof externalItem>;
