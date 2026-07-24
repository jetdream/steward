/**
 * DM-6/DM-7 transcript persistence for the resumable interview (INTS-2). Sessions
 * + chronological messages, org-scoped (ACC-3). The transcript is NOT the org's
 * knowledge — answers flow to Memory via MEMS-1 (the interviewer module).
 */
import { randomUUID } from "node:crypto";
import type { ChatMessage, ChatMessageRole, ChatSession, OrgId } from "@shared";
import { chatMessage, chatSession } from "@shared/db/schema.js";
import { and, asc, eq } from "drizzle-orm";
import type { Database } from "../db/client.js";

/** Open a new resumable conversation session (DM-6). */
export async function startSession(db: Database, orgId: OrgId): Promise<ChatSession> {
  const [row] = await db.insert(chatSession).values({ id: randomUUID(), orgId }).returning();
  if (!row) throw new Error("startSession: insert returned no row");
  return row;
}

/** Append a message to a session (DM-7) + touch the session's updatedAt (resumability). */
export async function appendMessage(
  db: Database,
  orgId: OrgId,
  sessionId: string,
  role: ChatMessageRole,
  content: string,
): Promise<ChatMessage> {
  const [row] = await db
    .insert(chatMessage)
    .values({ id: randomUUID(), orgId, sessionId, role, content })
    .returning();
  if (!row) throw new Error("appendMessage: insert returned no row");
  await db.update(chatSession).set({ updatedAt: new Date() }).where(eq(chatSession.id, sessionId));
  return row;
}

/** The session transcript in chronological order, org-confined (INTS-2 resumability). */
export async function getTranscript(
  db: Database,
  orgId: OrgId,
  sessionId: string,
): Promise<ChatMessage[]> {
  return db
    .select()
    .from(chatMessage)
    .where(and(eq(chatMessage.orgId, orgId), eq(chatMessage.sessionId, sessionId)))
    .orderBy(asc(chatMessage.createdAt));
}
