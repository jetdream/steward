/**
 * Drizzle persistence schema — the SINGLE source of truth for entity shape
 * (DEC-39). Tables live here in @shared so their inferred types + derived
 * validators are shared by @backend (queries) and @client/@news (via @shared),
 * never re-declared. This file holds only pure table DEFINITIONS (no DB handle);
 * the connection, queries, and migrations live in @backend.
 *
 * Per-capability tables are added here as verticals land. The BetterAuth-generated
 * tables (user/session/organization/member/...) join here with the ACCS wiring.
 */
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { NewsConfig } from "../entities/news-config.js";

/** DM-1 Org — the tenant / aggregate root. */
export const orgs = pgTable("orgs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  donationUrl: text("donation_url"),
  newsConfig: jsonb("news_config").$type<NewsConfig>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
