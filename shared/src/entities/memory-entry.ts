/**
 * DM-2 MemoryEntry — the cross-boundary entity TYPE, DERIVED from the single
 * source (DEC-39): the `memory_entry` table. Type-only imports, so this pulls no
 * runtime code (drizzle) into the client bundle.
 *
 * `MemoryEntryView` is the CLIENT-SAFE shape: it omits the raw `embedding`
 * vector (a large server-only retrieval artifact, never sent to the client —
 * the same single-sourced `Omit` discipline ChannelConnection uses for its
 * SEC-10 secret). The Knowledge view (MEM-3, P1) consumes this.
 */
import type { InferSelectModel } from "drizzle-orm";
import type { memoryEntry } from "../db/memory.js";

/** A MemoryEntry row exactly as stored (server-side; includes the embedding). */
export type MemoryEntry = InferSelectModel<typeof memoryEntry>;

/** The client-safe MemoryEntry projection — no raw embedding vector. */
export type MemoryEntryView = Omit<MemoryEntry, "embedding">;
