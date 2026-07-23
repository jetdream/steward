/**
 * DM-1 Org — the cross-boundary entity type, DERIVED from the single source
 * (DEC-39): the BetterAuth `organization` table. No hand-written field list; a
 * type-only import, so `Org` pulls no runtime code into the client bundle.
 * Steward Org-level domain fields (donationUrl, news addressing) are added to
 * `organization` via the plugin's `additionalFields` by their vertical, and will
 * appear here automatically. `metadata` is BetterAuth-internal — not exposed.
 */
import type { InferSelectModel } from "drizzle-orm";
import type { organization } from "../db/auth-schema.js";

/** An Org's cross-boundary fields, selected from the `organization` table. */
export type Org = Pick<
  InferSelectModel<typeof organization>,
  "id" | "name" | "slug" | "logo" | "createdAt"
>;
