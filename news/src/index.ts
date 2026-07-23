/**
 * @module @news
 *
 * The public news renderer (ARC-23): a separate SSR deployable (Astro + React
 * islands, ADR-0004) serving each org's hosted news page — SEO-optimized,
 * org-branded via the DS-8 sanctioned slots. Reuses `@shared` types; does not
 * import @client/@backend app code. The Astro project lands when the renderer is
 * built; this seed consumes a `@shared` type to hold the import path.
 */
import type { Org } from "@shared";

/** What the renderer needs to address an org's page (id + slug). */
export type NewsRenderTarget = Pick<Org, "id" | "slug">;
