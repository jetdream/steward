---
kind: challenge-record
spec: .spec/specs/nws-news-site.yaml
round: 2
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (delta re-challenge — verified each r1 fix against live cited text + re-attacked changed sections; graph clean)
---

# NWS (Org News Site) behavior spec — challenge r2 (delta)

Delta-scoped re-challenge after r1 FAIL (1 high + 3 mediums + 3 lows). Verified
each fix against the live text of the cited artifact, then re-attacked only the
changed sections. Did not re-litigate the r1 checks that passed. Graph clean
(`cortex-docs-check --json` errors: []).

## r1 fixes — verification

### HIGH (public rail leaked the raw planning agenda) — RESOLVED
NWSS-4 now builds the org-domain rail as the INTERSECTION of the active TOP-4
agenda (TOPS-4 — WHICH topics are current) with topics that have >=1 PUBLISHED
article. Verified against the requirement and DEC-25:
- NWS-4 v2 (register): "The agenda rail stays current with what the org actually
  publishes." DEC-25 statement: "keep the org-domain rail CURRENT with what the
  org actually publishes." The publish-scoped intersection satisfies both; the
  raw active agenda did not.
- SEC-8 leak closed: the rail can no longer surface a planned-but-unpublished
  topic; every entry has published content behind it, so no forward editorial
  intent is exposed on the public surface.
- DS-6 empty-page closed: a day-one org resolves to universal categories only
  (NWSS-4 acceptance), no empty agenda rail, aligning with EXP-49's honest empty
  state.
- DEC-25 "single source" still coherent: the intersection is a strict SUBSET/VIEW
  of the single TOPS-4 agenda — it cannot produce a topic outside the agenda, so
  it is not a second independently-derived taxonomy (the exact divergence DEC-25
  forbids). NWSS-4 states this explicitly ("the single source is TOPS-4 for which
  topics are active; the public view publish-scopes it"). Attacked for a divergence
  path; none survives.

### MEDIUM — constrained-by adds DM-13 + EXP-36 — RESOLVED
Both present in `constrained-by` (line 15). DM-13 (Topic: status
proposed|active|retired + supersededBy) governs NWSS-4's retired-topic clause;
EXP-36 (the reader-states flow: unpublished/recalled not-here, slow network,
unfurl, canonical entry) governs NWSS-1/NWSS-2 states. Appropriate.

### MEDIUM — NWSS-1 mirrors SEC-8 trichotomy — RESOLVED
SEC-8 body: while active/tombstoned an unpublished-or-recalled route serves the
warm org-branded "not here" page (EXP-36); after a BIL-2 hard deletion the slug
returns a GENERIC 410. NWSS-1 statement + acceptance now match this three-state
afterlife verbatim in meaning (active OR tombstoned -> org-branded not-here;
hard-deleted -> generic 410; never a stale or bare 404).

### MEDIUM — PUBS open-question #2 RESOLVED — RESOLVED
pub-publishing.yaml open-question #2 now reads "RESOLVED (DEC-25, NWSS-1)": NWS
owns the takedown ACTION (NWSS-1), PUB owns the cache-purge MECHANISM (ARC-18
tag-purge). No longer presented as open; consistent with NWSS-1's ownership split
and interfaces ("NWS owns the takedown ACTION, PUB owns the cache-purge MECHANISM").

### LOW — the three low fixes — RESOLVED
- TOPS-4 caller list updated: `getAgenda(org) -> active topics [callers: STR, GEN;
  NWS reads it publish-scoped — active ∩ published — for the public news rail,
  NWSS-4]`.
- NWSS-4 documents article->(type, agenda-topic) persistence on DM-5/DM-13.
- NWSS-3 acceptance adds the DS-4 a11y bar (semantic headings, contrast, focus
  order) inherited via DS-8.

## What I re-attacked in the changed sections (held)

- **Intersection as a hidden second derivation** — refuted: strict subset of the
  single source, cannot diverge from the agenda.
- **Retired vs superseded topic** — a retired topic drops from the rail while its
  published articles stay reachable under their universal category (no dead
  links); consistent with DM-13 status semantics. The re-described/superseded
  case is below this behavior spec's altitude and not a coverage gap.
- **Rail-entry itself leaking intent** — a topic label backed by published content
  reveals only the subject of published content; no forward intent (SEC-8 holds).
- **Acceptance testability** — every NWSS-4 clause can fail (day-one =
  categories-only; only-published-backed topics; dual reachability; retired-topic
  drop). Not vacuous.

## Residual note (non-blocking, LOW)

NWSS-4 asserts the type/agenda-topic linkage is "persisted on the ContentItem
(DM-5) / Topic (DM-13)", but DM-5's data-model body does not yet declare that
field (its body is non-exhaustive and carries no explicit topic/category
reference). This is exactly the r1-recommended fix (name where the linkage
lives), applied at the correct altitude — the spec is the layer that specifies
the data need — so it does not block. Worth an explicit DM-5 field (or @shared
type) when NWS implementation lands, since the public browse now depends on it.
One-line follow-up, not a design defect.

## Verdict

No high survives; the sole medium/low residual is a one-line implementation-time
note. Convergence rule met (no surviving high; only a one-line-fix low). Spec may
flip to approved.

VERDICT: pass
