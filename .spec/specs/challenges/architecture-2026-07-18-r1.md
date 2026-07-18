---
kind: challenge-record
spec: architecture set (overview, data-model, integrations, llm-pipeline, security-privacy)
round: 1
date: 2026-07-18
verdict: pass
by: cortex:architect-challenger (cross-cutting panel — design-conformance / implementation-divergence / cheaper-alternative + hidden-assumptions)
---

# Architecture-approval challenge — P0 design pass

Gates flipping the five architecture docs `sketch → approved`. Verdict
pass-with-findings; the three blockers (F1–F3) and the should-fixes (F4, F6,
F8) were applied in the same change that records this verdict and flips the
docs (the challenger stated the set was "not approvable exactly as written"
until F1–F3 land). Notes F5/F7 also applied.

## Findings → resolutions (all in commit of this pass)

- **F1 [blocker] Job/Queue port's serverless promise was leaky; ADR-0003
  overstated "not a rewrite."** → ADR-0003 now specifies the Job port
  contract (transactional enqueue, durable dynamic delayed execution, cron,
  long-running consumer), names the serverless deltas (outbox + idempotent
  consumers + durable timers), adds the Messaging port row, and softens the
  Consequences claim. Realtime/WebSocket declared explicitly out of the port
  set.
- **F2 [blocker] SEC-8 self-contradiction (aggressively cacheable + immediate
  takedown, no mechanism).** → tag-based CDN purge on publish/edit/unpublish
  added to SEC-8 and ADR-0004; takedown is immediate despite caching.
- **F3 [blocker] ContentItem state machine conflated item-editorial with
  per-destination delivery.** → DM-5 split into an editorial machine
  (ContentItem: draft/awaiting_picture/approved/skipped) and a per-ChannelVariant
  delivery machine (pending/scheduled/published/paused/unpublished), with
  `unpublished` scoped to the news destination.
- **F4 [should-fix] ARC-1 "every dependency" over-claimed vs WebSocket.** →
  scoped to the enumerated inventory; realtime named as an accepted
  non-ported transport.
- **F5 [note] ADR-0004 skipped the React-SSR-reuse option / CitationBlock
  GR-7 risk.** → option added; why Astro wins stated; the shared-component
  GR-7 discipline named.
- **F6 [should-fix] news-as-channel-adapter over-symmetrized; PUBB→NEWS edge
  implied a push.** → ARC-1 edge relabelled (publish-state + cache purge; the
  renderer pulls downstream); ARC-18 body corrected.
- **F7 [note] slug-reservation lifecycle vs Org deletion unmodeled.** → SEC-8
  now distinguishes reservation-record (survives while active/tombstoned,
  serves the org-branded not-here page) from BIL-2 hard deletion (generic 410).
- **F8 [note] messaging port missing from inventory; threat-model gating
  loose.** → Messaging port added to ADR-0003 inventory; SEC threat-model
  re-gated to before the public surface / bot webhooks go live.

## Verbatim verdict

VERDICT: pass-with-findings
SPEC: `.spec/architecture/{overview,data-model,integrations,llm-pipeline,security-privacy}.yaml` + ADR-0002/0003/0004

Not approvable exactly as written: three defects (F1–F3) must be applied in the same change that flips sketch→approved (convergence-rule precedent, `specs/CLAUDE.md`). None requires a redesign; all are small, scoped decisions. If the intent is to flip to `approved` without resolving F1–F3, treat this as **fail** — F2 is an internal contradiction and F3 is an incoherent state model, and a capability spec cannot faithfully `constrained-by` either.

The core architecture held under attack: the ports principle is genuinely justified (see "what held"), the renderer split is sound, the Article-into-ContentItem fold is right, and no guardrail is violated in meaning.

[F1–F8 findings and "what held" as reproduced in the resolutions section above;
full text retained in the run transcript. Top hidden assumption: that the
Job/Queue port's pg-boss semantics — transactional enqueue, dynamic delayed
execution, cron, long-running consumer — are reproducible behind cloud
scheduler + serverless workers as a mere adapter/config swap. They are not;
addressed by the F1 resolution (outbox + durable timers named as the cloud
adapter's real substance, designed for from day one).]

## What held (unchanged, confirmed sound)
- Ports principle is requirement-driven (self-contained dev needs per-port dev
  sinks), not speculative over-abstraction.
- Dedicated public renderer justified (SPA can't emit crawlable HTML; NWS-2
  SEO is hard; SEC-8 isolation correct).
- Article-into-ContentItem fold sound (defect was only the state machine, F3).
- R-9 cuttability is a strength (separate deployable → low unwind).
- Guardrails hold in meaning (GR-4/5/6/7, VAL-4); DS-8 org slots stay inside
  GR-7; MessagingLink + SEC-9 account-linking sound.
