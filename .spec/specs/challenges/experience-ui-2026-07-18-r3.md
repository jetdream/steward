---
kind: challenge-record
spec: experience/ui.yaml (DEC-14 reconciliation round)
round: 3
date: 2026-07-18
verdict: pass
by: cortex:architect-challenger (Product-Designer + over-structure lenses, delta-scoped)
---

# Product-Designer lens — DEC-14 reconciliation round (GR-3 hold, TL2 inbox, activity center)

Delta-scoped per the challenge policy: fresh attack on the DEC-14 delta —
UI-7 v3, UI-29 v2, UI-16 v2, UI-6 v4, UI-45 v2, UI-17 v3, UI-12 v3, the new
UI-67/UI-68, DS-5 v4 (HeldForApproval), INC-3, DEC-14 — and their
interactions with the DEC-8/DEC-9 spine. Convergence rule applied: no
blocker survives; all findings resolved in the change recording this verdict.

Fixes applied in this change:
- (must-fix) UI-67 no longer asserts a "NotificationItem" component DS-5
  doesn't own — restated to compose ENTIRELY from existing DS-5 primitives
  (ReasonLine + timestamp + one-tap action), closing the GR-7
  screen-invents-a-component class (the r1-finding-3 / r2-finding-3 class).
- (should-fix) GR-3 hold now has an ACTIVE surfacing path, not just a passive
  render: UI-7 v3 states the hold raises the Inbox count chip at every trust
  level (pulling back even a TL2 founder) and a time-sensitive hold rides an
  APR-4 notification — the UI-26/UI-56 "never discover it silently" precedent
  applied to the guardrail.
- (should-fix, low) UI-67/UI-42 log duplication resolved: UI-67's auto-done
  section is stated as a recency VIEW of the single PUB-3 publish log (the
  same source UI-42 renders as a calendar view), not a second divergent log.
- (note) UI-12 v3 now acknowledges the CANCEL section that UI-45 v2 homes on
  it — the single-source sibling of its billing section.
- (note) UI-67 states a publish failure appears once (in "needs you"), so the
  inbox count and the activity count never double-count one event.

## Verbatim verdict

VERDICT: pass (PASS-WITH-FINDINGS)
SPEC: experience/ui.yaml (DEC-14 delta) + ds-design-system.yaml (DS-5 v4) + inconsistencies.yaml (INC-3) + decisions.yaml (DEC-14)

No high finding survives scrutiny. GR-3's manifestation is fail-safe (a held
item never auto-publishes, at any Trust Level), the held/veto card
non-confusability is designed, TL0/TL1/TL2 is coherently one screen, and
UI-6 v4's top-chrome affordance reconciliation with the "only Inbox carries a
nav chip" rule holds (it is chrome, not nav). Graph green (292 IDs, 0
errors/0 warnings, verified).

FINDINGS:
- [must-fix] UI-67 invents an un-owned component ("NotificationItem row") not
  in DS-5 v4 — the GR-7 screen-invents-a-component class. Fix: fold into DS-5
  or restate UI-67 as composed existing primitives. → APPLIED (restated).
- [should-fix] GR-3 hold has no active surfacing path at TL2 for a
  time-sensitive item; both new actionable-signal surfaces enumerate only
  publish-failure + re-auth, omitting held items. Fix: state the hold raises
  the Inbox chip regardless of trust level + a time-sensitive hold rides a
  notice (APR-4). → APPLIED (UI-7 v3).
- [should-fix, low] UI-67 auto-done log and UI-42 publish log both render
  PUB-3; distinguished only as recency-vs-time. Fix: state UI-67 is a VIEW of
  the single PUB-3 log. → APPLIED (UI-67).
- [note] UI-45 v2 homes cancel on "the cancel section of UI-12" but UI-12
  enumerated no such section. Fix: one line in UI-12. → APPLIED (UI-12 v3).
- [note] Two actionable count-bearing chrome elements (Inbox nav chip +
  activity affordance) — reconciliation sound; ensure they never double-count
  one event. → APPLIED (UI-67 non-double-count clause).

What I attacked and why it held:
- GR-3 satisfaction: held card excluded from auto-publish, never
  batch-approvable, always actionable, counted, ReasonLine-named, uniform
  across TL0/TL1/TL2 — a fail-safe hold forcing approval regardless of Trust
  Level. Held (surfacing caveat fixed above).
- Held-vs-veto non-confusability: deliberate inverses, distinct visual
  registers; batch-approve skips both; held counted, veto excluded. Held.
- HeldForApproval as first-class DS-5: justified by the veto-window-card
  precedent (DEC-8) — a single-inbox card class already owned as a signature
  component. Held.
- VAL-6 / calm-badges reconciliation (UI-6 v4): the top-chrome count is
  actionable-only (not vanity, not a nudge); Inbox chip + pull-only Radar
  rules unchanged. Held.
- Over-structure (UI-67/UI-68 earn their keep): referenced by DEC-14 binds,
  UI-6 v4 (opener), UI-16 v2, UI-17 v3 (parent); the alerts-aggregation +
  actionable-count-home function is genuinely new (a calendar grid is the
  wrong home for a recency alert feed). Held, modulo the log-view clause.
- Nesting/altitude: UI-68 (flow) under UI-17 (journey) serving PUB-3/VAL-3,
  UI-67 (screen) under UI-68 — legal top-down nesting, serves only on the
  journey, no pixel detail above screen level. Held.
- State completeness (UI-67/UI-68): empty ("all quiet"), populated, resolved,
  handled-elsewhere present; TL2 calm-confirmation on UI-7. Held.
- a11y: no invented treatment; GR-7 pulls DS-4 (WCAG AA, 44px, focus) onto
  the new surfaces. Held.
- Graph machinery: docs-check green (292 IDs, 1648 refs, 0 errors); all new
  IDs resolve.
