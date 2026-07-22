---
kind: adr
title: Deployment topology & environments
status: accepted
supersedes: ~
---

# ADR-0007 — Deployment topology & environments

## Context

ADR-0003 established portability (ports & adapters) across three deployment
*shapes* but deliberately deferred the concrete hosting targets; CON-3 recorded
that gap ("to be filled before architecture decisions that depend on it"). The
founder has now decided the topology (DEC-36). Several approved specs need a
concrete environment model: SEC-7 (dev-login disabled outside development),
SEC-11 (the ops/admin console disabled outside the ops environment), the news
renderer's CDN (ADR-0004, SEC-8), and blob hosting (ADR-0003 → R2).

## Decision

Concretize ADR-0003's shapes (this ADR builds on, does not supersede, ADR-0003 —
the ports principle is unchanged; this fixes the adapters/hosting):

- **Environments.** `development` — self-contained, zero-cloud (ADR-0003 shape 1;
  dev-login enabled, SEC-7). `production` — phase-1 and phase-2 below. The
  internal ops/admin console (OPS/ADM) is enabled by a **config flag** (not a
  separate cluster), satisfying SEC-11's "disabled outside the ops environment"
  and keeping phase-1 simple; dev-login is off whenever the environment is not
  `development` (SEC-7).
- **Phase-1 production (cohort 1)** — self-hosted **single instance via
  `docker compose`** (ADR-0003 shape 2, concretized): one bundle of the app
  (`@backend` + the built `@client` SPA), the **`@news`** renderer, and
  **Postgres + pgvector bundled** in the compose stack. Minimal ops for a
  two-founder team.
- **Phase-2 production (later)** — horizontally-scalable managed (ADR-0003
  shape 3): **GCP Cloud Run + Cloud SQL for Postgres** *or* **DigitalOcean**.
  Provider is left OPEN (a deferred, user-decidable open question — not a
  phase-1 blocker; ports & adapters keeps domain code provider-agnostic).
  ADR-0003's Job/Queue caveat is NARROWER than "cloud" implies: Cloud SQL /
  managed Postgres keeps the transactional-outbox enqueue intact — only the
  long-running-consumer assumption is at risk under a scale-to-zero runtime
  (Cloud Run), handled with a scheduled trigger as already designed.
- **CDN — Cloudflare.** Cloudflare CDN fronts static production assets AND the
  public news surface: edge cache keyed by per-article **cache tags**, purged on
  publish/edit/unpublish/takedown (Cloudflare Cache-Tags API) — the concrete form
  of ADR-0004's tag-based purge and SEC-8's "cacheable yet immediate takedown."
  **Cloudflare R2** remains the Blob adapter (already ADR-0003).
- **Phase-1 data durability.** Phase-1 is REAL cohort-1 production holding
  confidential org data (SEC-4) in the bundled single-instance Postgres — so
  durability is a **phase-1** obligation, NOT deferrable to the phase-2 provider.
  Posture: a scheduled logical backup (`pg_dump`) to the already-present
  **Cloudflare R2** on a fixed cadence with a bounded retention window; a restore
  path is part of phase-1 ops. Kept deliberately minimal (one cron + R2, no extra
  infra) per the no-overcomplication constraint. Only **data-residency** and
  **uptime SLOs** — not backup — ride with the phase-2 provider choice (Q-15).
- **`@news` package.** The ADR-0004 news renderer (ARC-23, Astro + React islands)
  is a **4th top-level source package** `@news` — reuses `@shared` types + the
  DS-8 tokens (CSS custom properties), builds and deploys as its own container.
  Amends the constitution's "three src folders" → four and ADR-0002's source
  layout.

Founder-ratified as DEC-36.

## Consequences

- Phase-1 is one `docker compose up` (app + `@news` + Postgres); no cloud
  COMPUTE/HOSTING provider (GCP/DO) required to run cohort 1 — Cloudflare (CDN +
  R2 blob, and the `pg_dump` backup target) remains the phase-1 external
  dependency. Dev is unchanged (self-contained, zero-cloud).
- SEC-7 / SEC-11 gating is now concrete: an `environment` value + an ops-console
  flag; no separate ops deployment in phase-1.
- The phase-2 move is an adapter/config + hosting change (ADR-0003), not a domain
  rewrite; the provider (GCP vs DO) and its data-residency/SLO posture are
  a tracked open question (Q-15), chosen when scaling is real (backup is a
  phase-1 obligation, not part of this — see the durability bullet below).
- Cloudflare is now the named CDN (news + static) and R2 the blob store; the news
  renderer's takedown immediacy (SEC-8) rests on Cloudflare Cache-Tags purge — a
  fallible outbound API call (IG-11), so a purge failure must fail the takedown
  loudly (enforced in PUBS-1 / NWSS-1 acceptance), never leave a recalled article
  served.
- Phase-1 cohort-1 confidential data has a recorded durability posture (scheduled
  `pg_dump` → R2 + restore path), so single-instance bundling does not silently
  leave production data un-backed; residency/SLO alone defer to phase-2 (Q-15).
- Builds on ADR-0002 (stack, now +`@news`), ADR-0003 (ports), ADR-0004 (news
  rendering, amended for Cloudflare).
