---
kind: challenge-record
spec: experience/admin.yaml (XADM) + experience/account.yaml XB-4/5/6 (the admin-capability experience round, DEC-34)
round: 2
date: 2026-07-21
verdict: pass
by: cortex:architect-challenger (Product-Designer lens; r1 fail → r2 delta pass)
---

# Product-Designer lens — the admin-capability experience round

Founded the internal platform-admin console register (XADM: journeys serving
ADM-1..6) and added the founder-facing ACC-4 team-management surface (XB-4/5/6).

## Round 1 — FAIL (1 high, 1 medium, 2 lows)
- **(high)** Five screens claimed to "reuse DS table / data-viz / banner
  components (GR-7)", but the design system (DS-1..8 / DSS-1..23) owns no table,
  no data-viz, and no banner — it is a card / badge / form / DS-5 trust-chrome
  system for the founder spine. A false conformance claim for components never
  built. → Fixed by mirroring this project's DEC-33-marker precedent: Q-14 tracks
  the internal-console DS extension (table/list, data-viz, act-as-banner
  trust-chrome) as a decision to make before the screens are built; the screens
  now name the needed primitive + Q-14 instead of faking reuse; the FOUNDER team
  screen (XB-6) switched to a card list on the owned card system (no table).
- **(medium)** permission-denied — the register's declared universal state —
  was missing on XADM-12 (ledger, the sharpest tier-1 case) and XADM-16 (KPI). →
  Added to both.
- **(low)** XADM-9 banner was chrome-modeled-as-screen. → Named the act-as
  trust-chrome component (Q-14), modeled here as the impersonation surface.
- **(low)** XADM-15 billing missing an empty state. → Added.

## Round 2 — PASS
All four fixes verified real; graph green (540 IDs); coverage holds (ADM-1..6 and
ACC-4 each served; nesting legal; no orphan journey). Impersonation
flow-achieves-goal (reason-gate → founder view under banner → parity acts →
one-gesture/auto-end exit → ledgered; non-staff denied). VAL-3 v3 reconciliation
correct (the neutral support marker is NOT in the internal console — staff see
full attribution — it lives on founder surfaces via the tracked ADMS-2 cascade).
Two non-blocking lows applied in the recording change: status/actorKind chips are
stated to compose DSS-9 + DSS-2 (the DSS-19 compose-primitives precedent) rather
than a nonexistent status-pill; the banner tint cites DSS-2's semantic color role
(not the DSS-5 button).

## Verdict

VERDICT: pass

The admin-capability experience is coherent, states are complete (permission-
denied first-class on every surface — the top risk), design-system honesty is
restored (the genuine primitive gap is tracked in Q-14, not silently invented),
and every journey serves its requirement. The XADM register earns `approved`;
the founder-facing XB-4/5/6 additions are signed off in the same round (DEC-34).
