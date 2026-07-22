/**
 * Zod validators DERIVED from the Drizzle tables (drizzle-zod) — for validating a
 * full entity at a boundary. Single-sourced from ./schema (DEC-39): the table is
 * the one definition. Backend-facing (pulls drizzle-orm at runtime) — the client
 * imports entity TYPES from @shared, not these.
 */
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { NewsConfig } from "../entities/news-config.js";
import { orgs } from "./schema.js";

/** Validates a persisted Org row (the JSON column refined by NewsConfig). */
export const OrgSelectSchema = createSelectSchema(orgs, { newsConfig: NewsConfig });
/** Validates an Org insert. */
export const OrgInsertSchema = createInsertSchema(orgs, { newsConfig: NewsConfig });
