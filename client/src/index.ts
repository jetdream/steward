/**
 * @module @client
 *
 * The Steward web app (ARC-2): the React SPA (Vite + Tailwind + ShadCN) that
 * renders the One-Home experience spine. Every call to the backend goes through
 * a domain-specific API React hook — never a raw fetch/tRPC call from a component
 * (constitution "Client"). UI is built only on an approved screen (the design
 * gate). This seed only proves the `@shared` import path resolves through the gate.
 */
import { SHARED_PACKAGE } from "@shared";

/** The shared package this client binds its cross-boundary types to. */
export const CLIENT_SHARED_BINDING = SHARED_PACKAGE;
