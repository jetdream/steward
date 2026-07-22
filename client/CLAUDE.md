# client/ — `@client` web app

**Purpose.** The Steward founder-facing web app: the React SPA that renders the
One-Home experience spine (the app shell, the stream, the approval surfaces).

**Place in the architecture.** Runtime container `ARC-2` (Client / `@client`).
Stack: Vite + React + Tailwind + ShadCN (`ADR-0001` design-system substrate,
re-themed with the steward tokens). Served in prod behind the Cloudflare CDN
(`DEC-36`).

**How it is used.** All backend access goes through **domain-specific API React
hooks** — components never call tRPC or `fetch` directly (constitution "Client").
Cross-boundary types are imported from `@shared`. UI is built only on a screen
that has passed the design gate (experience spine + the design system, `GR-7`);
see `method/ui.md`.

**Structure.** `src/` — folder-module layout (feature areas mirror the experience
spine); `src/index.ts` is the seed entry. React app entry, routing, and the
design-system component layer land with the walking-skeleton increment.
