/**
 * DM-8 ExternalItem — the Drizzle table, the SINGLE source of its shape (DEC-39).
 * A candidate surfaced by the External Radar (ARC-16 / EXT-1): a discovered
 * event/news/research item with a provenance-bound, dereferenceable source, a
 * relevance rationale, an optional event date, and the founder's post-read triage
 * DISPOSITION (DEC-20 — null until triaged). Retained + readable in the Discoveries
 * feed (EXT-5); a `saved-for-later` item joins the SAVED POOL the planner queries
 * (GEN-1). Owned by Org (DM-1).
 */
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { externalDispositions } from "../enums.js";
import { organization } from "./auth-schema.js";

export const externalItem = pgTable(
  "external_item",
  {
    // Generated in the @backend write path (node crypto) — keeps @shared node-free.
    id: text("id").primaryKey(),
    /** Owning org (DM-1). Every query is org-scoped (ACC-3). */
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    /** The source/publisher name. */
    source: text("source").notNull(),
    /** The dereferenceable, provenance-bound link (EXTS-1 R-4 guard; GR-5 citation). */
    url: text("url").notNull(),
    /** The headline the read-first feed leads with (EXTS-5). */
    title: text("title").notNull(),
    /** A short summary shown before any ask (EXTS-5 read-first). */
    summary: text("summary").notNull(),
    /** Why this fits THIS org's agenda + geography (EXTS-1) — the relevance rationale. */
    relevanceRationale: text("relevance_rationale").notNull(),
    /** The agenda topic that drove this discovery (soft reference to DM-13; nullable). */
    topicId: text("topic_id"),
    /** The founder's post-read triage (DEC-20); null = not yet triaged. */
    disposition: text("disposition", { enum: externalDispositions }),
    /** Event date for an event-tied item — drives the time-sensitive flag while upcoming. */
    eventDate: timestamp("event_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("external_item_org_idx").on(table.orgId),
    // The Discoveries feed + the saved-pool query filter by org + disposition (EXT-5/GEN-1).
    index("external_item_org_disposition_idx").on(table.orgId, table.disposition),
  ],
);
