---
kind: challenge-record
spec: .spec/specs/adm-platform-admin.yaml
round: 4
date: 2026-07-21
verdict: pass
by: cortex:architect-challenger (four lenses; r1 fail → r2 fail → r3 fail → r4 pass)
---

# Challenge record — ADMS (Platform Administration), ADMS-1..6

The security-critical spec (full-parity support impersonation) took four rounds;
each round caught a real defect that would have become a code bug or a trust
failure. Convergence applied in the recording change each round.

## Round 1 — FAIL (2 highs)
- **(high)** The staff-act-as G-2 rule was carried only in the spec, not the
  higher-precedence G-2 goal note, and ADMS-2 vs ADMS-6 stated it two
  incompatible ways (LRN-24 recurrence). → Fixed: G-2 `outcome.reasoning` now
  states the act-as treatment; both elements use "kept in the denominator, never
  credited to the numerator."
- **(high)** The activity ledger (DM-17 actorKind) could not represent a staff
  READ or a direct staff-admin ACTION (only act-as); SEC-11's "no un-logged raw
  browse" had no home. → Fixed: DM-17 gains a `staff` actorKind; ADMS-1 splits
  reason-gated per-org confidential access (tier 1, ledgered) from audit-only
  cross-org aggregate views (tier 2).
- Mediums: GR-3/GR-8 hold-release authority unpinned; VAL-3 carve-out's
  substituted attribution unspecified + "results still appear" breaks at TL0;
  empty governed-by; depends-on omitted AUTS/PUBS. → All fixed.

## Round 2 — FAIL (1 new high)
- **(high)** The neutral "Steward support action" marker (the founder-decided
  fix for the TL0 anomaly) CHANGED the VAL-3 v2 / DEC-31 carve-out (silent,
  visibility deferred) while mis-citing DEC-31 as authority — an unrecorded
  value-semantic change. → Fixed: DEC-33 records the neutral-marker decision;
  VAL-3 → v3 (identity hidden, fact-of-support shown); DEC-31's deferral honestly
  re-pointed; ADMS/ADR-0006 re-cite DEC-31-refined-by-DEC-33.
- Medium: tier-2 "platform staff-audit log" had no data-model home + contradicted
  "no new source of truth." → Fixed: aggregates are staff-role-gated, expose no
  SEC-4 confidential content, introduce no audit store; drill-in re-enters tier 1.

## Round 3 — FAIL (1 new high, incomplete cascade)
- **(high)** SEC-11 (in ADMS constrained-by) still encoded the pre-DEC-33 "not
  surfaced to the founder" state — the neutral-marker cascade reached VAL-3 and
  ADR-0006 but missed SEC-11 (DEC-33 had bound only [VAL-3, ADM-2]). Lint-invisible
  (unpinned). → Fixed: SEC-11 → v3 agreeing with the marker model; DEC-33 binds
  SEC-11; five prose "SEC-11 v2" pins unpinned.
- Medium: the marker was asserted on PUBS-3, which does not render it (stranded).
  → Fixed: ADMS owns the cross-cutting obligation; rendering is tracked (an
  open-question) to PUBS-3 + the experience surfaces, not silently dropped or a
  premature PUBS re-gate.
- Low: billing tier-1/tier-2 line thin. → Open-question names invoices/payment
  instruments (tier 1) vs subscription-status rollup (tier 2).

## Round 4 — PASS
All round-3 fixes verified against the governing artifacts; SEC-11 v3 / VAL-3 v3 /
ADR-0006 / ADMS-2 now agree on founder-visibility; the marker rendering is honestly
disclosed as a downstream cascade; no new high. One non-blocking low (acceptance
tested deferred rendering) applied in the recording change: ADMS-2 acceptance now
splits ADMS's owned half (ledger + fact-of-support emission) from the surfaces'
rendering (attributed to the PUBS-3/experience cascade).

## Verdict

VERDICT: pass

Full-parity support impersonation is specified with the guardrail chain intact
(GR-3/GR-8 holds fire; a staffer-as-founder may clear them — founder-ratified
DEC-32), full internal audit + reason-gate (SEC-11 v3), the honest G-2 treatment
(LRN-24), and the founder-facing neutral-marker carve-out (DEC-33 / VAL-3 v3).
The spec earns `approved`; elements realize when the client `src/` exists, and
the marker-rendering cascade to PUBS-3 + the experience spine is tracked.
