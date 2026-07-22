---
kind: challenge-record
spec: .spec/specs/nws-news-site.yaml
round: 3
date: 2026-07-22
verdict: pass
by: cortex:architect-challenger (delta re-challenge — NWSS-1 v2 news-purge-failure clause, run within the deployment-topology r2 pass)
---

# NWS (Org News Site) — challenge record, round 3 (delta-scoped)

Delta re-challenge of the **NWSS-1 v1 → v2** change made under the deployment-topology
delta (DEC-36/ADR-0007): the founder-initiated takedown's cache-purge is now a
**fallible outbound Cloudflare Cache-Tags API call** (IG-11), not a local/reliable
no-op.

## What changed in NWSS-1 v2
- The takedown behavior + acceptance gain a failure-path criterion: a cache-purge
  **failure** FAILS THE TAKEDOWN LOUDLY — retries, alerts operators, and the article
  stays **reported-live** until the purge confirms, so a recalled article is never
  silently served after recall (SEC-8).
- The "not an outbound API call" wording is corrected to name the Cloudflare
  Cache-Tags API (IG-11) in the intent and statement.
- Ownership split preserved: NWS owns the takedown ACTION, PUB (PUBS-1) owns the
  cache-purge MECHANISM (DEC-25).

## Verdict

VERDICT: pass

Verified within the cross-cutting deployment delta re-challenge — **pass-with-nits**;
the two nits were architecture/ADR prose fixes (ARC-18 v2, ADR-0007 wording), not
NWSS-1 behavior. NWSS-1 v2's failure-path acceptance is testable and mutually
consistent with PUBS-1 v3. Full verbatim verdict + resolution:
[deployment-2026-07-22-r2.md](deployment-2026-07-22-r2.md) (and r1 for the originating
fail). NWS re-approved on the strength of this pass.
