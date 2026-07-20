---
kind: adr
title: Public news-site rendering & hosting
status: accepted
supersedes: ~
---

# ADR-0004 — Public news-site rendering & hosting

## Context

The org news site (NWS-1..6, DEC-9) is Steward's first **public, unauthenticated,
SEO-critical** surface: NWS-2 requires server-rendered, perfectly indexable
pages with correct Open Graph unfurls, sitemaps, and canonical URLs, read by
the org's donors (journey UI-58). The application itself is a Vite + React
**SPA** (ADR-0002) — client-rendered, which cannot satisfy SEO/SSR. So the
public surface needs its own rendering path. DEC-10 additionally fixes the URL
strategy (dev app-path, prod dedicated news domain, org-selected subdomain) and
the reservation rule (URLs live while the account is active).

## Options considered

1. **SSR inside the existing Node/tRPC backend.** One service; but the backend
   is a tRPC + WebSocket API not built for HTML rendering, and mixing a public
   cache-heavy surface with the authenticated app complicates both. Rejected.
2. **Static generation on publish** — pre-render article HTML to the Blob/CDN
   on publish. Simplest hosting and superb performance, but every edit or
   unpublish triggers a rebuild, and the dynamic surfaces (topic pages, front
   page ordering, per-org routing) get awkward. Rejected as the primary model,
   retained as a caching optimization.
3. **Dedicated React SSR service reusing SPA/DS components.** Keeps one
   framework (ADR-0002's thesis) and reuses the shared DS component inventory —
   notably DS-5's CitationBlock, which DS-5 shares between inbox external
   cards and public articles. Con: ships React/JS to a pure reading page that
   needs none, and couples the public surface's build to the app's.
4. **Dedicated SSR/SSG renderer, Astro + React islands (chosen).** A small
   SEO-first renderer serves the public news pages as its own deployable. Reads
   published ContentItem article data from the backend and consumes the DS-8
   tokens directly (plain CSS custom properties — framework-agnostic, so
   token-sync is cheap). Wins over option 3 for a near-zero-JS reading page and
   clean isolation; the cost is that shared DS components (CitationBlock) are
   re-expressed as React islands or Astro components — a GR-7 conformance
   discipline the design review must hold (tokens keep them visually identical).
   Honest con: a second front-end build and that shared-component discipline.

## Decision

A **dedicated public renderer** (Astro + React islands) is the news surface's
rendering path, deployed separately from the authenticated Vite SPA and from the
tRPC/WS backend. It is modelled as its own container/component in the
architecture overview (ARC) and sits behind the same **ports** as everything
else (ADR-0003) — Blob for images, the backend read-API for article/topic data.

- **Rendering + cache invalidation**: SSR for freshness, fronted by a CDN with
  **tag-based purge** — publishing, editing, or unpublishing an article purges
  its cache tag so a recalled article stops serving **at once** (this is what
  makes SEC-8's "aggressively cacheable" and "takedown is immediate"
  simultaneously true — SSR alone only helps cache *misses*). Optional static
  pre-render remains a pure performance optimization under the same purge.
- **URL routing (DEC-10)**: dev → `<app>/news/<org-slug>`; prod → a dedicated
  Steward news domain by org slug; org may bind its own `news.<org-domain>`
  (NWS-6) — the renderer resolves org-by-host/path uniformly.
- **Reservation (Q-11)**: a route resolves while the org account is active;
  inactive accounts release/tombstone per the SEC takedown posture.
- **Templating**: the DS-8 org-branded template (name/logo/accent slots only,
  Q-10) + the "published with Steward" footer; conformance governed by GR-7.

## Consequences

- The public surface is isolated from the app: its cache/SEO/rate-limit posture
  (SEC-8) and its availability are independent of the authenticated app.
- NWS specs `constrained-by` this ADR + the DS-8 component + the XN-3/XN-4
  approved screens.
  *(Amended 2026-07-19, DEC-18: originally pointed at UI-60/UI-61; those live
  in the superseded register and cannot pass the design gate — the successor
  screens are XN-3/XN-4, in `experience/public.yaml` since the DEC-28 by-domain
  split of the experience spine.)*
- A second front-end deployable to build and operate — accepted as the cost of
  SEO the SPA structurally cannot deliver; kept small (read-only, few routes).
- Ties to ADR-0003: images via the Blob port, data via the backend read-API,
  so the renderer inherits the same dev/single-instance/cloud portability.
