/**
 * DM-3 StrategyDoc — the Drizzle table, the SINGLE source of its shape (DEC-39).
 * Persists Strategy sections (a) what-to-post/not, (b) tone of voice, (d) standing
 * instructions, (e) channel-specific (STR-1) — VERSIONED with diffs (STR-2): each
 * accepted edit APPENDS a new row (higher `version`); prior versions are retained
 * (VAL-3) and the CURRENT doc is the highest version per org. Section (c)
 * restrictions/compliance/guardrails is NOT stored here — it is a derived VIEW
 * over the platform guardrails (GR-1..GR-6) + the active Memory rule/taboo overlay
 * (MEMS-3), never persisted or doc-versioned (DEC-22). Owned by Org (DM-1).
 */
import { index, integer, jsonb, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { organization } from "./auth-schema.js";

/** Section (e): per-channel instruction strings, keyed by platform (fb/ig/threads/x). */
export type ChannelInstructions = Record<string, string>;

export const strategyDoc = pgTable(
  "strategy_doc",
  {
    // Generated in the @backend write path (node crypto) — keeps @shared node-free.
    id: text("id").primaryKey(),
    /** Owning org (DM-1). Every query is org-scoped (ACC-3). */
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    /** Monotonic per-org version (STR-2): retained history; the current doc is the max. */
    version: integer("version").notNull(),
    /** (a) what to post / what not to post — soft editorial preferences (TOP-4). */
    sectionA: text("section_a").notNull().default(""),
    /** (b) tone of voice — description + concrete examples. */
    sectionB: text("section_b").notNull().default(""),
    /** (d) specific standing instructions. */
    sectionD: text("section_d").notNull().default(""),
    /** (e) channel-specific instructions, per platform (hard limits consumed by GEN-2/GEN-5). */
    sectionE: jsonb("section_e").$type<ChannelInstructions>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("strategy_doc_org_idx").on(t.orgId),
    // One row per (org, version) — the append-only version sequence (STR-2).
    unique("strategy_doc_org_version_uq").on(t.orgId, t.version),
  ],
);
