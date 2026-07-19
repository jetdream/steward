# Steward Design Language — deltas over the Airbnb substrate

<!-- @implements DS-1 DS-2 DS-3 DS-5 DS-6 (narrative form; the normative
     register is .spec/product/requirements/ds-design-system.yaml) -->

> Read `../airbnb/DESIGN.md` first — it is the substrate and this document
> deliberately does not repeat it (single source of truth). This file holds
> only what Steward **changes, forbids, or adds**. Governance:
> DEC-6/DEC-7/DEC-15/DEC-18, ADR-0001, DS-1..8; the elements applying this
> language are EXP-* in `.spec/experience/spine.yaml` (the One-Home model).

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
| Airbnb Cereal VF (proprietary) | **Bricolage Grotesque** (display) + **Source Sans 3** (body) — a characterful grotesk over a neutral humanist body (DS-3 v2, DEC-15); confident body weight (≥500 in UI) |
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
- **Finite stacks.** Ready is a finite spine with a visible end ("3 of 5")
  — progress and doneness are the reward, not endless choice. The
  caught-up terminus is Steward's signature moment: the steady-presence
  numeral at `--text-3xl/4xl` (our analog of the substrate's rating
  lockup; "rhythm", never "streak" — DEC-16).
- **One accent use = one decision.** The terracotta accent marks the
  screen's primary action (almost always Approve). The One-Home shell has
  no nav rail (DEC-18), so there is no active-nav accent; at most one
  focal element per viewport stands beyond the primary action (DS-2).
- **The sticky panel approves instead of reserving.** The substrate's
  booking panel (three-layer `--elev-raised`, right rail on desktop,
  bottom bar on mobile) becomes the approve panel on the opened draft
  (EXP-39).
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
- **ProvenanceLine** — the Memory sources a draft grounded on ("from your
  update last Tuesday · your website"), quiet metadata with tap-through to
  the entries. Trust for weeks 1–8 lives here.
- **OptionalReason** — the one-tap, dismissible reason affordance ("not
  now" / "not our style" / tell me why) shared by Skip and veto; feeds
  Memory, never blocks the primary action.
- **Veto-window card** — the heads-up level's "published on my own — you
  can veto until Thu" card class: its own quiet visual register, excluded
  from progress counts and batch actions, never confusable with
  needs-approval.
- **HeldForApproval card** — GR-3's face and the veto-window card's
  deliberate inverse (DEC-14, DS-5 v4): a sensitive-topic draft held for
  the founder at every trust level — pinned in the home's needs-you zone,
  counted in Ready, always actionable, never batch-approvable, its
  ReasonLine naming the hold.
- **CitationBlock** — GR-5's visual form: source, link, and the org's
  commentary framing as one treatment, shared by inbox external cards and
  public news articles (DEC-9).
- **ArticleLink badge** — FitBadge's sibling: which social variants carry
  the news-page article link and why (length-limited channels first);
  never shown for unpublished articles (NWS-5, DEC-9).

## Voice in pixels (VAL-5, DS-6)

- UI copy is first-person colleague voice: "I drafted next week's posts",
  never "Generation complete". System text always says *why*.
- **No empty states, ever.** Zero-states narrate work in progress ("I'm
  reading your website now — first drafts in about ten minutes") or propose
  the next concrete step. Skeletons and spinners are replaced by narration
  wherever the wait is meaningful.
- Never guilt, never spam: nudges are single and gentle; status/semantic
  color stays under five percent of any page.

## Shell (DEC-18 — the One-Home model)

One home, no destinations. The invariant chrome: **Pause** (kill switch,
one gesture) · wordmark in ink · the **Look-inside cluster** — Knowledge ·
How I write · Plan & Published · Discoveries, each one click, pull-only,
never badged (VAL-3) · **Controls** · **+ Compose** (an action, never a
place). The home stream's regions keep one fixed order: pinned needs-you
zone → the Ready spine → the conversation (composer never blank, CHT-5) →
the caught-up terminus. Summoned views open as focused panels OVER the
home on desktop and full-screen takeovers on phone — the chrome persists,
one "back to Steward" gesture returns, focus is trapped while open and
restored on dismiss; a summoned view is a mode of the home, never a
sibling destination. Mobile: the same chrome as a compact top bar; views
as sheets. Light theme only in v1; dark mode is a future sibling of
`tokens.css`, never a component fork.
