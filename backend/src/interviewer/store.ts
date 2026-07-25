/**
 * DM-6/DM-7 transcript persistence for the resumable interview (INTS-2). Sessions
 * + chronological messages, org-scoped (ACC-3). The transcript is NOT the org's
 * knowledge — answers flow to Memory via MEMS-1 (the interviewer module).
 */
import { randomUUID } from "node:crypto";
import type { ChatMessage, ChatMessageRole, ChatSession, OrgId } from "@shared";
import { chatMessage, chatSession } from "@shared/db/schema.js";
import { and, asc, desc, eq } from "drizzle-orm";
import type { Database } from "../db/client.js";

/** Open a new resumable conversation session (DM-6). */
export async function startSession(db: Database, orgId: OrgId): Promise<ChatSession> {
  const [row] = await db.insert(chatSession).values({ id: randomUUID(), orgId }).returning();
  if (!row) throw new Error("startSession: insert returned no row");
  return row;
}

/**
 * The org's most recently touched session, or null (DM-6).
 *
 * INTS-2 promises the interview is "resumable forever", and until this existed
 * there was no way to FIND the session again: a client that reloaded could only
 * open a new one, so the transcript it was resuming became unreachable. The
 * caller resumes this or opens a first one.
 */
export async function latestSession(db: Database, orgId: OrgId): Promise<ChatSession | null> {
  const [row] = await db
    .select()
    .from(chatSession)
    .where(eq(chatSession.orgId, orgId))
    .orderBy(desc(chatSession.updatedAt))
    .limit(1);
  return row ?? null;
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
