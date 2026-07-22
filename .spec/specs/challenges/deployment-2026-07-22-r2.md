# Challenge record — Deployment-topology delta (r2, delta re-challenge)

- date: 2026-07-22
- by: cortex:architect-challenger (delta re-challenge — verify r1 fixes + fresh attack on changed items)
- scope: ADR-0007, DEC-36, CON-3 v2, Q-15, IG-11, ARC-1 v2/ARC-23 v2, SEC-11 v4, PUBS-1 v3, NWSS-1 v2
- verdict: **pass-with-nits** (three one-line prose-consistency fixes, applied in this same commit)

## Verbatim verdict

I have completed verification and a fresh attack on the changed sections. Key findings below.

## Verification of the four r1 fixes

1. **[high] backup false-deferral** — substantively resolved: the phase-1 durability obligation (`pg_dump` → R2 + restore path) is now the ratified posture in ADR-0007 Decision, CON-3 v2, Q-15, and DEC-36. BUT the cascade is incomplete (see nit 1 below): ADR-0007 Consequences line 72 still lists "backup" among the phase-2-provider open question, contradicting its own line 56.
2. **[medium] SEC-11 v4** — verified. Honestly describes the config-flag single-instance model, names the conscious isolation reduction, states access control is carried entirely by app-role + reason-gate + audit (unchanged), and flags single-instance blast radius for the deferred threat-model pass. Cascade re-pinned. No new hole; the `@news` container is a separate deployable so the "never enabled in a reader-only deployment" clause is coherent. Held.
3. **[medium] SEC-8 takedown** — the failure-path acceptance is now present and testable in both PUBS-1 v3 and NWSS-1 v2 (purge failure → fails loudly, retries, alerts operators, article stays reported-live until purge confirmed). Mechanism/action ownership split is mutually consistent. BUT the "not an outbound API call" wording was NOT fully cascaded — ARC-18, the architecture SSOT both specs are `constrained-by`, still carries the disproven premise (see nit 2).
4. **[low] outbox** — verified. ADR-0007 now says Cloud SQL keeps transactional enqueue; only the scale-to-zero long-running-consumer assumption is at risk. Correct.

---

VERDICT: pass-with-nits
SPEC: /home/coder/project/.spec/adr/0007-deployment-topology.md (delta re-challenge r2: ADR-0007, DEC-36, CON-3 v2, Q-15, IG-11, ARC-1 v2/ARC-23 v2, SEC-11 v4, PUBS-1 v3, NWSS-1 v2)

FINDINGS (all three are one-line fixes; none is a surviving high; none is a behavioral hole — the authoritative decisions and the spec acceptance criteria are correct, so the two `draft` specs are safe to re-approve once these are applied in the same commit):

- [medium] ADR-0007 self-contradicts on the exact point the r1 high fixed — Consequences bullet (line 72) still says "the provider (GCP vs DO) and its data-residency/**backup**/SLO posture are a tracked open question," while the same ADR's Decision (line 56) says "Only data-residency and uptime SLOs — **not backup** — ride with the phase-2 provider," and CON-3 v2 / Q-15 / DEC-36 all pull backup into phase-1. Survives scrutiny: the task's own verification asks "no file still says backup rides with the phase-2 provider" — and ADR-0007 itself still does, in its Consequences summary; lint can't catch it (prose). Fix: in ADR-0007 line 72 drop "backup" → "data-residency/SLO posture".

- [medium] The stale "not an outbound API call" premise was only cascaded into the specs, not into the architecture SSOT — ARC-18 (then v1) (overview.yaml ~line 289) still asserts "social adapters make outbound third-party API calls, whereas 'publishing' to the news page only sets the article's publish-state in our DB and purges the renderer's cache tag," directly contradicting IG-11 / PUBS-1 v3 / NWSS-1 v2 (which now correctly make the purge a fallible outbound Cloudflare Cache-Tags API call). Both specs are `constrained-by: [... ARC-18 ...]` and cite ARC-18 as the asymmetry authority, so a governing higher-layer artifact still carries the premise the r1 fix disproved. Survives scrutiny: the r1 resolution claimed the wording was "corrected across intent/interfaces/statement" but that was the specs' fields only; ARC-18 was never touched or bumped. No behavioral hole (code implements the specs, which are correct), hence medium not high. Fix: reword ARC-18's contrast (the news purge IS an outbound Cloudflare Cache-Tags API call per IG-11; the asymmetry is that the renderer pulls downstream, not that the purge is local/reliable) and bump ARC-18 to v2 — no live version pin cites ARC-18 at v1, so the cascade is contained.

- [low] ADR-0007 Consequences bullet 1 overclaims phase-1 self-containment: "no cloud accounts required to run cohort 1" contradicts the same ADR's phase-1 commitments — Cloudflare CDN fronts the prod news surface (IG-11), Cloudflare R2 is the blob store (IG-10), and the `pg_dump` backup targets the "already-present Cloudflare R2." Phase-1 prod therefore does require a Cloudflare account; only the compute/hosting cloud (GCP/DO) is avoided. Survives scrutiny: the claim is unqualified and reads as "cohort-1 is cloud-free," which a founder could rely on for deployment planning; the design is transparent about Cloudflare everywhere else, so this is a summary-line accuracy defect. Fix: qualify to "no cloud **compute/hosting provider (GCP/DO)** required; Cloudflare CDN + R2 remain the phase-1 external dependency."

Attacked and held: (a) the phase-1 durability obligation is genuinely recorded (not re-deferred) across Decision/CON-3/Q-15/DEC-36 — the residual is only the line-72 wording above; (b) SEC-11 v4 introduces no new access-control hole — the reduction is the acknowledged deployment-isolation loss, access control unchanged, blast radius routed to the threat-model pass; (c) PUBS-1 v3 and NWSS-1 v2 failure-path acceptance is testable (simulate Cache-Tags API failure → assert loud failure + retry + operator alert + still-live-until-confirmed) and the mechanism/action ownership split is mutually consistent; (d) no other artifact carries the stale "outbound API" premise (glossary ARC-18 ref is neutral); (e) the `@news` 4th source root and the ports-extension for the CDN remain consistent with ADR-0003/ADR-0004 as r1 already held.

Why pass-with-nits and not fail: no surviving high — the r1 high is substantively resolved (durability is a ratified phase-1 obligation) and the SEC-8 behavioral gap is closed in the specs that code will implement. All three nits are one-line fixes to prose consistency in ADR-0007 and ARC-18; applying them in the same commit that records this verdict satisfies the convergence rule, after which the two specs can be re-approved.

## Resolution (applied in this commit)

- **[medium] ADR-0007 line 72** — dropped "backup" from the phase-2 open-question bullet; it now reads "data-residency/SLO posture … (backup is a phase-1 obligation, not part of this)".
- **[medium] ARC-18 → v2** — reworded: the news purge IS a fallible outbound Cloudflare Cache-Tags API call (IG-11); the asymmetry is that the renderer PULLS downstream, not that the purge is local/reliable; purge failure fails loudly (PUBS-1/NWSS-1, SEC-8). No live `ARC-18@1` pin — cascade contained; overview amendment note updated.
- **[low] ADR-0007 Consequences bullet 1** — qualified to "no cloud COMPUTE/HOSTING provider (GCP/DO) required; Cloudflare CDN + R2 remain the phase-1 external dependency."

Convergence rule satisfied (no surviving high, only one-line-fix nits applied in-change). PUBS-1 (pub-publishing.yaml) and NWSS-1 (nws-news-site.yaml) re-approved on the strength of this pass.
