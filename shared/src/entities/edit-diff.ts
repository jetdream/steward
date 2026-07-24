/**
 * EditDiff entity type (APRS-3) — derived from the Drizzle table (DEC-39), never
 * re-declared. Client-safe (type-only; no drizzle runtime).
 */
import type { InferSelectModel } from "drizzle-orm";
import type { editDiff } from "../db/edit-diff.js";

export type EditDiff = InferSelectModel<typeof editDiff>;
