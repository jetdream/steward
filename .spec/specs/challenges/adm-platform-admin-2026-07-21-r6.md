---
kind: challenge-record
spec: .spec/specs/adm-platform-admin.yaml
round: 6
date: 2026-07-21
verdict: pass
by: cortex:architect-challenger (architect lens; finalization re-gate, fail → fail → pass)
---

# Challenge record — ADMS finalization (DEC-35), the two-role change

After the r4 approval, DEC-35 finalized the capability (console DS = shadcn +
tokens / GR-7 v3; two staff roles admin/support; seed admin; time-box + retention
CON-4). That changed ADMS-1 → v2 (two-role model + staff provisioning),
regressing the spec to draft. Re-gate:

## Finalization round A — FAIL (incomplete cascade + audit gap)
- **(high)** The two-role model lived only in ADMS-1's statement; `intent` /
  `design` / `data` / `interfaces` and DM-15 still described the v1 single role.
  → Propagated the two-role model + provisioning + the staff-management audit
  posture through all framing sections and DM-15 → v2.
- **(medium)** Staff-user management (account-minting + role grants) — the
  highest-privilege op — had no audit home (DM-17 is orgId-scoped). → Stated it
  is admin-only, evidenced by the BetterAuth user record (platform-level).
- **(low)** "admin" overloaded (org-role vs platform). → Added glossary terms
  (Org role / Platform staff / Platform admin / Platform support).

## Finalization round B — FAIL (cascade stopped below the requirement + audit overstatement)
- **(high)** The cascade never reached the REQUIREMENT: ADM-1 still described a
  single role, so ADMS-1's `implements: [ADM-1]` over-claimed (the spec added an
  access tier the requirement didn't describe; DEC-35 even `binds` ADM-1). →
  **ADM-1 → v2** (decided-by DEC-35): two tiers admin/support, admin-only staff
  management, seed admin, + acceptance; ADM register intent updated; G-1 coverage
  re-affirmed ADM-1@1 → ADM-1@2.
- **(medium)** The role-CHANGE audit was overstated (BetterAuth's role field is
  current-state, not an append-only escalation trail). → Reworded: only staff
  CREATION is evidenced; the who-changed-whose-role trail + reason-gate are
  deferred to the DEC-35 threat-model pass, "not claimed as already present."

## Round 6 — PASS
Cascade complete top-to-bottom (G-1 pin → ADM-1 v2 → ADMS-1 v2 → DM-15 v2 →
glossary); `implements: [ADM-1]` no longer over-claims; the audit claim is
truthful; the r4 substance (full-parity act-as with the guardrail chain firing,
the VAL-3 v3 neutral marker, two-tier org-confidential audit, G-2 non-autonomous
per LRN-24, GR-7 v3) is intact. One low applied in the recording change (DEC-35's
pre-ship threat-model pass widened to name staff role/privilege management).

## Verdict

VERDICT: pass

The two-role model (admin / support = all-but-user-management), seed-admin
provisioning, and the shadcn-on-tokens console (GR-7 v3) are coherent and
fully cascaded through the requirement, spec, data-model, and glossary layers.
ADMS earns `approved` again.
