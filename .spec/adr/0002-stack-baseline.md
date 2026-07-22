---
kind: adr
title: Consolidated stack baseline
status: accepted
supersedes: ~
---

# ADR-0002 — Consolidated stack baseline

## Context

The constitution ([/CLAUDE.md](../../CLAUDE.md)) fixes Steward's technology
stack, but the choices were never consolidated into a citable decision record.
The architecture docs (overview, data-model, integrations, llm-pipeline,
security-privacy) need an accepted ADR to cite as the justification for their
baseline before they can reach `approved` (the design gate). This ADR records
the stack as a decision so the architecture set has a foundation to stand on;
it carries low decision content by design — the alternatives were settled at
project founding.

## Options considered

The stack was chosen at founding for a two-engineer team shipping to first
revenue in 12 weeks; the decisive axis was **one language end-to-end, minimal
moving parts, strong typing**. Per-choice alternatives (Python backend, a
meta-framework like Next.js, a non-vector store + external vector DB, REST/
GraphQL instead of tRPC, Prisma-style heavy ORM) were weighed against that axis
and rejected for adding surface or a second language. Honest con of the chosen
set: Vite + React is a client-only SPA with no server rendering — which is why
the public news surface needs a separate renderer (ADR-0004).

## Decision

Adopt and record the constitution-fixed stack as the baseline:

- **Runtime/language**: Node 24, TypeScript (strict, no `any`).
- **Client**: Vite + React, Tailwind + ShadCN; all backend calls through
  domain-specific API React hooks; realtime over WebSocket (light payloads).
- **Backend**: Node 24 + TypeScript service exposing tRPC + WebSocket.
- **Datastore**: Postgres + pgvector (system of record + Memory embeddings),
  accessed through **Drizzle** — a light, type-first query builder whose
  inferred row/insert types are the persistence contract (see the conventions
  register). *(Amended 2026-07-20, DEC-29: Drizzle fills the ORM slot this ADR
  left open. It is NOT the "Prisma-style heavy ORM" the options-considered
  rejected — it adds minimal surface and serves the one-language / strong-typing
  axis rather than working against it.)*
- **Auth**: BetterAuth (Google Sign-in + dev email-only login).
- **LLM**: Vercel AI SDK (provider-abstracted; model selection deferred to
  the skeleton).
- **Observability**: OpenTelemetry, LGTM stack in dev.
- **Source layout**: `@client`, `@backend`, `@shared` — folder-modules per
  capability, shared package for cross-boundary types.
  *(Amended 2026-07-22, DEC-36/ADR-0007: a 4th root `@news` is added — the public
  news SSR renderer (Astro + React islands, ADR-0004), a separate deployable that
  reuses `@shared` + the DS-8 tokens. Originally three roots.)*

## Consequences

- The architecture docs cite this ADR as their stack baseline; ADR-0003
  (portability) and ADR-0004 (news rendering) build on it.
- The SPA/no-SSR property is a binding constraint on any
  public/SEO surface — routed through ADR-0004 rather than bolted onto the
  SPA.
- Model selection, job/queue/storage/email infra, and the public renderer are
  deliberately **not** fixed here — they are separate decisions (ADR-0003,
  ADR-0004, and deferred ADRs), so this baseline stays stable as those evolve.
- Revisit if the founding constraints change (team size, the 12-week clock, or
  a second language becoming unavoidable) — a superseding ADR, not a silent
  edit.
