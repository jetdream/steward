---
kind: adr
title: Operator access & audit model
status: accepted
supersedes: ~
---

# ADR-0005 — Operator access & audit model

## Context

The internal ops console (OPS-1; behavior OPSS-1/OPSS-2) lets operators silently
QA drafts before Ready for cohort 1, work generation/publish failure queues,
review interview transcripts, and sample external-radar precision (R-4). This
substitutes process for headcount (R-8) and is the R-5 quality floor. It
necessarily reads ALL orgs' confidential data — drafts, transcripts, radar
candidates — which SEC-4 marks org-confidential. No operator identity or authz
exists today: SEC-7 covers only FOUNDER auth (BetterAuth). The OPSS spec flagged
this as decidable before cohort-1 operators touch real org data. A decision is
needed now, while it is cheap, and before code binds.

## Options considered

- **(a) Reuse BetterAuth with an operator role flag** — cheapest; but blurs the
  founder/operator boundary, and cross-org confidential-data access rides on the
  founder auth model with weak, non-first-class audit. Poor fit for a distinct,
  privileged, cross-tenant role.
- **(b) Dedicated operator access + least-privilege RBAC + per-action audit +
  reason-gated cross-org access** — a separate operator identity (not founder
  BetterAuth), scoped strictly to the console functions; every access to an org's
  confidential data is reason-gated and audit-logged; the console is disabled
  outside the ops environment. More setup; clean separation and auditability.
- **(c) No raw-data console access (aggregates only)** — safest, but defeats
  OPSS-1's purpose (operators cannot QA an actual draft). Rejected as
  incompatible with the R-5 quality floor.

## Decision

**(b).** Operators authenticate via a DEDICATED operator identity, distinct from
founder BetterAuth (SEC-7). Access is least-privilege, scoped to the ops-console
functions (OPSS-1/OPSS-2). Every access to an org's confidential data (SEC-4) is
REASON-GATED and fully AUDIT-LOGGED; there is no un-logged raw browse. The
console is disabled outside the ops environment. Recorded as the posture SEC-11;
founder-ratified as DEC-27.

## Consequences

- Binds: SEC-11 (the posture), OPSS-1/OPSS-2 (operator-authenticated, per their
  design), and any future operator-facing surface. Resolves the OPSS
  operator-access open-question.
- Requires an audit-log store and a reason prompt on cross-org access at
  implementation — a first-class part of the ops module (ARC-22), not an add-on.
- Revisit if the cohort-1 operations model changes (e.g., operators become
  per-org rather than cross-org), or if OPS graduates beyond cohort-1 QA.
