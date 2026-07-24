/**
 * DM-6 ChatSession + DM-7 ChatMessage — the resumable conversation transcript
 * (DEC-39 single source), shared by the Interviewer (INT-2) and agentic chat
 * (CHT), owned by Org (DM-1). These tables hold the TRANSCRIPT only; the org's
 * knowledge lives in Memory (DM-2) — an interview answer / chat remark becomes a
 * MemoryEntry via the MEMS-1 write path, never a fact mined from here.
 */
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { chatMessageRoles } from "../enums.js";
import { organization } from "./auth-schema.js";

export const chatSession = pgTable(
  "chat_session",
  {
    // Generated in the @backend write path (node crypto) — keeps @shared node-free.
    id: text("id").primaryKey(),
    /** Owning org (DM-1). Every query is org-scoped (ACC-3). */
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    /** Bumped on each message — the resumable session's last-activity marker (INT-2). */
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("chat_session_org_idx").on(table.orgId)],
);

export const chatMessage = pgTable(
  "chat_message",
  {
    id: text("id").primaryKey(),
    /** Owning org (DM-1) — denormalized for org-scoped reads (ACC-3). */
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    /** The session this message belongs to (DM-6). */
    sessionId: text("session_id")
      .notNull()
      .references(() => chatSession.id, { onDelete: "cascade" }),
    /** user (founder) | assistant (Steward) | system. */
    role: text("role", { enum: chatMessageRoles }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // Transcript reads are per-session in chronological order (INT-2 resumability).
  (table) => [index("chat_message_session_idx").on(table.sessionId, table.createdAt)],
);
