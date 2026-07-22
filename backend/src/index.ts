/**
 * @module @backend
 *
 * The Steward application server (ARC-3): the tRPC API, the LLM pipeline
 * (PIPE-*), persistence via Drizzle against Postgres + pgvector (ARC-4),
 * realtime WebSocket push, auth (BetterAuth), and the ports-and-adapters
 * boundary to external services (ADR-0003). Modules land per capability as the
 * frontier is built; this seed only proves the `@shared` import path resolves
 * through the gate.
 */
import { SHARED_PACKAGE } from "@shared";

/** The shared package this server binds its cross-boundary types to. */
export const BACKEND_SHARED_BINDING = SHARED_PACKAGE;
