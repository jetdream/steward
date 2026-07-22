/**
 * @module @backend
 *
 * The Steward application server (ARC-3): the tRPC API, the LLM pipeline
 * (PIPE-*), persistence via Drizzle against Postgres + pgvector (ARC-4),
 * realtime WebSocket push, auth (BetterAuth), and the ports-and-adapters
 * boundary to external services (ADR-0003). The dev server lives in server.ts;
 * `AppRouter` is the API contract type the client imports.
 */
export { createDb, type Database } from "./db/client.js";
export type { AppRouter } from "./router.js";
