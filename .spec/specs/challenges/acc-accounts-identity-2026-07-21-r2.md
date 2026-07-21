---
kind: challenge-record
spec: .spec/specs/acc-accounts-identity.yaml
round: 2
date: 2026-07-21
verdict: pass
by: cortex:architect-challenger (four lenses; r1 fail → r2 delta pass)
---

# Challenge record — ACCS (Accounts & Identity), ACCS-1..3

## Round 1 — FAIL (2 highs, 2 mediums, 1 low)

- **(high)** Single-owner invariant asserted but unenforced — BetterAuth
  `updateMemberRole` could mint a second owner; the parenthetical covered only
  removal, and no acceptance tested "no second owner."
- **(high)** ACCS-1 (signup creates the User+owner-Membership) silently
  contradicted the approved ONBS-1 (`startSignup → Org` only), with no
  INC/cascade — the signup-time membership creation was specified nowhere.
- **(medium)** Confinement keyed on membership, not the active org — a
  multi-membership user could name a non-active member org.
- **(medium)** Confinement silent on non-user (system/job) actors, which DM-17
  models.
- **(low)** `constrained-by` omitted DM-17; `governed-by` empty though GR-6
  governs the "official mechanism, no bespoke identity store" stance.

## Round 2 — PASS (fixes verified, convergence-applied same change)

- **High 1 closed:** ACCS-3 makes the single-owner invariant Steward-enforced —
  role-change targets only admin|member and can never produce a second owner;
  ownership changes ONLY via an atomic transfer (demote+promote); invites are
  admin|member only; acceptance asserts "always exactly one owner." Every
  owner-creation path is closed.
- **High 2 closed:** INC-6 records the ONBS reconciliation (resolved); ACCS owns
  signup-time identity (the User+Org+owner-Membership triple) with
  `depends-on: [ONBS]`; ONBS-1's prose is flagged stale-but-not-wrong, not
  silently edited or force-re-gated.
- **Medium 3 closed:** ACCS-2 resolves org scope server-side from
  `activeOrganizationId`; a request naming any non-active org is refused until a
  membership-confined switch.
- **Medium 4 closed:** system/job actors carry an explicit single-org scope,
  equally confined; acceptance covers it.
- **Low 5 closed:** `constrained-by += DM-17`; `governed-by = [GR-6]`.
- Residual r2 lows (non-blocking, addressed): invite clause now names
  admin|member explicitly so no clause reads as permitting an owner invite; the
  ACC-4 P2 sequencing note retained (matches the projectwide contextual pattern).

## Verdict

VERDICT: pass

Both former highs are truly closed and no new high was introduced; ACC-1..5 are
each covered with acceptance, `design-scope: cross-cutting` is honest, and all
`constrained-by` targets are accepted/approved. The spec earns `approved`.
