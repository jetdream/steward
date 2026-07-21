---
kind: adr
title: Accounts, identity, impersonation & activity-ledger model
status: accepted
supersedes: ADR-0005
---

# ADR-0006 — Accounts, identity, impersonation & activity-ledger model

## Context

Two forces make the ADR-0005 operator-access decision due for revision — a
condition ADR-0005 itself named ("Revisit … if OPS graduates beyond cohort-1
QA"):

1. **Identity refactor (DEC-32, DEC-30).** Steward is separating the Org
   (tenant, DM-1, historically the aggregate root and implicit account) from a
   User (auth principal), with multi-member orgs (DEC-30 reversed the multi-seat
   non-goal). There was no User/identity entity before — SEC-7 covered only
   founder auth.
2. **Admin surface (DEC-32, the ADM register).** Internal staff go beyond
   silent draft-QA to full platform administration **including act-as-org
   impersonation** (read the exact founder view *and act as* the founder) and a
   per-org activity ledger.

ADR-0005 chose a **dedicated operator identity distinct from BetterAuth**,
rejecting "reuse BetterAuth with an operator role" (option a) for blurring the
boundary and "weak, non-first-class audit." That objection is now largely
answered: BetterAuth's **admin plugin** provides a first-class app-level admin
role, `impersonateUser`/`stopImpersonating`, a `session.impersonatedBy` audit
field, and `impersonationSessionDuration` (a time-box); its **organization
plugin** provides `organization`/`member`/`invitation` with owner/admin/member
roles and a `session.activeOrganizationId` active-org context. Harmonizing on
one auth system also serves ADR-0002's minimal-moving-parts axis for a
two-founder team.

## Options considered

- **(a) Keep ADR-0005's separate operator identity + build bespoke multi-user
  org membership.** Two identity systems and a hand-rolled membership/RBAC layer
  — maximal surface, against the ADR-0002 axis; the very duplication BetterAuth
  now removes.
- **(b) One identity system on BetterAuth: organization plugin for Org⟂User
  membership + roles, admin plugin for the platform-staff role + impersonation;
  preserve ADR-0005's guarantees (least-privilege, reason-gate, full audit,
  ops-env-only) on top.** Clean separation of app-level staff role vs org roles
  is native; impersonation + its audit are first-class; least new surface.
- **(c) Buy a third-party admin/impersonation SaaS.** External dependency and
  data-sharing of confidential org data (SEC-4) — rejected.

## Decision

**(b).** Realize accounts, identity, membership, the platform-staff role, and
impersonation on **BetterAuth** (SEC-7 v2), superseding ADR-0005's separate
operator identity:

- **Identity & membership** (ACC): a `User` (DM-15) is the auth principal; an
  `Org` (DM-1) is the tenant; a `Membership` (DM-16, BetterAuth `member`) links
  User→Org with role owner/admin/member; a session names the active org
  (`activeOrganizationId`). Regular users are hard-confined server-side to their
  memberships (ACC-3).
- **Platform-staff role** (ADM-1): the BetterAuth **admin-plugin** app-level
  role, DISTINCT from org roles; staff are not org members. ADR-0005's posture
  is PRESERVED and carried by SEC-11 v2: least-privilege, reason-gated cross-org
  access, fully audit-logged, disabled outside the ops environment.
- **Support impersonation** (ADM-2): `impersonateUser` → the org owner yields
  the exact founder view + active-org context; `session.impersonatedBy` records
  the staff identity; time-boxed via `impersonationSessionDuration`. A reason is
  REQUIRED and recorded on a `SupportSession` (DM-18) — BetterAuth does not
  capture a reason natively, so that is Steward's thin addition over the plugin.
  Audited in full internally, not surfaced to the founder (VAL-3 v2 carve-out,
  DEC-31). The **act-as WRITE boundary** (which founder actions staff may
  perform — approve/publish/Trust-Level/Strategy — and the GR-3/GR-8/AUT and
  G-2-measurement interactions, cf. LRN-24) is NOT decided here; it is pinned in
  the ADMS spec at the behavior gate.
- **Org activity ledger** (ADM-3, DM-17 `ActivityEvent`): an append-only per-org
  record of user / system / job / staff-act-as actions, generalizing PIPE-1
  model-call logging; the substrate the DEC-31 carve-out audits against.

## Consequences

- Supersedes ADR-0005 (its separate-operator-identity mechanism); its
  guarantees (least-privilege, reason-gate, audit, ops-env-only) are retained,
  now realized on BetterAuth and recorded in SEC-11 v2. DEC-27 (the operator
  posture ratification) stands; DEC-32 ratifies this model.
- Binds SEC-7 v2 (auth generalized to multi-user + plugins), SEC-11 v2
  (impersonation + ledger added to the posture), DM-1 (Org, now explicitly the
  tenant with identity external), DM-15/16/17/18 (new entities), ACC-* and ADM-*.
- The ADMS/ACCS specs cite this ADR in `constrained-by`; the act-as write
  boundary and the reason-gate/audit UX are their behavior gate.
- Multi-user membership is now the model even though cohort-1 orgs are
  single-founder (owner-only) — no second refactor when multi-seat management
  (ACC-4) ships.
- Revisit if BetterAuth's org/admin plugins prove insufficient for the
  cross-tenant audit bar, or if a compliance regime demands an isolated
  operator identity after all.
