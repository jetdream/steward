/**
 * @module @news
 *
 * The public news renderer (ARC-23): a separate SSR deployable (Astro + React
 * islands, ADR-0004) that serves each org's hosted news page — SEO-optimized,
 * fully indexable, Open Graph, org-branded via the DS-8 sanctioned slots
 * (name + logo + accent). Fronted by the Cloudflare CDN with tag-based purge as
 * the immediate-takedown mechanism (DEC-36, SEC-8). Reuses `@shared` types; it
 * does not import `@client` or `@backend` app code. This seed only proves the
 * `@shared` import path resolves through the gate.
 */
import { SHARED_PACKAGE } from "@shared";

/** The shared package this renderer binds its cross-boundary types to. */
export const NEWS_SHARED_BINDING = SHARED_PACKAGE;
