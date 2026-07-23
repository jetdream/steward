---
kind: adr
title: Deployment portability via ports & adapters
status: accepted
supersedes: ~
---

# ADR-0003 — Deployment portability via ports & adapters

## Context

Steward must run, unchanged in its domain code, across three deployment shapes
the founders will move through over time:

1. **self-contained dev** — one machine, no cloud accounts, fast to spin up
   and test (a hard requirement: the founder wants the dev environment
   self-contained and easily testable);
2. **single-instance deploy** — one server + Postgres, the cohort-1 shape;
3. **cloud scheduler + serverless workers** — the later scale shape.

Several infrastructure concerns differ across those shapes: background
jobs/scheduling, blob storage, transactional email, the social publishing
transport, and (already, via the Vercel AI SDK) LLM/search providers. If domain
code calls a vendor SDK directly, moving between shapes becomes a rewrite and
local testing drags in cloud accounts. The founder asked that the abstraction
be chosen appropriately **and maintained as a principle across components**, not
decided ad hoc per feature.

## Options considered

1. **Direct vendor SDKs at call sites.** Least code today; but couples domain
   logic to vendors, blocks self-contained dev (cloud creds needed to run/test),
   and turns each deployment-shape move into a rewrite. Rejected.
2. **A heavy orchestration layer** (e.g. Temporal, a service mesh) up front.
   Solves portability but is far more than a two-engineer, 12-week team should
   operate; premature. Rejected (may revisit at real scale).
   *(Amended 2026-07-23, DEC-41 / ADR-0009 [accepted]: this "no heavy
   orchestration up front" stance is revisited for the AI subsystem specifically
   — the product's core — which adopts a bounded agent runtime (ADR-0009). It
   amends ONLY this clause; the ports & adapters principle, self-contained dev,
   and the Job/Queue seam below stand unchanged.)*
3. **Ports & adapters (hexagonal), thin (chosen).** Each infra concern is a
   narrow domain-defined **port** (a TypeScript interface in `@shared`/backend);
   concrete **adapters** implement it; the active adapter is selected by
   configuration per environment. No framework — just interfaces + a small
   composition root. Honest con: a little indirection and the discipline to
   keep domain code off vendor types; mitigated by keeping ports narrow and
   adapters dumb.

## Decision

Adopt **thin ports & adapters** as a cross-cutting architecture principle
(recorded as an element in the system overview, ARC): every external/infra
dependency **in the inventory below** is reached only through a port, with
environment-selected adapters. The principle applies to jobs, storage, email,
publishing transport, messaging, and LLM/search — and infra-touching specs
cite this ADR in `constrained-by`.

Initial port inventory and v1 adapters:

| Port | Dev (self-contained) | Single-instance (cohort 1) | Cloud (later) |
|---|---|---|---|
| **Job/Queue** (cron + work queues, retry/backoff, failure queues) | in-process / pg-boss on local Postgres | pg-boss on Postgres | cloud scheduler/timers + serverless workers **+ outbox** |
| **Blob** (S3 API surface) | MinIO or filesystem | Cloudflare R2 | R2 (or S3) |
| **Email** (send + React-email templates) | console/preview sink | SendGrid | Resend (config-only switch) |
| **Publishing transport** (per-channel adapters behind channel profiles, R-6; outbound) | recorded/dry-run | live official APIs | live official APIs |
| **Messaging** (bot channels, BOT, P1; inbound + outbound) | stub/echo | Telegram + WhatsApp adapters | same |
| **LLM/search** | Vercel AI SDK (already provider-abstracted) | same | same |

Selection is by configuration; no adapter identity leaks into domain code.
Vendor picks (pg-boss, R2, SendGrid→Resend) are *adapter* choices behind the
ports, revisitable without touching domain logic.

**Job/Queue port contract (the seam that does NOT swap for free).** The port
surface includes: (i) *transactional enqueue* — enqueuing participates in the
caller's DB transaction, so a state transition and its follow-up job commit
atomically (relied on by approve→publish, generate→inbox, and MEM-1 write
paths); (ii) *durable dynamic delayed execution* — "run this at time T" for
per-post scheduled publishing (PUB-1, ±5 min); (iii) *cron* — per-org recurring
runs (EXT-1); (iv) a *long-running consumer*. pg-boss provides all four on
Postgres. The serverless column does **not** inherit them as a mere vendor
swap: a non-Postgres queue loses transactional enqueue (the cloud adapter must
add a transactional **outbox** + idempotent consumers), FaaS replaces the
long-running consumer with event triggers, and per-item timers need a durable
timer service, not a static cron. Domain code is written to the
transactional-enqueue contract from day one, so the outbox is an adapter
concern at the cloud step — not a domain rewrite.

**Realtime is deliberately out of the port set.** WebSocket/realtime (ADR-0002)
is fixed transport, not a ported infra concern; the serverless shape will need
a managed WebSocket service — a known, accepted transport change, named here
rather than hidden under "every dependency."

## Consequences

- Self-contained dev is a first-class target: every port has a
  zero-cloud-dependency adapter, so the app runs and tests locally.
- The publishing adapter isolation R-6 already requires becomes a case of this
  general principle rather than a one-off.
- Moving deployment shapes is largely an adapter + config change; the
  SendGrid→Resend email switch is the near-term config-only proof. The
  Job/Queue port is the deliberate exception whose cloud adapter carries real
  substance (a transactional outbox + trigger model, above) — surfaced so it is
  designed for from day one, not discovered as a rewrite.
- Cost: a thin indirection layer and a review discipline (domain code must not
  import vendor SDKs directly). The Architect Challenger and code review guard
  this.
- Builds on ADR-0002 (the stack baseline the ports live in). Bot-channel
  adapters (WhatsApp/Telegram, P1) and the cloud/serverless job adapter are
  future adapters under this same principle — no new decision needed to add
  them, only to pick their vendors.
