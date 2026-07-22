# shared/ — `@shared` cross-boundary types

**Purpose.** The single home for types and pure helpers that cross a runtime
boundary — anything `@backend`, `@client`, and `@news` must agree on (constitution
"Code Standards"). Client and backend **import** these; they never redefine them.

**Place in the architecture.** Not a runtime container — a code package consumed
by `ARC-2` (Client / `@client`), `ARC-3` (Backend / `@backend`), and `ARC-23`
(Public News Renderer / `@news`). Import via the `@shared` alias (tsconfig `paths`;
bundler/loader aliases join per consumer).

**What it will hold** (grows by DEC-37 deliverable 3 — the type spine):
- Drizzle-inferred row/insert types for the persisted model (`DM-*`), so the
  schema is the one source and TS types follow it.
- Zod entity schemas with inferred types, reused for boundary validation
  (no unsafe parsing at any edge).
- The branded-ID registry, built on the `Brand<Base, Name>` primitive seeded in
  `src/index.ts`.

**Structure.** `src/` — folder-module layout; `src/index.ts` is the package entry.

> Convention: keep this package free of runtime/framework dependencies — it is
> imported by every root, including the SSR news renderer.
