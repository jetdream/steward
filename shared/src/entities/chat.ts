/**
 * ChatSession (DM-6) + ChatMessage (DM-7) entity types — derived from the Drizzle
 * tables (DEC-39), never re-declared. The resumable INT/CHT transcript.
 * Client-safe (type-only; no drizzle at runtime).
 */
import type { InferSelectModel } from "drizzle-orm";
import type { chatMessage, chatSession } from "../db/chat.js";

export type ChatSession = InferSelectModel<typeof chatSession>;
export type ChatMessage = InferSelectModel<typeof chatMessage>;
