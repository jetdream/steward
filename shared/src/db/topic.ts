/**
 * DM-13 Topic — the Drizzle table, the SINGLE source of its shape (DEC-39). A
 * content topic / editorial theme (TOP, DEC-23), owned by Org (DM-1). The active
 * set (`status = 'active'`) IS the editorial agenda (TOP-4) — a derived view, not
 * a separate entity. @backend imports this for queries/migrations; @client/@news
 * get the derived `Topic` TYPE via @shared.
 *
 * TOPS-1 SCOPE — description + why-it-fits + the resolvable evidence pointer
 * (grounding guard) + provenance + status + the supersession pair (evolution,
 * VAL-3, like memory_entry). DEFERRED (its own migration): the TOP-2 research
 * strategy package (TOPS-2, when the Radar consumes it).
 *
 * Evolution (VAL-3, like DM-2): a re-described topic SUPERSEDES its prior form
 * (supersededAt/By set on the old row, retained not overwritten); a row is ACTIVE
 * iff `supersededAt IS NULL` AND `status = 'active'`. Hard delete is reserved for
 * the wrong-org purge (MEMS-2) + BIL-2 account deletion (SEC-4, org-confidential).
 */
import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { EvidencePointer } from "../entities/topic.js";
import { topicProvenances, topicStatuses } from "../enums.js";
import { organization } from "./auth-schema.js";

export const topic = pgTable(
  "topic",
  {
    // Generated in the @backend write path (node crypto) — keeps @shared node-free.
    id: text("id").primaryKey(),
    /** Owning org (DM-1). Every query is org-scoped (ACC-3). */
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    /** Deterministic canonical key of the theme — dedup + declined-suppression (TOPS-3). */
    topicKey: text("topic_key").notNull(),
    /** Plain-language description of the theme (TOP-1). */
    description: text("description").notNull(),
    /** Why this topic fits THIS org + audience — the grounded rationale (TOP-1). */
    whyItFits: text("why_it_fits").notNull(),
    /** The resolvable Memory/Radar evidence pointer (TOPS-1 grounding guard). */
    evidence: jsonb("evidence").$type<EvidencePointer>().notNull(),
    /** system-derived (identification) | founder-added (agenda edit / adopt). */
    provenance: text("provenance", { enum: topicProvenances }).notNull(),
    /** proposed | active | retired — the active set is the agenda (TOP-4). */
    status: text("status", { enum: topicStatuses }).notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    /** Set when this row is superseded by a re-description (VAL-3); null ⇒ current. */
    supersededAt: timestamp("superseded_at"),
    /** The row that superseded this one (self-reference, like memory_entry). */
    supersededBy: text("superseded_by"),
  },
  (table) => [
    // Org-scoped agenda reads (ACC-3) + the dedup lookup by canonical key.
    index("topic_org_status_idx").on(table.orgId, table.status),
    index("topic_org_key_idx").on(table.orgId, table.topicKey),
  ],
);

/** Topic ⇒ Org (DM-1) + the supersession self-link (evolution, VAL-3). */
export const topicRelations = relations(topic, ({ one }) => ({
  org: one(organization, { fields: [topic.orgId], references: [organization.id] }),
  supersededByTopic: one(topic, {
    fields: [topic.supersededBy],
    references: [topic.id],
    relationName: "topic_supersession",
  }),
}));
