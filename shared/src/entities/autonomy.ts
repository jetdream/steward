/**
 * TrustLevel (DM-9) + PublishControl entity types — derived from the Drizzle
 * tables (DEC-39), never re-declared. Client-safe (type-only; no drizzle runtime).
 */
import type { InferSelectModel } from "drizzle-orm";
import type { publishControl, trustLevel } from "../db/autonomy.js";

export type TrustLevel = InferSelectModel<typeof trustLevel>;
export type PublishControl = InferSelectModel<typeof publishControl>;
