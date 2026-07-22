# shared/ — `@shared` cross-boundary types

**Purpose.** The single home for types and pure helpers that cross a runtime
boundary — anything `@backend`, `@client`, and `@news` must agree on (constitution
"Code Standards"). Client and backend **import** these; they never redefine them.

**Place in the architecture.** Not a runtime container — a code package consumed
by `ARC-2` (Client / `@client`), `ARC-3` (Backend / `@backend`), and `ARC-23`
(Public News Renderer / `@news`). Import via the `@shared` alias (tsconfig `paths`;
bundler/loader aliases join per consumer).

**What it holds** (the type spine — DEC-37 (3), single-source per DEC-39):
- **`db/schema.ts`** — the Drizzle tables: the ONE definition of each entity's
  shape (`DM-*`). Entity types + validators are derived from these, never
  re-declared. (BetterAuth's generated tables join here with the ACCS wiring.)
- **`db/validators.ts`** — Zod validators derived from the tables (drizzle-zod).
- **`entities/`** — entity TYPES (`InferSelectModel`, e.g. `Org`) + value objects
  (e.g. `NewsConfig`); the branded-ID registry (`ids.ts`); the domain enums
  (`enums.ts`); the boundary-parse helper (`parse.ts`).

**Structure.** `src/index.ts` is the client-facing barrel: branded IDs, enums,
value objects, the parse helper, and entity TYPES (erased at runtime, so the
client bundle stays free of drizzle-orm). Tables + validators live under `src/db/*`
and are imported by `@backend`.

> Convention (DEC-39): `@shared` may depend on drizzle-orm + drizzle-zod + Zod
> (pure schema definitions), but NOT on a DB connection, a server/Node-only API,
> or a UI framework — it is imported by `@client` and `@news` too. The connection,
> queries, and migrations live in `@backend`.
