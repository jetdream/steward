---
kind: adr
title: LLM & embedding model selection — Google Vertex AI (Gemini)
status: accepted
supersedes: ~
---

# ADR-0008 — LLM & embedding model selection (Google Vertex AI / Gemini)

## Context

ADR-0002 (stack baseline) fixed **Vercel AI SDK** as the provider-abstracted
LLM layer but **deliberately deferred model selection** "to the skeleton"; the
LLM pipeline architecture (`architecture/llm-pipeline.yaml`, PIPE-1/PIPE-2)
carries the same deferral ("Model choices get an ADR when the skeleton lands").
That skeleton has now landed (walking skeleton + ACCS), and the first
capability that needs real generation is the **brain spine** — `@backend/memory`
(ARC-11) and `@backend/onboarding` (ARC-12), whose behaviour specs (MEMS-1/4,
ONBS-2) require an **LLM extraction/classification** step and an **embedding**
step for pgvector retrieval (ADR-0002 Postgres + pgvector).

Two things force the decision now:

1. **The embedding column dimension is a one-way-door.** The `MemoryEntry`
   embedding (DM-2) is a `vector(N)` column in the migration; changing `N`
   later means re-embedding every org's corpus. `N` cannot be deferred once
   the table ships.
2. **`@backend/memory` cannot be built provider-agnostically end-to-end** — the
   extraction prompt shape, structured-output support, and embedding
   `taskType`/dimensionality are provider-specific enough that a concrete
   choice is needed to write and smoke the module.

All model calls remain **behind the ADR-0003 LLM/search port** (the Vercel AI
SDK provider abstraction is itself an instance of that ports principle), so
this choice is swappable by configuration and does not leak into domain code.
Gemini is already the named engine for External Radar grounding (IG-3), so this
consolidates the LLM provider rather than introducing a new one.

This decision was made by the founder (DEC-40, the HITL sign-off this ADR
records at the technical altitude).

## Options considered

- **Google Vertex AI — Gemini (chosen).** Generation/extraction on
  `gemini-2.5-flash` (fast, cheap — fits the PIPE-1 COGS target <$25/org/mo),
  escalating to `gemini-2.5-pro` where quality demands. Embeddings on
  `gemini-embedding-2` via `@ai-sdk/google-vertex`, pinned to **1536
  dimensions** (`providerOptions.vertex.outputDimensionality: 1536`) with a
  retrieval `taskType`. *Cons:* Vertex auth (project + location + credential)
  is heavier than a bare API key; a live GCP project is needed for real
  generation, in tension with ADR-0003's self-contained-dev requirement unless
  a keyless fallback exists (addressed in Consequences).

- **Anthropic Claude for generation + a separate embedding provider.** Highest
  generation quality, but Claude has no first-party embeddings API, so it
  forces a *second* provider (OpenAI/Voyage) purely for embeddings — two
  vendors, two billing lines, more surface — for no benefit the brain spine can
  yet measure. Not chosen now; revisitable per-capability behind the port.

- **OpenAI (GPT + text-embedding-3).** Single vendor, 1536-dim embeddings
  native. A fine alternative, but Gemini is already committed for Radar
  grounding (IG-3); choosing OpenAI would add a second LLM vendor to the stack.

- **Local embedding model in dev (fastembed/transformers.js).** Truly
  self-contained and keyless, but adds a heavy dependency + model download and
  fixes the dimension to the local model's (often 384/768), diverging from the
  production vector shape. Rejected as the *primary* path; the keyless dev
  fallback below plays this role deterministically instead.

## Decision

Adopt **Google Vertex AI / Gemini** as the v1 LLM + embedding provider behind
the ADR-0003 LLM/search port:

- **Generation/extraction:** `gemini-2.5-flash` by default (`@ai-sdk/google-vertex`,
  `generateObject` for structured extraction), `gemini-2.5-pro` reserved for
  quality-critical slots.
- **Embeddings:** `gemini-embedding-2`, output **1536 dimensions**, retrieval
  task types (`RETRIEVAL_DOCUMENT` on write, `RETRIEVAL_QUERY` on retrieve).
- **The `MemoryEntry` embedding column is `vector(1536)`** (DM-2).
- **Auth/config via env:** `VERTEX_AI_KEY` (+ project/location) drives the real
  adapter.

## Consequences

- **Binds** the `MemoryEntry` embedding column to `vector(1536)` and the
  `@backend/memory` write/retrieve paths to the LLM port's `embed`/`extract`
  surface. Changing the embedding model to one of a different native dimension
  requires either matching 1536 via `outputDimensionality` or a re-embedding
  migration — a loud, superseding decision, never silent.
- **Self-contained dev is preserved (ADR-0003).** The port ships with a
  **deterministic, keyless dev fallback** adapter (hash-seeded 1536-dim
  pseudo-embeddings + rule-based extraction) selected automatically when no
  Vertex credentials are present, so CI and offline dev run without a GCP
  account. The real Vertex adapter activates when `VERTEX_AI_KEY` is set — the
  same "dev-stub + real-when-configured" pattern used for auth (Google sign-in)
  and blob storage (MinIO↔R2). Retrieval *quality* is only real on the keyed
  path; the fallback exercises the *wiring* deterministically.
- **Unlocks** the brain-spine build (ARC-11/ARC-12) and, later, GEN/CHT/INT/EXT
  generation — all reuse this provider through the port.
- `architecture/llm-pipeline.yaml` and ADR-0002's "model selection deferred"
  notes now point here; IG-3's Gemini usage is consolidated under the same
  provider.
- Revisit if COGS, quality, or GCP availability (an `A-*` assumption) shifts —
  a superseding ADR, cascading every citing spec, never an in-place edit.
