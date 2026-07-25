/**
 * @module @client
 *
 * The Steward web app (ARC-2 v2): the React SPA (Vite + Tailwind) that renders
 * the One-Home experience spine. Founder surfaces compose the DSS design-system
 * inventory over NATIVE platform primitives — no ShadCN/Radix (DEC-42, ADR-0011);
 * internal staff tools keep the DEC-35 shadcn allowance. Every backend call goes through a
 * domain-specific API React hook (constitution "Client"). UI is built only on an
 * approved screen (the design gate). The React app entry lands with the
 * walking-skeleton increment; this seed consumes a `@shared` type to hold the
 * import path.
 */
import type { Org } from "@shared";

/** A minimal Org projection for client list surfaces (Property Selection, DRY). */
export type ClientOrgSummary = Pick<Org, "id" | "name">;
