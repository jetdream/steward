---
kind: adr
title: Design-system substrate — re-themed Airbnb open-design fork
status: accepted
supersedes: ~
---

# ADR-0001 — Design-system substrate: re-themed Airbnb open-design fork

## Context

The P1a design pass (Claude Design mockups for the app shell and core loop,
UI-1..13) needs a visual foundation before any screen is designed. The
constitution fixes Tailwind + ShadCN; the persona (marketing-averse,
time-poor founder — users.md) demands a calm, welcoming, content-first
surface, and the product is picture-centric (GEN-3, VAL-4): the org's own
photography must carry the screens. Choosing a substrate is a
flexibility-limiting decision (SDLC A5) — every mockup, token, and component
builds on it. Decided by the founder as DEC-6/DEC-7.

## Options considered

1. **Build from the ShadCN default theme.** Zero vendoring; but a generic
   utility-app look — exactly the "software, not colleague" feel the vision
   rejects — and every spacing/typography/photography decision would be made
   ad hoc, screen by screen, with no documented visual philosophy for design
   agents to consume.
2. **Adopt the Open Design "airbnb" package, re-themed (chosen).** A curated,
   token-complete system (DESIGN.md intent + tokens.css + Tailwind v4 mapping
   + component recipes) whose character — spacious, breathing, photography
   at hero scale, single-accent discipline, hairline separation — matches the
   product's needs precisely. Cons, honestly: it encodes a *marketplace* UX
   (browse-many-options) that must be deliberately inverted for a workspace;
   its brand marks (Rausch coral, Cereal VF) are Airbnb's identity and cannot
   ship; it is light-only; and it is a bundled fixture, not Airbnb's actual
   source — treat it as a design description, not ground truth.
3. **A different OD package or commissioned custom system.** No other
   candidate matches the photography-first + calm-canvas requirements as
   directly; a custom system costs design time the 12-week clock (roadmap)
   doesn't have.

## Decision

Option 2. The package is vendored at `design/design-system/airbnb/`
(reference substrate, kept pristine; translated DESIGN duplicates dropped).
Steward consumes it through a sibling theme `design/design-system/steward/`
that preserves the OD token schema names exactly (the cross-brand contract)
and re-binds: accent → warm terracotta `#B5502E` (DEC-7, AA-compliant),
fonts → Inter with body weight 500, plus Steward-specific deltas documented
in the theme's DESIGN.md. The marketplace→workspace UX inversion and the
trust chrome are normative in the DS register (DS-1..7); the UX structure
that applies them is `experience/ui.yaml` (UI-*).

## Consequences

- UI specs and mockups build on the steward theme tokens only (DS-1); no
  component cites the airbnb reference files directly.
- The airbnb folder is a frozen upstream snapshot: refreshing it from
  open-design is a conscious re-import, reviewed against the steward deltas.
- Dark mode remains a future binding file on the same schema (DS-7).
- If the OD schema itself changes upstream, the steward theme is the
  insulation layer — components never see the change.
- Rausch coral, Cereal VF, and other Airbnb trademarks must never appear in
  shipped surfaces; the reference package exists for its philosophy and
  recipes, not its brand.

## Amendments

- **2026-07-18 (DEC-15).** The foundations were reopened and re-explored (four
  theme directions, then real-font type pairings). Outcome: this substrate and
  the terracotta/light-only/single-accent pillars are **reaffirmed** — no
  supersession. Two theme-layer refinements landed in the steward theme (not
  the substrate): the neutral ramp was warmed to a deliberate accent bias, and
  the type moved off Inter to Bricolage Grotesque (display) + Source Sans 3
  (body) (DS-3 v2). The substrate/OD-schema decision here is unchanged.
