/**
 * DM-9 TrustLevel + the publish-control (kill switch) state — the SINGLE source of
 * their shapes (DEC-39), owned by Org (DM-1). Autonomy governs what may publish
 * WITHOUT founder approval, per content category (AUT-1); the kill switch is the
 * always-on revocability (AUT-3). Both are DETERMINISTIC state (LRN-20) — the
 * classifiers that override them (GR-3/GR-8) live in the pipeline, not here.
 */
import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { trustLevels, vetoModels } from "../enums.js";
import { organization } from "./auth-schema.js";

/** DM-9 TrustLevel — one row per (org, content category); the launch state is TL0. */
export const trustLevel = pgTable(
  "trust_level",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    /** The GEN-1 taxonomy category (a content type, "external", or an overlay). */
    category: text("category").notNull(),
    /** TL0 (launch) | TL1 | TL2 — resolved per category, not globally. */
    level: text("level", { enum: trustLevels }).notNull().default("TL0"),
    /** The org's TL1 veto model (DEC-26 founder-operator setting). */
    vetoModel: text("veto_model", { enum: vetoModels }).notNull().default("publish-then-takedown"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique("trust_level_org_category_uq").on(table.orgId, table.category)],
);

/**
 * The AUT-3 kill switch state: a row = publishing PAUSED for a scope. `scope` is
 * "all" (global kill switch) or a channel platform (per-channel pause). Absence =
 * not paused. The publisher (PUBS-1) consults this before scheduling; killing also
 * flips in-flight ChannelVariants scheduled→paused (DM-5).
 */
export const publishControl = pgTable(
  "publish_control",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    /** "all" (global kill switch) or a channel platform (per-channel pause). */
    scope: text("scope").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("publish_control_org_idx").on(table.orgId),
    unique("publish_control_org_scope_uq").on(table.orgId, table.scope),
  ],
);
