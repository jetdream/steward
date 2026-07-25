---
kind: adr
title: Client component primitives — native platform behaviour, DSS appearance
status: accepted
supersedes: ~
---

# ADR-0011 — Client component primitives: native platform behaviour, DSS appearance

## Context

The founder UI (`@client`, ARC-2) starts now — the app shell (UXS-1..8) and the
screens of the approved One-Home spine. Appearance is settled twice over;
behaviour is not, and the gap between them is where this ADR lives.

Already decided:

- **ADR-0001** chose the re-themed Open-Design substrate and **rejected building
  from the ShadCN default theme**. `DS-1` makes
  `design/design-system/steward/tokens.css` the single source of every visual
  value.
- **GR-7 v3** (decided-by DEC-35) scopes the inventory clause: **founder- and
  public-facing** surfaces resolve visual values from the steward tokens **and
  reuse the design-system component inventory** — inventing a component there is
  "a governed violation, not a matter of taste". **Internal** staff tools must
  use the tokens but **may compose shadcn primitives directly**.
- **DSS-1..23** is that inventory, realized as 21 hand-written preview cards
  (`design/design-system/steward/preview/*.html`) resolving `var(--*)`.
- **DEC-42** (2026-07-25) authorizes what GR-7 v3 alone could not: founder/public
  surfaces **decline ShadCN**, scoped to surfaces rather than packages, leaving
  DEC-35's internal-tool allowance intact.

What remained open is the **behavioural machinery** — the part carrying no visual
value and no inventory component, but carrying the accessibility contract:

- the **summoned pane** (XH-12 v2, DEC-19/DEC-20): beside the home on desktop,
  full-screen on phone, focus trapped while open and restored on dismiss, one
  "back to Steward" gesture, `Escape` to close — **while the stream stays present
  and dimmed and the pinned zone stays undimmed, interactive, and announcing**
  (`home.yaml:215`, `:246`);
- the **compose sheet** (XH-14) and **Controls tray** (XA-6) — same surface contract;
- **per-channel variant tabs** (XH-13) — roving-tabindex semantics;
- the `DS-4`/`DSS-4` baseline: 2px ink focus ring, ≥44px targets, landmarked
  regions, polite live regions.

The first Architect-Challenger round on this ADR **failed** it, and the failure
set the decision. It verified against `@radix-ui/react-dialog@1.1.23` source that
a Radix modal `DialogContent` calls `hideOthers(content)` — `aria-hidden` on
everything outside the pane up to `<body>` — with `trapFocus` and
`disableOutsidePointerEvents`, while non-modal has no focus trap at all, and
there is no setting between them (`Portal container` does not help; `hideOthers`
walks to `body` regardless). Under a modal dialog the deliberately-undimmed
pinned zone — GR-3 holds, publish failures, channel re-auth, the cards XH-12 says
"cannot scroll away" — becomes keyboard-unreachable, screen-reader-hidden and
pointer-inert, and a click on a visible pinned card dismisses the pane instead of
acting on it. Non-modal is unavailable because DSS-4/DS-4 is P0 `flexibility:
hard` on the focus trap. **No configuration of a portalled modal library
expresses XH-12's carve-out.** A NON-MODAL surface plus per-region `inert` does
— and a native `showModal()` does not, for the same top-layer reason (verified
in the second round; see option 3).

## Options considered

1. **Radix Dialog + Tabs for behaviour, DSS for appearance.** The obvious
   library answer and the one this ADR originally proposed. Rejected on
   verification: as above, neither Radix mode satisfies XH-12 v2, and adopting it
   would have forced the pinned-zone carve-out to be quietly dropped — a semantic
   change to an approved, founder-decided contract (DEC-19), made as a library
   side effect. Its own remaining cons stand too: `@radix-ui/*` release cadence,
   and a portal/overlay structure the beside-the-home desktop pane must be styled
   *around*.
2. **ShadCN on founder surfaces.** Satisfies the constitution's stack line
   literally and matches what internal tools will do. Rejected: on founder
   surfaces it collides with GR-7 v3's inventory-reuse clause that DEC-35
   deliberately kept binding *there*, making every component a per-case judgement
   against a DSS contract that already specifies the answer; and it inherits
   option 1's dialog problem, since ShadCN's dialog *is* Radix's. Its CLI also
   assumes `@/*` aliases where this repo uses `@client/*`, and most of its
   catalogue has no DSS contract (VAL-6 unreferenced structure).
3. **Native platform primitives + the DSS inventory, no new UI dependency
   (chosen).** A **NON-MODAL** surface — `<dialog>.show()` or a plain landmark
   element — plus **per-region `inert`** (stream inerted, pinned zone excluded),
   and a small roving-tabindex tablist for XH-13. Both Baseline in 2026. Cons,
   honestly: the focus trap, focus restore, `Escape` and scroll lock are ALL
   hand-written, because a non-modal surface provides none of them — their
   correctness rests on this repo's own tests, not on a widely-exercised library;
   `<dialog>`'s native backdrop and top-layer promotion go unused; and Safari/iOS
   `inert` behaviour must be verified rather than assumed.

   **`showModal()` is specifically excluded, and this is the crux.** The
   challenger verified in headless Chromium that a top-layer modal `<dialog>`
   implicitly inerts the entire document outside itself: with
   `d.showModal(); stream.inert = true; pinned.inert = false`, focusing a pinned
   button is a no-op and hit-testing the pinned button's own rect returns the
   dialog's backdrop. `inert = false` cannot re-enable a region the top layer has
   already disabled. `showModal()` is therefore `hideOthers()` by another name and
   fails XH-12 exactly as Radix does. The same page with `d.show()` +
   `stream.inert = true` yields a focusable, hit-testable pinned zone, an inert
   stream, and a focusable pane. The distinction is *non-modal vs modal*, not
   *native vs library*.

## Decision

**Option 3.** Founder- and public-facing surfaces take **no new UI dependency**:
behaviour comes from native platform primitives, appearance from the DSS
inventory.

- **The summoned pane, compose sheet and Controls tray** are one shared surface
  built on a **non-modal** `<dialog>.show()` (never `showModal()`) with
  **per-region `inert`**: in desktop mode the stream region is inerted while a
  pane is open, the **pinned zone is explicitly excluded** and stays interactive
  and announcing, and focus is trapped across {pane ∪ pinned zone} and restored
  to the invoking control on dismiss; `Escape`, scroll lock and dismissal are
  hand-written, and scroll lock applies to the inerted region only. Phone mode
  is a full-screen takeover that inerts the home's **regions** (an off-screen but
  reachable pinned zone would itself be a defect) while **carrying the persistent
  chrome** — XH-12's "the chrome persists" holds in both modes, so the AUT-3
  Pause control stays one gesture away even with a pane open (AUTS-3 is P0 hard
  and the phone is the floor). Changed pinned state is re-announced on return.
  XH-12 v2 is honoured as written; the full contract lives in **DSS-24**, not here.
- **Per-channel variant tabs** (XH-13) are a roving-tabindex tablist authored
  in-repo to the WAI-ARIA tabs pattern.
- **Every DSS contract is authored in this repo** under `client/src/ds/`, one
  file per contract, ported from its `preview/*.html` card and carrying
  `@implements DSS-n`.
- **No ShadCN and no Radix on founder/public surfaces** (DEC-42), scoped to
  **surfaces, not packages or source roots**: the internal ops/admin console may
  still compose shadcn primitives inside `@client` per GR-7 v3 and DEC-35, and
  `.spec/experience/admin.yaml`'s shadcn table/badge/chart specifications remain
  implementable unchanged.
- **The DSS inventory is extended before these surfaces ship.** The shipped
  summoned pane and tab strip carry scrim opacity, elevation, radius, pane width,
  motion and tab appearance — visual values GR-7 v3 reserves — and DSS today has
  no dialog/sheet/tray/tabs contract (the register is certified 1:1 with its 21
  built previews). New contracts **DSS-24 (summoned surface + scrim)** and
  **DSS-25 (variant tablist)** are added with preview cards, regressing DSS to
  `draft` for a Product-Designer re-challenge, **before** any founder-surface code
  composes them. The rule "extend DSS first, never adopt a second library
  quietly" applies to this ADR's own surfaces, not only to future ones.

Decisive reason: the approved experience contract, not the convenient library,
decides the mechanism. XH-12's pinned-zone carve-out is a DEC-18 structural
guarantee — holds pin, are never batch-cleared, never scroll away — and the only
primitive that can express it is per-region `inert`.

## Consequences

- `@client` gains **no** new runtime dependency for founder surfaces. The
  hand-written machinery (focus trap/restore, per-region inertness, roving
  tabindex) is load-bearing for DS-4 (P0 hard), so it is held by **explicit e2e
  assertions** — `@validates`-marked stories in the E5 harness covering: focus
  returns to the invoking control on dismiss; the stream is inert while a pane is
  open; **the pinned zone is not inert and its live region still announces** (in
  desktop mode — phone inerts the whole home); the pane is **not** in the top
  layer; `Escape` closes; swap moves focus to the swapped heading and back
  returns it to the invoking row; **the kill switch is reachable in one gesture
  while a phone takeover is open** (AUTS-3); tab keyboard traversal is roving.
  These are named acceptance clauses on the stories register, not ADR prose.
- **DSS → `draft`** until the DSS-24/DSS-25 re-challenge passes; `client/src/ds/`
  is the founder-surface component home.
- **Cascade (DEC-42)**: ADR-0002 carries a dated amendment; `ARC-2 → v2`; the
  "Tailwind + ShadCN" wording is corrected at the constitution, the
  `architecture/overview.yaml` intent line, the ARC-2 body, `client/CLAUDE.md`
  and `client/src/index.ts`.
- **Graph citation**: this ADR governs founder-surface UI, so `UXS` adds it to
  `constrained-by` — which regresses the approved app-shell spec to `draft` for a
  re-challenge. That is the intended loudness (ADR/CLAUDE.md), taken knowingly.
- **DSS-17 (CitationBlock) and DSS-23 (news template)** are shared with `@news`:
  per ADR-0004 they are **re-expressed** as Astro components / React islands
  there rather than imported from `client/src/ds/`; tokens are shared, components
  are not.
- Revisit if: a founder surface needs a component family with no DSS contract —
  extend DSS first (the Q-14/DEC-35 precedent); or if the hand-written a11y
  machinery proves fragile in the e2e suite, at which point adopting a headless
  library becomes a superseding ADR with XH-12's carve-out as its acceptance test.
- Does **not** reopen ADR-0001 (the ShadCN *theme* stays rejected) and does
  **not** narrow DEC-35 (internal tools keep their shadcn allowance).
