/**
 * Drizzle persistence schema (ARC-4: Postgres + pgvector). Table definitions are
 * the single source for PERSISTENCE row types (`$inferSelect`/`$inferInsert`,
 * DEC-29) — a backend-internal shape, distinct from the cross-boundary `@shared`
 * entity it maps to (see ./map.ts). This seeds the `orgs` table (DM-1) as the
 * inference pattern; per-capability tables are added by their verticals.
 */
import type { NewsConfig } from "@shared";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** DM-1 Org — the tenant / aggregate root. */
export const orgs = pgTable("orgs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  donationUrl: text("donation_url"),
  newsConfig: jsonb("news_config").$type<NewsConfig>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** The persisted Org row type — inferred from the table (never hand-written). */
export type OrgRow = typeof orgs.$inferSelect;
/** The Org insert type — inferred from the table. */
export type NewOrgRow = typeof orgs.$inferInsert;
