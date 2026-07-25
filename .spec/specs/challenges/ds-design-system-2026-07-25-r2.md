---
kind: challenge-record
spec: .spec/specs/ds-design-system.yaml
round: 2
date: 2026-07-25
verdict: pass
by: cortex:architect-challenger (Product-Designer + over-structure lenses; four delta-scoped rounds)
---

# DSS + UXS re-challenge — 2026-07-25 (rounds r1–r4)

**Challenger:** `cortex:architect-challenger` (Product-Designer + over-structure
lenses; four delta-scoped rounds).
**Delta:** DSS-24 (summoned surface) + DSS-25 (variant tablist), the `design`
shell paragraph, `constrained-by` += ADR-0011, XH-12; UXS `constrained-by` +=
ADR-0011 (no UXS item statement changed).

VERDICT: pass

— at r4-fixed, on the challenger's explicit conditional authorization.

Stated precisely, because the honesty matters more than the label: rounds **r1,
r2, r3 and r4 all returned `fail`**. Every finding from all four was applied. The
r4 verdict closes with the condition for the flip — for UXS, *"correct those two
lines and UXS flips on a pure verification pass — no re-challenge round needed
beyond confirming `rg -n showModal` is clean"*; for DSS, *"needs findings 2–5
applied … then it can flip in the same change; those are bounded edits, not a
redesign, so a further full round is not warranted."* Those edits were made and
independently re-verified (see **Verified at close**). This record carries the
pass on that authorization, not on a fifth clean round.

## Why this took four rounds

The delta looked like paperwork — two component contracts for surfaces that were
about to be built anyway. It was not. Each round found a defect that would have
shipped an accessibility failure invisible to the manual evaluation this whole
phase exists to enable.

**r1 (on ADR-0011, before DSS-24/25 existed).** Verified against
`@radix-ui/react-dialog@1.1.23` source that a modal `DialogContent` calls
`hideOthers()` — `aria-hidden` on everything outside the pane up to `<body>` —
so the deliberately-undimmed pinned zone (GR-3 holds, publish failures, channel
re-auth) would have gone keyboard-unreachable and unannounced. Non-modal has no
focus trap, which DS-4 requires as P0 `hard`. Also found that the pane and tabs
were being built with **no DSS contract at all**, violating GR-7 v3's
inventory-reuse clause — the finding this delta exists to fix — and that
declining ShadCN contradicted the constitution and needed a founder decision.
→ **DEC-42** recorded; ADR-0011 rewritten to native primitives.

**r2.** Proved in headless Chromium that the *replacement* mechanism was the same
bug: `<dialog>.showModal()` promotes to the top layer, so `pinned.inert = false`
is a **no-op** (focus lands nowhere; hit-testing the pinned button returns the
backdrop). `d.show()` + per-region `inert` works. The distinction is **modal vs
non-modal**, not library vs native.
→ Mechanism corrected in ADR-0011, DEC-42 and DSS-24, with the negative
constraint made DSS-24's acceptance clause.

**r3.** Found the phone clause stranded the **AUT-3 kill switch** — "inert the
whole home" contradicts XH-12's "the chrome persists" and AUTS-3's P0-hard
"always reachable at every Trust Level", on the platform UXS-1 calls the floor.
Also proved the new Tailwind mapping was **dead**: `var()` is not substituted in
media features, so `--breakpoint-desktop: var(--breakpoint-desktop)` compiled to
a query that never matches — phone layout at every width, no error — and that
clearing `sm/md/lg` broke the internal console's shadcn source (GR-7 v3/DEC-35).
→ Chrome carve-out, literal breakpoint, defaults restored, two-modes moved to a
founder-surface convention.

**r4.** Found the corrected mechanism had **not** propagated: `ARC-2 v2` and
`client/CLAUDE.md` still said `showModal()` — the architecture layer and the
module router an implementing agent reads *first*. Also that `--home-measure:
480px` with a remainder pane contradicted the founder-reviewed desktop render
(`design/mockups/exp-38-home/round-1/Steward Home (desktop).html`: stream 600,
pane 640→760), making the pane the *smaller* half from 900–1120px; that
`--z-pane` would occlude the chrome it had just promised to preserve; and that
DSS-25's overflow rule was keyed to phone while the narrow desktop pane is the
tighter case.
→ All applied; layout numbers taken from the reviewed mockup rather than invented.

## Findings applied (r4 → close)

| # | Sev | Finding | Fix |
|---|---|---|---|
| 1 | high | `showModal()` residue in ARC-2 v2 + `client/CLAUDE.md` | both now mandate non-modal `.show()`; `rg showModal` returns only prohibitions |
| 2 | high | `--home-measure: 480px` + remainder pane contradicts DEC-19 and the reviewed render | `--home-measure: 600px`, `--pane-basis: 640px`, `--pane-max: 760px` from the mockup; DSS-24 states the pane is never the smaller half |
| 3 | med | `--z-pane` occludes the chrome carrying the kill switch | `--z-chrome: 30` above the pane; DSS-24 forbids occluding Pause |
| 4 | med | DSS-25 overflow keyed to phone, but the desktop pane is tighter | conditioned on **container**, not mode |
| 5 | low | scroll-lock exemption self-contradicted in phone mode | scoped to desktop |
| 6 | low | a `sed` leaked a DS-2 marker onto `inputs.html` | reverted; regenerated |
| 7 | low | conventions prose binds nothing mechanically | recorded as acknowledged debt in **LRN-29** with the pre-commit check named |

## Verified at close

- `desktop:` compiles to `@media (width >= 900px)`; `sm`/`md`/`lg` still emit
  `40rem`/`48rem`/`64rem` (compiled with the repo's own `tailwindcss@4.3.3`).
- 1:1 inventory holds: 25 DSS items − 2 foundation contracts (DSS-1, DSS-4) = 23
  contracts ↔ 23 preview cards; previews regenerate byte-identically from
  `build-previews.mjs`.
- `rg showModal` → only negative mentions (prohibitions + rationale).
- `cortex-docs-check`: 0 errors, 0 warnings.

**UXS** needed no edit of its own: the challenger attacked all eight items
against ADR-0011 and only UXS-6 collided — via the ADR's phone clause, not via
anything UXS says — which the r3 fix resolved upstream. Its `constrained-by`
addition is a genuine no-op for UXS-1..8.

Learning deposited: **LRN-29**.
