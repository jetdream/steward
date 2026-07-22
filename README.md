# Steward (working name)

An AI communications manager for small US nonprofits: it learns the organization, plans and writes donor-facing content, publishes across channels almost autonomously — and the founder can simply talk to it.

This is a **spec-first project built by AI agents**. Start here:

- [CLAUDE.md](CLAUDE.md) — the project constitution
- [.spec/CLAUDE.md](.spec/CLAUDE.md) — the documentation system: layers, ID grammar, change protocol
- [.spec/product/overview.md](.spec/product/overview.md) — what the product is (system concept)
- [.spec/product/vision.md](.spec/product/vision.md) — why it exists (narrative)

Before any change, follow the change protocol in [.spec/CLAUDE.md](.spec/CLAUDE.md) and run `npm run docs:check` (the pre-commit hook enforces it).

## Getting started

```bash
./.coder/setup.sh   # one command: toolchain, dev infra, .env, DB migrations
```

Then the gate (also enforced by the git hooks):

```bash
npm run gate        # docs-check + typecheck (strict TS7) + lint (biome)
```

Source layout — four workspace roots (aliases `@shared` / `@backend` / `@client` / `@news`):
`shared/` (cross-boundary types), `backend/` (API, pipeline, persistence), `client/` (React SPA), `news/` (public SSR news renderer). See each folder's `CLAUDE.md`.

## Development infrastructure

Local dev infra lives in [`.coder/`](.coder/) as independent Docker Compose stacks — the self-contained dev environment of DEC-36 / ADR-0007. `./.coder/setup.sh` provisions everything; the stacks can also be driven directly:

| Stack | What | Endpoint |
|---|---|---|
| `.coder/postgres` | Postgres 18 + **pgvector** (ARC-4) + Drizzle Gateway (DB GUI) | `postgres://user:password@localhost:5432/main` · gateway `:4983` |
| `.coder/minio` | MinIO — S3-compatible blob store; the dev adapter for the ADR-0003 blob port (prod = Cloudflare R2) | S3 `:9000` · console `:9001` |
| `.coder/grafana` | Grafana **LGTM** — OpenTelemetry backend (traces/logs/metrics) | UI `:3030` · OTLP `:4318` |
| `.coder/playwright` | Headed Chromium behind noVNC — the browser for **AI testing via the Playwright MCP** (`.mcp.json`, CDP `:9222`) | noVNC `:6080` · CDP `:9222` |

Common commands:

```bash
npm run infra:up          # start Postgres + MinIO + Grafana
npm run infra:down        # stop them
npm run db:generate       # generate a Drizzle migration from backend/src/db/schema.ts
npm run db:migrate        # apply migrations
npm run dev:playwright:build && npm run dev:playwright   # start the Playwright browser container
```

Configuration is `.env` (generated from [`.env.example`](.env.example) by `setup.sh`). `.mcp.json` wires two MCP servers: **context7** (library docs) and **playwright** (drives the container's browser over CDP for AI testing).
