# Steward Design Language — deltas over the Airbnb substrate

<!-- @implements DS-1 DS-2 DS-3 DS-5 DS-6 (narrative form; the normative
     register is .spec/product/requirements/ds-design-system.yaml) -->

> Read `../airbnb/DESIGN.md` first — it is the substrate and this document
> deliberately does not repeat it (single source of truth). This file holds
> only what Steward **changes, forbids, or adds**. Governance: DEC-6/DEC-7,
> ADR-0001, DS-1..7; the screens applying this language are UI-1..13 in
> `.spec/architecture/ui.yaml`.

## Who this is for

A founder-operator of a small nonprofit: mission expert, marketing-averse,
time-poor, low AI literacy, quietly guilty about the dark social channel.
The interface must read as **a trusted colleague's finished work brought to
you** — never as a marketing dashboard to operate. Two verbs shape every
screen: **approve** and **redirect**.

## Identity swap (what never ships)

| Substrate | Steward |
|---|---|
| Rausch coral `#ff385c` (Airbnb trademark) | Warm terracotta/clay `#B5502E` (`--accent`) — earthy, human, AA-compliant |
| Airbnb Cereal VF (proprietary) | Inter variable, body weight **500, never 400** |
| Airbnb wordmark/gradient/laurel lockups | "Steward" wordmark in ink (`--fg`), no gradient |

Everything else in the substrate's visual physics is adopted: canvas-white
surfaces, ink ramp, hairline separation, 14/20px photo radii, three-layer
elevation, two-mode type rhythm, single-accent discipline, no text over
photos.

## The inversion: marketplace → workspace

The substrate optimizes *browsing many options with pleasure*. Steward
optimizes *finishing a few items with confidence*. Consequences:

- **No discovery patterns.** No search hero, no infinite grids, no 6-column
  reflow. Content lives in a single calm column (or a 2-column
  detail + sticky-panel layout) inside `--container-max`.
- **Finite stacks.** The Inbox is a digest with a visible end ("3 of 5") —
  progress and doneness are the reward, not endless choice. The completion
  state is Steward's signature moment: the stewardship-streak numeral at
  `--text-3xl/4xl` (our analog of the substrate's rating lockup).
- **One accent use = one decision.** The terracotta accent marks the
  screen's primary action (almost always Approve) and the active nav item.
  If a third accent element appears in a viewport, neutralize one.
- **The sticky panel approves instead of reserving.** The substrate's
  booking panel (three-layer `--elev-raised`, right rail on desktop,
  bottom bar on mobile) becomes the approve panel on post review.
- **Photography stays the hero** — but it is the *org's own* photos (real
  over synthetic, VAL-4). Post cards use the substrate's card anatomy:
  4:3 image at `--radius-md`, tight metadata block below, flat on canvas.

## What Steward adds: the trust chrome (DS-5)

The colleague relationship needs components the substrate never had. These
are first-class, reused everywhere, and carry the "nothing hidden" identity:

- **ReasonLine** — one quiet line (`--text-sm`, `--muted`) under every
  system-initiated item: *why* it exists ("Your beach cleanup is Saturday —
  donors were promised photos"). Every proactive request, draft, and nudge
  carries one.
- **FitBadge** — per-channel chip on drafts: fit (subtle `--success` tint)
  or skipped-with-reason ("skipped X: over policy 'no long stories'").
  Founder can always override.
- **TrustLevel indicator** — the per-category autonomy state (TL0/TL1/TL2),
  visible where it acts, editable in Settings; the kill switch is always
  one gesture, `--danger`, never buried.
- **AssumedNote** — a visible "assumed" marker on anything the system
  defaulted rather than asked, with a one-tap correction path.
- **Awaiting-picture state** — a written-but-blocked draft renders complete
  with a quiet `--warn`-tinted picture slot and library suggestions; never
  an error state, always a next step.

## Voice in pixels (VAL-5, DS-6)

- UI copy is first-person colleague voice: "I drafted next week's posts",
  never "Generation complete". System text always says *why*.
- **No empty states, ever.** Zero-states narrate work in progress ("I'm
  reading your website now — first drafts in about ten minutes") or propose
  the next concrete step. Skeletons and spinners are replaced by narration
  wherever the wait is meaningful.
- Never guilt, never spam: nudges are single and gentle; status/semantic
  color stays under five percent of any page.

## Shell (DEC-7)

Inbox-first: the founder lands on the digest stack. Desktop: quiet left
rail (Inbox · Calendar · Chat · Organization · Settings + the Compose
action), chat companion summonable as a docked right panel on every
surface. Mobile: bottom tab bar, chat as a slide-up sheet. Light theme only
in v1; dark mode is a future sibling of `tokens.css`, never a component
fork.
