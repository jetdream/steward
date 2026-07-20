---
kind: challenge-record
spec: .spec/specs/nws-news-site.yaml
round: 1
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (single pass — design-conformance / product-designer / implementation-divergence + hidden-assumptions; LRN-19/20/22 weaponized)
---

# NWS (Org News Site) behavior spec — challenge r1

Attacked NWSS-1..6 against the constrained-by set (ADR-0002/0003/0004, DM-1,
DM-5, ARC-18, ARC-23, SEC-8, EXP-9, EXP-48, EXP-49), governed-by (GR-1/2/5/7),
depends-on (PUBS, TOPS, GENS), NWS-4 v2 / DEC-25, and the requirement register.
Graph is clean (docs-check errors: []); every finding below is meaning-level,
which the lint cannot see.

## What held (attacked, survived)

- **DEC-25 single-source (no second derivation):** verified. NWSS-4 + interfaces
  reuse TOPS-4 `getAgenda`; no independent cause-profile derivation survives
  anywhere (LRN-19 sweep for "cause profile" / "second taxonomy" returned no
  news-scoped straggler). The universal categories are a fixed GEN-1 constant,
  not a derivation.
- **NWSS-1 takedown ownership vs PUBS-1:** the NWS-owns-ACTION /
  PUB-owns-cache-purge-MECHANISM split matches ARC-18 + PUBS open-question #2 +
  SEC-8/ADR-0004; DM-5 published->unpublished news-only is consistent with the
  DM-5 invariants.
- **NWSS-5 deterministic guard (LRN-20):** "link emitted only in the published
  state (DM-5)" is a genuine deterministic state check, correctly NOT overclaimed
  (the relief-valve USE stays a soft adaptation choice).
- **NWSS-3 vs DS-8/GR-7/DEC-10:** name/logo/accent sanctioned slots + no-fonts +
  "published with Steward" footer conform in meaning.
- **ADR-0004 renderer / ARC-23 downstream-of-data model:** matches live text.

## Findings

### HIGH

- **NWSS-4 public rail is wired to the RAW active agenda, not to what the org
  actually publishes — contradicting NWS-4 v2 / DEC-25 and leaking editorial
  intent on a public surface (SEC-8).** NWS-4 v2 and DEC-25 both require the
  org-domain rail to "stay current with what the org actually PUBLISHES." NWSS-4
  implements it as "the org's ACTIVE EDITORIAL AGENDA (the TOP-4 content topics,
  via TOPS-4 getAgenda) as the org-domain rail," and the retired-topic clause
  keys the rail on topic STATUS (active/retired), never on whether a topic has a
  published article. But `getAgenda(org)` returns the ACTIVE topic set — planning
  intent, declared callers `[STR, GEN]` (internal) — which normally contains
  topics with ZERO published articles (a brand-new org's day-one cause-level
  agenda; any topic the org plans but has not yet published). Consequences on a
  PUBLIC, donor-facing surface: (a) empty rail entries → empty topic pages
  (violates DS-6/EXP-49 narrated-empty intent and the "calm, credible" journey
  EXP-9); (b) the org's FORWARD editorial agenda is exposed to donors before
  anything is published — against SEC-8's "serves only published, founder-approved
  article content" posture. Survives refutation: getAgenda has no published-filter
  and its contract does not even list NWS as a caller, so nothing upstream scopes
  it; the divergence is the normal state, not an edge. Fix: the public rail must
  be the active agenda INTERSECTED with topics that have >=1 published article
  (agenda ∩ published) — reuse TOPS-4 as the source of WHICH topics are active,
  but scope the rail to published-backed ones. This also resolves the empty-rail
  and SEC-8 concerns in one move.

### MEDIUM (would still need fixing even with the high resolved)

- **constrained-by omits two artifacts that clearly govern the spec — DM-13
  (Topic) and EXP-36 (the reader-states flow).** NWSS-4's headline retired-topic
  behavior depends on DM-13's status/supersededBy semantics (DM-13 is v2, still
  actively evolving via DEC-23/DEC-25), yet DM-13 appears only in prose. NWSS-1's
  reader states (unpublished/recalled not-here, slow network, unfurl, 410) are
  owned by the FLOW EXP-36, which is cited in prose but not in constrained-by
  (constrained-by lists the journey EXP-9 and screens EXP-48/49 but skips the flow
  that owns the states). The house pattern cites read data-entities + governing
  flows (GENS cites DM-2/3/4/5/8/10/14; PUBS cites EXP-31). Fix: add DM-13 and
  EXP-36 to constrained-by.
- **SEC-8 tombstoned interim is dropped.** NWSS-1 gives a binary
  active->org-branded-not-here / hard-deleted->generic-410, but SEC-8 (a
  constrained-by artifact) defines a THREE-state afterlife: active/tombstoned ->
  warm org-branded not-here, hard-deleted -> generic 410. The cancelled-but-not-
  yet-hard-deleted (tombstoned) window and the fate of live articles at
  cancellation (DEC-10/Q-11: reservation is a benefit of an ACTIVE account) are
  left undefined-to-contradictory ("while the account is active"). Fix: mirror
  SEC-8's active/tombstoned/deleted trichotomy in NWSS-1.
- **LRN-19 straggler: PUBS open-question #2 still reads unresolved.** NWSS-1 +
  DEC-25 claim to resolve the PUBS-1 news-takedown ownership question, but
  PUBS's open-questions block still says "Settle the takedown-operation ownership
  (NWS vs PUB) when the NWS spec is authored." A green graph is not evidence the
  concept is single-homed. Fix: mark PUBS open-question #2 RESOLVED (DEC-25,
  NWSS-1), exactly as the DEC-26 veto question was marked.

### LOW

- **getAgenda caller list not swept (LRN-19).** TOPS-4's `getAgenda(org) ->
  active topics [callers: STR, GEN]` was not updated to add the news renderer
  when DEC-25 wired the public rail to it. Add NWS (scoped to published-backed
  topics, per the HIGH) as a caller when that fix lands.
- **Article->(type, agenda-topic) linkage persistence is assumed but
  undocumented.** NWSS-4 maps each article to a universal category (type) and
  agenda topic (subject) and needs that link durable across topic retirement, but
  neither DM-5 nor DM-13 records where the linkage lives. Since a public browse
  now depends on it, name it (DM-5 note or @shared type).
- **Reading-surface a11y (DS-4) not stated.** DS-8 says "Reading-surface a11y per
  DS-4"; NWSS-2/NWSS-3 acceptance never state contrast / target-size / focus /
  semantic-heading order for the public page. Inherited via DS-8 but should be an
  explicit acceptance clause for the first public surface.

## Verdict

One HIGH survives (NWSS-4 rail = raw active agenda, not published-scoped). The
spec stays in `draft` until it is resolved (and the mediums applied) and
re-challenged delta-scoped.

VERDICT: fail
