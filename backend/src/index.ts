/**
 * @module @backend
 *
 * The Steward application server (ARC-3): the tRPC API, the LLM pipeline
 * (PIPE-*), persistence via Drizzle against Postgres + pgvector (ARC-4),
 * realtime WebSocket push, auth (BetterAuth), and the ports-and-adapters
 * boundary to external services (ADR-0003). Modules land per capability as the
 * frontier is built; this seeds the persistence layer.
 */
export { createDb, type Database } from "./db/client.js";
export { toOrg } from "./db/map.js";
export { type NewOrgRow, type OrgRow, orgs } from "./db/schema.js";
