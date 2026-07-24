/**
 * @module @shared
 *
 * Cross-boundary types and pure helpers shared by @backend, @client, and @news
 * (constitution "Code Standards"). Entity DEFINITIONS are the Drizzle tables in
 * ./db/schema (the single source, DEC-39); this client-facing barrel re-exports
 * the branded IDs, domain enums, the boundary-parse helper, and entity TYPES
 * (erased at runtime — the client bundle stays free of drizzle-orm). The tables
 * live under ./db/* and are imported by @backend (which owns the DB connection,
 * queries, and migrations).
 *
 * Architecture: no runtime container of its own — a code package serving
 * ARC-2 (@client), ARC-3 (@backend), and ARC-23 (@news).
 */

export * from "./entities/channel-connection.js";
export type { ContentItem } from "./entities/content-item.js";
export type { ExternalItem } from "./entities/external-item.js";
export type { MemoryEntry, MemoryEntryView } from "./entities/memory-entry.js";
export * from "./entities/memory-source.js";
export type { ModelCall } from "./entities/model-call.js";
export type { Org } from "./entities/org.js";
export type { ChannelInstructions, StrategyDoc } from "./entities/strategy-doc.js";
export { EvidencePointer, type Topic } from "./entities/topic.js";
export * from "./enums.js";
export * from "./ids.js";
export * from "./parse.js";
