---
kind: challenge-record
spec: .spec/specs/pub-publishing.yaml
round: 4
date: 2026-07-22
verdict: pass
by: cortex:architect-challenger (delta re-challenge — PUBS-1 v3 news-purge-failure clause, run within the deployment-topology r2 pass)
---

# PUB (Publishing) — challenge record, round 4 (delta-scoped)

Delta re-challenge of the **PUBS-1 v2 → v3** change made under the deployment-topology
delta (DEC-36/ADR-0007): the org news-page cache-purge is now a **fallible outbound
Cloudflare Cache-Tags API call** (IG-11), not the local/reliable no-op the
pre-Cloudflare design assumed.

## What changed in PUBS-1 v3
- Acceptance gains a failure-path criterion: a news cache-purge **failure** FAILS THE
  OPERATION LOUDLY — it retries and alerts operators, and the affected article is
  treated as **still-live** (never reported taken-down) until the purge is confirmed,
  so a recalled article is never silently left served (SEC-8).
- The inaccurate "not an outbound API call" wording is corrected across the intent,
  interfaces, and statement fields to name the Cloudflare Cache-Tags API (IG-11).

## Verdict

VERDICT: pass

Verified within the cross-cutting deployment delta re-challenge — **pass-with-nits**;
the two nits were architecture/ADR prose fixes (ARC-18 v2, ADR-0007 wording), not
PUBS-1 behavior. The PUBS-1 v3 failure-path acceptance is testable (simulate a
Cache-Tags API failure → assert loud failure + retry + operator alert +
still-live-until-confirmed) and the mechanism/action ownership split with NWSS-1
holds. Full verbatim verdict + resolution:
[deployment-2026-07-22-r2.md](deployment-2026-07-22-r2.md) (and r1 for the originating
fail). PUBS re-approved on the strength of this pass.
