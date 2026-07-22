# THE MOST IMPORTANT DOCUMENT IN THE PROJECT

## Project Constitution
This project is fully written by AI agents.
This is spec-driven, spec-first project, nothing can be implemented without being in sync with specification.
Project design and structure is to be done to achieve the best Agentic Experience (AX) possible, all the decisions on how to document and comment the code must be with clear focus on future usage by AI coding agents.

**Before acting on any request, follow the SDLC protocol in [.spec/CLAUDE.md](.spec/CLAUDE.md):** evaluate the request against the docs *first* (Phase A intake), push back on contradictions and surface flexibility-limiting decisions rather than proceeding silently, capture missing information as documentation, and escalate blockers up the layers (Phase C). Requirement/goal/principle changes require a recorded human decision (`DEC-*`, HITL policy). The `/change-request` skill is the runnable form of intake.

## Tech Stack
NodeJS 24
TypeScript 7 - (types always must be checked before commit)
biome linting - (always must be checked before commit)
Vite + React 
Tailwind + ShadCN
Postgres + pgvector with Drizzle
tRPC
WebSocket for realtime updates with light payloads
BetterAuth - Google Sign-in + Dev login by entering email only (no password shortcut)
Vercel AI SDK 7
OpenTelemetry (for dev - LGTM) 

## Code Standards
Shared package to defined types for all crossboundary objects

Follow strict type hygiene, including:
- Strict Typing (no `any`), no exceptions
- Strictly branded types only for IDs
- Never redefine essentially same fields - use Property Selection utility types Pick<>, Omit<> and Union<>
- Use type inference from Drizzle types
- Use Zod type definition with inference for key entities
- No unsafe json/yaml parsing - use Zod for type checking

## Project structure
Four top level src folders:
- client - TS alias @client
- backend - TS alias @backend
- shared - TS alias @shared
- news - TS alias @news (the public news SSR renderer — Astro + React islands, a separate deployable; ADR-0004/ADR-0007/DEC-36)

Folder-module general structure with dedicated shared folder for cross-modules.

## Development infrastructure

Local dev infra lives in `.coder/` as independent Docker Compose stacks — the self-contained dev environment of DEC-36 / ADR-0007. `./.coder/setup.sh` provisions the whole environment (Node 24 toolchain, `npm ci`, the stacks below, `.env` from `.env.example`, DB migrations); it is idempotent. See README.md for details.

- **Postgres 18 + pgvector** (`.coder/postgres`, ARC-4) — `postgres://user:password@localhost:5432/main`; the dev DB. Drizzle Gateway DB GUI on `:4983`.
- **MinIO** (`.coder/minio`) — S3-compatible blob store; the dev adapter for the ADR-0003 blob port (prod = Cloudflare R2).
- **Grafana LGTM** (`.coder/grafana`) — the OpenTelemetry backend for dev (OTLP `:4318`).
- **Playwright** (`.coder/playwright`) — headed Chromium over CDP `:9222` for AI testing via the Playwright MCP; `.mcp.json` also wires context7 (library docs).

Drive it with `npm run infra:up` / `infra:down`, `npm run db:generate` / `db:migrate`, `npm run dev:playwright`. Never add a root `docker-compose.yml` — dev services are the `.coder` stacks.

## Architectural principles
Do not over-abstract where is not necessary and project will not benefit from such abstraction.
Always maintain DRY (Do not Repeat Yourself) principle and separation of concerns.

### Client
All the calls from client to backend only through domain-specific API React hooks.

## Documentation and code commenting

The documentation lives in `docs` folder.

Focus on the main consumer of the documentation and comments - AI coding agents.
The architecture and documentation must be written for AI to provide the context.

Each folder MUST have CLAUDE.md file explaining the purpose and structure of the code underneath (module or submodules) and its relation to requirements or specification.

Each module must have header comment explaining the the purpose of the module, its place in the architecture, how it is used by other modules and what it implements in the specification.

Each exported element must be commented to provide best AX and to be retrievable by LSP (Language Server Processor).

A code must be commented where the meaning is not obvious from code itself, comment minimally enough to make the code understandable. Do not leave any piece of code uncommented if its purpose or implementation approach is not clear.

Do not duplicate the documentation on implementation details - maintain single source of truth principle to avoid discrepancies and getting out of sync, use references/indexing.

Documentation and comments must use mermaid diagrams

## Version control

Trunk-based. `main` is the always-green single source of truth: every commit leaves the docs graph green (the pre-commit hook runs `docs-check`; typecheck + biome join it once code exists). Nothing lands on `main` except by integrating a finished branch.

- Branches: short-lived and purpose-named (e.g. `foundation/scaffold`, `feat/<capability>`), cut from `main`, merged back only once green and — for a spec — challenger-passed.
- Commits: atomic and spec-first — one governance/spec unit, citing its `DEC-*`/spec IDs in the subject; spec + code + tests land together; any `LRN-*` learning is deposited in the same commit.
- Integrate to `main` by fast-forward when possible (keep history linear); never force-push or rewrite pushed history. Tag milestone baselines (e.g. `baseline/pre-code`, the spec-complete/zero-code line).

Adopted 2026-07-22 at the spec-complete baseline; supports the DEC-37 foundation-phase rollout.

## Claude Code Harness

### SEARCH TOOLS
* ALWAYS use `rg` (ripgrep) for all pattern matching or content searching tasks.
* Do NOT use standard `grep` or `find`.