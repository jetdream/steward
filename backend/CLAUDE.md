# backend/ — `@backend` application server

**Purpose.** The Steward server: the tRPC API surface the client calls, the LLM
content pipeline (`PIPE-*`), persistence, realtime push, auth, and every adapter
to an external service.

**Place in the architecture.** Runtime container `ARC-3` (Backend / `@backend`).
Talks to `ARC-4` (Datastore — Postgres + pgvector) via Drizzle, serves `ARC-2`
(Client) over tRPC + WebSocket, and reaches external services **only** through
ports-and-adapters (`ADR-0003`) so domain code stays provider-agnostic
(dev → single-instance → managed parity).

**How it is used.** The client never calls the backend directly — only through
domain-specific API hooks (constitution "Client"). Cross-boundary types come from
`@shared`; the backend never redefines them.

**Structure.** `src/` — folder-module layout, one module per capability, each with
its own `CLAUDE.md` and a header comment naming the spec IDs it implements
(`@implements <SPEC-ID> vN`). Modules are added just-in-time as frontier specs are
built. Landed so far: the AI substrate (`harness`, `observability`, `ports`,
`adapters`, `eval`), the domain modules (`memory`, `content`, `topics`,
`onboarding`, `accounts`), identity (`auth`), persistence (`db`), and the API
surface (`trpc.ts`, `context.ts`, `router.ts`, `routers/`, `server.ts`).

**Key boundaries (as modules land):** the job/blob/email/publishing/messaging/LLM
ports of `ADR-0003`; auth via BetterAuth (dev-login by email in `development`,
Google sign-in in `production` — SEC-7); server-side org confinement on every
request (`ACC-3`).
