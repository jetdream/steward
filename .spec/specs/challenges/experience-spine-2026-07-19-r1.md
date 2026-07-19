---
kind: challenge-record
spec: experience/spine.yaml (EXP register — full replacement, DEC-18)
round: 1
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (Product-Designer + over-structure + coverage-reconciliation lenses)
---

# Product-Designer lens — the One-Home spine (DEC-18 full replacement)

Full-register challenge: the new spine (EXP-1..56), the ui.yaml supersession,
DEC-18, the UX-2/3/5/7/8 and ARC-5/7 amendments, routers, and glossary.
Convergence rule applied: the must-fix and every should-fix were resolved in
the change recording this verdict.

Fixes applied in this change:
- (must-fix) design/design-system/steward/DESIGN.md §Shell rewritten from the
  DEC-7 six-destination shell to the One-Home chrome (Pause · Look-inside
  cluster · Controls · + Compose; summon-over-home mechanics; mobile top bar
  + sheets); header re-pointed at EXP-* in spine.yaml; the accent rule's
  active-nav mention resolved (no nav rail exists — DS-2's focal-element
  bound restated); "Inbox"/"streak" wording updated to Ready/steady-presence
  (DEC-16).
- (should-fix) DESIGN.md trust-chrome inventory gains the HeldForApproval
  card (DS-5 v4, DEC-14) as the veto-window card's deliberate inverse.
- (should-fix) The supersession cascade walked through every living doc:
  ARC-23 (overview.yaml), integrations.yaml (EXP-51..54, EXP-52),
  data-model.yaml (EXP-31), security-privacy.yaml (EXP-36), users.md,
  glossary.yaml, nws-news-site.yaml (EXP-45), design/CLAUDE.md; ADR-0004
  gained a dated amendment note re-pointing UI-60/61 → EXP-48/49.
- (should-fix) Summon mechanics specified once on EXP-38 (panel over the
  home, chrome persists, one back gesture, focus trap/restore — a summoned
  view is a mode of the home, never a sibling destination).
- (should-fix) The r3-vetted one-PUB-3-log clause restored (EXP-26: quiet-
  shape report lines and Plan & Published render the same single log).
- (notes taken) EXP-18 can't-answer honesty state; EXP-22 founder-declines +
  wrong-photo/library states; EXP-24 ask-spacing + material-needed states;
  EXP-17 terminus never says "that's everything" over an open pinned item;
  EXP-30 delete explains its cascade; EXP-26 veto-expired cross-references
  EXP-31's recall/unpublish; EXP-38 card attribution reworded to the DS-1..8
  inventory (trust chrome DS-5); MEM-3/INT-4/STR-2 prose surface names
  updated to the UX-5 v2 views (typo-class, no bump).

## Verbatim verdict

VERDICT: pass (PASS-WITH-FINDINGS — one must-fix, mechanical and
decision-free, to be applied in the same change that records this verdict
per the convergence rule and the r3 precedent; if it is not applied
in-change, this converts to FAIL and spine.yaml must not remain approved)

SPEC: experience/spine.yaml (EXP-1..56, full register replacement) + the
DEC-18 delta (ui.yaml supersession, UX-2/3/5/7/8 amendments, ARC-5/7 v2,
routers, glossary)

FINDINGS:
- [must-fix] The design language the register is GR-7-bound to still
  mandates the shell DEC-18 abolished (DESIGN.md §Shell: "Inbox-first …
  quiet left rail … bottom tab bar"; header pointing at UI-1..13/ui.yaml;
  accent rule naming "the active nav item"). → APPLIED (rewritten).
- [should-fix] DESIGN.md trust-chrome inventory lacked HeldForApproval
  (DS-5 v4) — the pinned zone's most load-bearing card class. → APPLIED.
- [should-fix] Living docs still pointed at the superseded register
  (overview/integrations/data-model/security-privacy, users.md, glossary,
  nws-news-site, design/CLAUDE.md; ADR-0004's constrained-by guidance).
  → APPLIED (all re-pointed; ADR-0004 amended, dated).
- [should-fix] Summon mechanics for glass-wall views/Controls unspecified —
  a router-of-destinations default would rebuild the abolished shell;
  focus trap/restore unstated. → APPLIED (EXP-38).
- [should-fix] The r3-vetted "one PUB-3 log, two views" clause was silently
  dropped, against DEC-18(d)'s own claim. → APPLIED (EXP-26).
- [note ×6] DEC-8-era micro-states dropped without record (chat can't-answer,
  photo-decline/library, veto-after-expiry pointer, memory delete-cascade,
  campaign ask-spacing); post-card attribution wording; terminus-vs-pinned
  honesty; requirement prose naming retired surfaces; the pre-claimed
  challenge record (this file). → ALL TAKEN in-change.

WHAT WAS ATTACKED AND HELD (summary):
- Coverage reconciliation: every item of all 18 registers enumerated against
  both spines' serves-unions — new ⊇ old exactly, CHT-5/INT-4 newly served
  and genuinely delivered. Mutation-proven on a sandbox copy: a bogus serves
  target errors; removing NWS-1 from EXP-9 puts NWS-1 into the gap list
  DESPITE the superseded register still serving it — supersession cannot
  green-wash coverage. Graph green (355 IDs, 2281 refs, 0 errors).
- Every vetted edge case traced to its new home; GR-3 surfacing without a
  nav chip holds because the replacement stack is stronger (pinned zone that
  cannot scroll away on the only landing surface + counted in Ready + the
  EXP-53 action notice off-app).
- Fused-stream decay: the four disciplines are specified structurally
  (P4/P5 + EXP-15/17/26/27/38 + the router invariants); every constructed
  decay vector is fenced (event-driven items arrive quietly; campaign
  bursts compress to one package; Discoveries strictly pull; photo asks
  capped; enrichment rate-limited; absences get grace; the conversation
  region bounded). The ~1-item/day ceiling is consistent with APR-2/GEN-1.
- DEC-14 preservation: VAL-3 logging in EXP-43 + the quiet-shape stream;
  actionable-only alerts = the pinned zone + EXP-53's "nothing else ever
  notifies"; double-counting structurally dissolved.
- Over-structure: EXP IDs earn their keep (serves edges, future
  constrained-by targets, gate-addressable touchpoints, dense
  cross-referencing); nesting fully legal; supersession mechanics sound.
- A11y and DS adherence: EXP-38's stream a11y exceeds the DS-4 baseline;
  every named card class resolves from DS-5 v4; stream-only rows are
  declared compositions (the r3 GR-7 class stays closed).
