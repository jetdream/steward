---
kind: challenge-record
spec: .spec/specs/ds-design-system.yaml
round: 1
date: 2026-07-20
verdict: pass
by: cortex:architect-challenger (Product-Designer + design-conformance lenses)
---

# Design gate — the design-system component-contract spec (DSS-1..23)

The middle artifact of the design-system TRIO (method/ui.md §5), binding the
DS-1..8 guarantees to 23 concrete component contracts grounded on the built
steward system (design/design-system/steward/). Challenged before `approved`.

## Held under mutation-level scrutiny

- **Guarantee coverage (both directions):** every DS-1..8 has ≥1 implementing
  contract; nothing invented beyond the DS-5 inventory.
- **Inventory completeness:** exact 1:1 with the 21 built previews + the DS-5
  trust-chrome list, plus two foundation contracts (DSS-1 tokens, DSS-4 a11y)
  that have no standalone preview — no built-without-contract, none
  contracted-without-built.
- **Graph resolution:** docs-check 0/0; every DS/DEC/GEN/AUT/NWS/VAL/Q/ADR ref
  resolves.
- **Trust-level model** {TL0|TL1|TL2} in DSS-10/15/16 matches AUT-1 v2.
- **Fonts** (Bricolage Grotesque + Source Sans 3, DS-3 v2/DEC-15) match the
  built tokens.css / typography.html.
- **Composite surfaces** (DSS-19/20/21) compose primitives without inventing
  new visual values (GR-7).

## Findings — all one-line reconciliations, applied in this change

No surviving high. Per the convergence rule, all five were fixed in the commit
recording this verdict:

- **(medium) DSS-2** had broadened the accent-eligible set with "summon
  indicator" — a target absent from DS-2 (which it implements) and the built
  colors.html; a silent loosening of the single-accent discipline. Fixed:
  aligned to DS-2's exact set ("the primary action, the active-nav indicator,
  and at most one focal element per viewport"). (Had summon genuinely needed
  the accent, that would be a DS-2 change requiring a DEC — not a spec-level
  widening.)
- **(low) DSS-14** dropped "radar-feed marks" from DS-5's enumerated
  OptionalReason sharer set. Fixed: added it back.
- **(low) DSS-5** named a `ghost` variant the built system ships as `quiet`
  (btn-quiet / DESIGN.md). Fixed: renamed to `quiet` with the built-naming note.
- **(low)** the `design:` prose claimed a preview for every contract; DSS-1 and
  DSS-4 have none. Fixed: softened to note the two foundation contracts.
- **(low) DSS-19** listed `[DS-2, DS-5]` while the built post-card self-tags
  `@implements DS-2 DS-5 DS-6`. Fixed: added DS-6.

## Verdict

VERDICT: pass

**pass** — coverage, inventory, graph resolution, the trust-level model, fonts,
and composite composition all held; the five localized reconciliations were
applied in the recording change. The spec earns `approved`; its elements remain
unrealized until the client `src/` carries the `@implements DSS-*` markers.
