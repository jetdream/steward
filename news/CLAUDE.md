# news/ — `@news` public news renderer

**Purpose.** The public, per-org hosted news page — the SEO-optimized, fully
indexable long-form publishing surface (Open Graph, Medium-like reading layout)
that also carries the "published with Steward" footer.

**Place in the architecture.** Runtime container `ARC-23` (Public News Renderer),
a **separate deployable** from the app (`ADR-0004`): Astro SSR + React islands.
Fronted by the Cloudflare CDN; edge cache with tag-based purge is the
immediate-takedown mechanism (`DEC-36`, `SEC-8`). Org branding uses only the
`DS-8` sanctioned slots (name + logo + accent — no per-org typography), so it
never violates `GR-7`.

**How it is used.** Renders published `ContentItem` news variants (`NWS-*`). It
reuses `@shared` types but does **not** import `@client` or `@backend` application
code — it is an independent SSR surface. URL strategy is configurable (`DEC-10`,
`NWS-6`).

**Structure.** `src/` — seed entry only. The Astro project (pages, layouts,
islands, its own `tsconfig` extending `astro/tsconfigs/strict`) lands when the
news renderer is built.
