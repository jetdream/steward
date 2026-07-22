/**
 * DM-1 Org — the cross-boundary entity type, DERIVED from the `orgs` table
 * (the single source, DEC-39). No hand-written field list: the table is the one
 * definition, and this type follows it. A type-only import, so importing `Org`
 * from @shared pulls no runtime code into the client bundle.
 */
import type { InferSelectModel } from "drizzle-orm";
import type { orgs } from "../db/schema.js";

/** The Org entity as read from persistence (id, name, donationUrl, newsConfig, createdAt). */
export type Org = InferSelectModel<typeof orgs>;
