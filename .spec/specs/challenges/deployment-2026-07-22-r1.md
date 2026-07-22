# Challenge record — Deployment-topology delta (r1)

- date: 2026-07-22
- by: cortex:architect-challenger (single adversarial pass, foundational + SEC-touching delta)
- scope: DEC-36 + ADR-0007 (new) + CON-3 v2 + Q-15 + ADR-0002/ADR-0004 amendments + IG-11 + ARC-1 v2/ARC-23 v2 + /CLAUDE.md
- verdict: **fail** (one high forces fail; resolved in-change → re-challenged r2)

## Verbatim verdict

_(Version references below reflect the PRE-fix state at r1 time — SEC-11 was v3,
PUBS-1 (v2), NWSS-1 (v1); rendered de-pinned so the historical record does not trip the
stale-pin lint after the fixes bumped them.)_

VERDICT: fail
SPEC: /home/coder/project/.spec/adr/0007-deployment-topology.md (delta: ADR-0007 + DEC-36, CON-3 v2, Q-15, ADR-0002/ADR-0004 amendments, IG-11, ARC-1 v2/ARC-23 v2, /CLAUDE.md)

FINDINGS:

- [high] Phase-1 backup / data-durability is a false deferral — it is misfiled as a phase-2-provider concern. CON-3 v2 and Q-15 both roll "data-residency / backup / uptime-SLO" into the phase-2 provider choice ("later, when scaling is real"), and no backup/DR posture or accepted-risk record exists anywhere (`rg` for backup/durability/restore/pg_dump across risks/constraints/assumptions/architecture returns only that single deferral line). But phase-1 is *real cohort-1 production* holding confidential org data (SEC-4: transcripts, drafts, radar candidates) in a **bundled single-instance Postgres** inside one `docker compose` stack. Durability of live confidential production data is a phase-1 obligation regardless of provider — deferring all of it to a decision that won't be made until scaling is real leaves cohort-1 data with no recorded durability guarantee and no founder-ratified risk acceptance. It survives scrutiny because the refutation ("small pilot, tolerable loss") would itself have to be *recorded* as an accepted risk, which it is not — and the fix is cheap since R2 is already the phase-1 blob store. Fix: add a phase-1 data-durability posture to ADR-0007/CON-3 (e.g. scheduled `pg_dump` → the already-available Cloudflare R2, with a retention window) OR record an explicit founder-ratified accepted phase-1 data-loss risk (`R-*`/`CON-*`); do not fold backup into Q-15.

- [medium] SEC-11 (v3) "disabled outside the ops environment" is now stale and was not cascaded. ADR-0007 collapses environments to `development`/`production` only (no ops environment) and reinterprets SEC-11's isolation language as an in-process **config flag** on the single instance — without bumping SEC-11. When the flag is on, the console that reads ALL orgs' confidential data + performs impersonation runs in the *same instance/process/network* as the public news surface and the founder app; the deployment-isolation defense-in-depth SEC-11's wording implied is traded for simplicity, but SEC-11's text still promises it and the delta merely asserts it "satisfies" SEC-11. The underlying access control (BetterAuth app-role, reason-gated, audited) is unchanged, so this is posture-integrity rather than a broken gate — hence medium. Fix: bump SEC-11 → v4 to describe the config-flag single-instance model and record the accepted isolation reduction (cite DEC-36); ensure the deferred SEC threat-model pass explicitly covers single-instance blast radius.

- [medium] The SEC-8 immediate-takedown obligation is asserted in IG-11 but unenforced in the owning specs, and the "not an outbound API call" premise is now false. IG-11 correctly states a purge failure "must fail the takedown loudly — never silently leave a recalled article served," but neither PUBS-1 (owns the cache-purge mechanism) nor NWSS-1 (owns the takedown action) carries a failure-path acceptance criterion — both test only the happy path ("cache purged"). Meanwhile ARC-18/PUBS-1 still assert the news purge is "not an outbound third-party API call" — the exact premise that exempted it from the retry/alert treatment social posts get — but IG-11 makes it a fallible Cloudflare Cache-Tags **API call**. So a legally-sensitive recalled-article takedown now rests on a network call whose failure has no testable spec criterion. Medium (not high) only because the obligation is recorded in the constrained-by architecture layer and the specs are un-implemented, so the design gate re-fires before code. Fix: cascade a failure-path acceptance clause into PUBS-1/NWSS-1 (purge failure → takedown fails loudly, alerts operators, article treated as still-live until purge confirmed) and correct the now-inaccurate "not an outbound API call" wording.

- [low] Phase-2 outbox caveat is over-scoped. ADR-0007 states ADR-0003's transactional-outbox caveat "applies at this step" for GCP Cloud Run + Cloud SQL. But Cloud SQL *is* Postgres, so pg-boss transactional enqueue can be retained; only the long-running-consumer assumption is genuinely at risk (Cloud Run scale-to-zero). The caveat is conservatively over-stated — harmless, but imprecise. Note only.

Attacked and held: (1) "builds on, does not supersede ADR-0003" is honest — ADR-0003 explicitly anticipates "future adapters under this same principle — no new decision needed"; adding a CDN port (IG-11) is an extension of the port set, not a contradiction of the ports principle. (2) The `@news` 4th source root earns itself — it is a genuinely separate deployable (Astro SSR vs Vite SPA, own container/build) that reuses `@shared` + DS-8 tokens, consistent with ADR-0004's pre-existing "separate deployable" decision; no over-structure. (3) `docs-check` exits 0 with no stale-pin errors from the ARC-1 v2 / ARC-23 v2 / CON-3 v2 bumps (the "goal NOT achievable" lines are the expected no-code-yet state).

A single high forces fail. Resolve the phase-1 backup gap (add a durability posture or a ratified accepted-risk record), then the two mediums are one-line/one-bump cascade fixes applied in the same change; re-challenge delta-scoped.

## Resolution (applied in-change, r1 → r2)

- **[high] backup** — ADR-0007 gains a "Phase-1 data durability" decision bullet + consequence (scheduled `pg_dump` → Cloudflare R2, bounded retention, restore path); CON-3 v2 records the phase-1 obligation; Q-15 narrowed to residency/SLO only; DEC-36 folds the posture in. Not deferred to Q-15.
- **[medium] SEC-11** — bumped v3 → v4: config-flag single-instance env model, explicit accepted isolation reduction, single-instance blast radius flagged for the deferred threat-model pass; cites DEC-36. Cascade re-pinned (admin.yaml, decisions.yaml, adm-platform-admin.yaml).
- **[medium] SEC-8 takedown** — PUBS-1 (v2 → v3) and NWSS-1 (v1 → v2) gain a purge-failure acceptance clause (fails loudly, retries, alerts operators, article treated as still-live until purge confirmed); the "not an outbound API call" wording corrected to the fallible Cloudflare Cache-Tags API (IG-11) across intent/interfaces/statement. Both specs regressed to `draft` for the delta re-challenge (LRN-23).
- **[low] outbox** — ADR-0007 wording tightened: Cloud SQL keeps transactional enqueue; only the scale-to-zero long-running-consumer assumption is at risk.

Re-challenged delta-scoped in r2 (see deployment-2026-07-22-r2.md).
