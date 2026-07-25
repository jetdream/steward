# client/ — `@client` web app

**Purpose.** The Steward founder-facing web app: the React SPA that renders the
One-Home experience spine (the app shell, the stream, the approval surfaces).

**Place in the architecture.** Runtime container `ARC-2 v2` (Client / `@client`).
Stack: Vite + React + Tailwind (`ADR-0001` design-system substrate, re-themed
with the steward tokens). Served in prod behind the Cloudflare CDN (`DEC-36`).

**Component layer (`DEC-42` / `ADR-0011`).** Founder-facing surfaces compose the
**DSS inventory** in `src/ds/` over **native platform primitives** — a
**NON-MODAL `<dialog>.show()`** (never `showModal()`) with **per-region `inert`**
for the summoned pane (the stream inerted, the pinned zone excluded and still
live, per `XH-12`/`DSS-24`), and a roving-tabindex tablist for variant tabs
(`DSS-25`). **No ShadCN, no Radix on founder or public surfaces.**

> **Why non-modal is load-bearing, not a style choice:** a top-layer modal —
> Radix's `hideOthers()` *or* native `showModal()` — inerts the entire document
> outside itself, which makes `inert = false` on the pinned zone a **no-op**.
> GR-3 holds, publish failures and channel re-auth would go keyboard-unreachable
> and unannounced, and a click on a visibly-undimmed pinned card would dismiss
> the pane instead of acting on it. Both were verified in headless Chromium
> during the ADR-0011 challenge rounds. `Escape`, scroll lock, the focus trap and
> dismissal are therefore hand-written — and held by the e2e suite.

The scope is by *surface*, not package — the internal ops/admin console keeps its
`DEC-35` allowance to compose shadcn primitives here. Founder surfaces also use
only the `desktop:` breakpoint variant (two layout modes, DEC-19/DEC-20); the
Tailwind defaults stay defined for that console's shadcn source.

**How it is used.** All backend access goes through **domain-specific API React
hooks** — components never call tRPC or `fetch` directly (constitution "Client").
Cross-boundary types are imported from `@shared`. UI is built only on a screen
that has passed the design gate (experience spine + the design system, `GR-7`);
see `method/ui.md`.

**Structure.** `src/` — folder-module layout (feature areas mirror the experience
spine); `src/index.ts` is the seed entry. React app entry, routing, and the
design-system component layer land with the walking-skeleton increment.
