---
kind: challenge-record
spec: .spec/specs/pub-publishing.yaml
round: 1
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (single 4-lens pass — design-conformance + implementation-divergence + cheaper-alternative/hidden-assumptions + cross-cutting LRN-19/20/22 reconciliation)
---

# PUB (Publishing) — challenge record, round 1

First challenge of the PUB behavior spec (PUBS-1..4, P1a core-loop batch). Attacked
against the full constrained-by set (ADR-0002/0003/0004, DM-5, DM-14, IG-1, IG-2,
ARC-18, ARC-23, EXP-31), governed-by GR-6, the AUT/OPS requirement registers, and
the sibling approved specs (GENS, ONBS, APRS). docs-check graph green (0 errors /
0 warnings) — every finding below is semantic. No stale pins (DM-5 v1, DM-14 v1,
ARC-18 v1, ARC-23 v1, EXP-31 v1 all current; all four ADRs accepted).

## What I attacked and how it held

### Design-conformance — HELD
- **News-destination asymmetry** matches ARC-18/ARC-23/ADR-0004 in meaning: social
  adapters make outbound third-party calls; "publishing" to the news page only sets
  the article publish-state + purges the renderer cache tag; the renderer pulls
  published articles downstream via the backend read-API (not pushed to). PUBS-1,
  design, and interfaces all state this consistently; the tag-based purge is
  ADR-0004/SEC-8-correct ("takedown immediate despite caching").
- **DM-5 delivery lifecycle** (pending -> scheduled -> published; paused) is recited
  verbatim and correctly scoped per-variant / per-destination (incl. the news page),
  consistent with DM-5's two-altitude split (editorial on ContentItem, delivery per
  ChannelVariant).
- **GR-6 as the sole guardrail is correct**: GR-1/GR-3/GR-5/GR-8 are enforced at the
  GEN VAL stage BEFORE content reaches approval, so by publish time content is
  already cleared; GR-6 (official-APIs-only) is the only guardrail that binds
  publishing's own transport behavior. No missing governed-by.

### The flagged veto-window deferral (AUT-1 TL1) — HELD, honest scoping (NOT a hole)
The task asked whether deferring the TL1 veto-window hold/takedown mechanics + DM-5
interaction to a future AUT spec leaves PUB dangerously underspecified (e.g.
auto-posting during an open veto window). It does not, for four independent reasons:
1. AUT genuinely has no spec (verified: no `specs/aut-*.yaml`), so there is nothing
   to cite instead — the reference-not-restate discipline is correct.
2. Auto-publish is not reachable in the planned slices: roadmap P1b is "autonomy TL0
   + kill switch (AUT-1, AUT-3)" — TL0 = approve-everything; TL1 auto-publish requires
   the AUT-2 promotion, which is later. No near-term code path auto-posts at all.
3. The mechanics (hold-until-window-closes vs publish-then-takedown, and whether a
   veto-hold DM-5 state is needed) are autonomy design decisions, not publishing ones.
4. PUB only ever acts on already-approved+scheduled variants (DM-5 invariant: no
   variant schedules while the item is unapproved). WHETHER/WHEN a variant becomes
   approved+scheduled during a TL1 window is precisely AUT's call — so PUB's own
   publish behavior is fully specified for its actual scope; it cannot auto-post
   during a veto window unless AUT approves+schedules it. The boundary is clean and
   the DM-5 interaction is explicitly flagged in open-questions. Legitimate cross-spec
   reconciliation, resolve when the AUT spec is authored.

### Cross-cutting reconciliation (LRN-19/22) — HELD
- PUBS-2 "config consumed by GENS-2/GENS-5" matches the live GEN spec (GEN-2 depends
  [PUB-2,STR-1]; GEN-5 depends [STR-3,PUB-2]; GENS-2 reads the PUB-2 technical profile,
  GENS-5 the PUB-2 hard limits).
- PUBS-1 reading DM-14 at publish time is consistent with ONBS-4 (activation on a
  healthy ChannelConnection; unconnected drafts hold, never error) and SEC-10
  (encrypted secrets, expiry/revocation are first-class needs-you states).
- The data-model tiebreaker (LRN-22) confirms the news page is a first-class
  ChannelVariant destination, matching PUBS-1/PUBS-3.

### LRN-20 honesty split — HELD
The deterministic/probabilistic split is drawn honestly: official-API routing, the
±5min tolerance, the connection/pause gates, and the log are deterministic (all true
boolean/mechanical checks); engagement-optimal TIME selection is explicitly a
heuristic, not a determinism claim. "Kill switch halts instantly" is an honest
deterministic gate (a pause flag checked before dispatch), not a semantic "never".

### Cheaper-alternative / over-build — HELD
Design is minimal (adapters behind config, connection gate, delivery lifecycle, log;
retry via existing OPS-1 failure queues; LinkedIn deferred). No materially simpler
conforming alternative to name; the news asymmetry is forced by ADR-0004.

## Surviving findings (medium/low — none blocking; convergence: no high, one-line fixes)

- [medium] **PUBS-1 connection gate enumerates a partial blocklist that omits DM-14's
  `error` state.** "a variant for an unconnected / expired / revoked channel does NOT
  post" lists three states, but DM-14's status enum is connected | expired | revoked |
  **error**, and ONBS-4 frames activation positively ("a HEALTHY ChannelConnection
  exists"). A literal impl reading only PUBS-1's enumeration could treat an error-state
  connection as postable. Survives scrutiny as an LRN-19 straggler (an enumeration the
  lint cannot check for meaning) + a DM-14 conformance gap; bounded safety impact
  (posting to an error channel would fail→retry→alert), hence medium not high. Fix
  (one line): reframe positively — "posts only when a healthy (connected)
  ChannelConnection exists," matching ONBS-4/DM-14 — rather than an omittable blocklist.

- [low] **Rate-limit enforcement has no publish-time owner.** PUBS-2 (echoing PUB-2)
  declares rate limits as config "consumed by GENS-2/GENS-5," but rate limiting is a
  publish/schedule-cadence constraint, not an adaptation/fit concern; no spec-element
  assigns rate-limit-aware scheduling to PUBS-1's schedule()/publish(). Benign at the
  current ~1-post/day cadence (platform limits are far above it) and inherited from the
  PUB-2 requirement's framing, so not a spec-introduced divergence — noted for when
  volume grows. Optional fix: name the scheduler as a rate-limit consumer.

- [low] **News unpublish/takedown ownership unstated.** DM-5 carries published->
  unpublished (news only), EXP-31 puts UNPUBLISH at P0, and SEC-8/ADR-0004 require a
  cache purge on unpublish — mechanically a publisher operation (ARC-18 owns the news
  publish-state + cache-purge mechanism), yet PUBS exposes no unpublish/recall
  interface and does not flag it. Likely the (unwritten) NWS spec's to own, but the
  boundary is silent. Optional fix: an open-questions line pinning news-takedown
  ownership to the NWS reconciliation.

## Verdict

The design conforms to its constrained-by set in meaning, the news asymmetry and DM-5
lifecycle are faithful, the LRN-20 split is honest, and the AUT veto-window deferral is
legitimate cross-spec scoping rather than a hole. No high-severity finding survived.
The medium is a one-line positive reframe and the two lows are optional notes —
recommend applying the medium (and, at author's discretion, the news-takedown
open-questions line) in the approving change per the convergence rule; none blocks
approval.

VERDICT: pass
