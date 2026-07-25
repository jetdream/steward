# experience/ — The Experience Spine (the experienced-HOW)

The UX parallel of [../architecture/](../architecture/CLAUDE.md) (method/ui.md):
every user-facing requirement traces to a **journey** that `serves` it
(lint-enforced, orphans rejected); journeys nest **flows**, flows nest
**screens** and **touchpoints** (email/push/bot — a standard pattern kind in
[../architecture/pattern.yaml](../architecture/pattern.yaml)).

The One-Home spine (DEC-18) is split **by journey domain** into eight registers
(DEC-28, 2026-07-20) once it crossed the scale trigger (~56 elements / ~1000
lines — method/ui.md "Scaling"). Content is preserved verbatim from the retired
`EXP` spine; the **home** register (`XH`) is the shared One-Home shell every
other domain references by ID (VAL-4 — never copied). All eight are one
Product-Designer challenger pass ([specs/challenges/experience-split-2026-07-20-r1.md](../specs/challenges/experience-split-2026-07-20-r1.md)).

| File | Domain | IDs | Status |
|---|---|---|---|
| [onboarding.yaml](onboarding.yaml) | Day one & doorstep | `XO-*` | approved |
| [home.yaml](home.yaml) | **The One-Home shell** (shared surface) — home, draft-opened, weekly visit, just-talk, compose, digest/nudge | `XH-*` | approved |
| [autonomy.yaml](autonomy.yaml) | Earning the reins, Controls, action-notice | `XA-*` | approved |
| [proactive.yaml](proactive.yaml) | Colleague-moves-first, quick-upload, photo-request, bots | `XP-*` | approved |
| [glass-wall.yaml](glass-wall.yaml) | Looking inside — the four views | `XG-*` | approved |
| [account.yaml](account.yaml) | Fair account & exit | `XB-*` | approved |
| [public.yaml](public.yaml) | Donor & news (public) | `XN-*` | approved |
| [ops.yaml](ops.yaml) | Operators & console (internal) | `XOPS-*` | approved |
| [ui.yaml](ui.yaml) | The original six-destination spine (DEC-8/9/14 era) | `UI-*` | **superseded** (DEC-18) — retained so historical references resolve; never extend |
| [vision-experience-map.md](vision-experience-map.md) | The legibility cross-cut: VIS-2 pillars → the elements that realize them | — | router |

Rules of this layer:

- **Top-down only**: journey before flow before screen; a screen with no
  journey above it is a nesting error. `serves` lives ONLY on journeys.
- **Design gate**: spec-elements may `constrained-by` an **approved** screen
  only; the register reaches `approved` via the Product-Designer challenger
  pass + HITL sign-off (DEC-18 for the One-Home round; DEC-8 founded the
  superseded register).
- **Artifacts attach, never lead**: Claude Design mockups/bundles live under
  [/design/](../../design/CLAUDE.md) and are linked from element bodies; the
  element is the addressable node. Visual conformance is governed by GR-7.
- **One-Home invariants (DEC-18)**: the home's chrome and region order never
  change across its shapes; holds/failures pin and are never batch-cleared;
  the stream always reaches "caught up"; the glass wall is one click,
  plain-labeled, pull-only — never gated behind chat.
- Shared surfaces are homed under their primary flow and referenced by body
  from other flows — the nesting is a tree, the experience is a graph.
- The UX-coverage report in `docs-check` lists P0/P1 requirements with no
  serving journey; gaps are resolved consciously (backend-only requirements
  stay uncovered on purpose).

## Two conscious entries in the `not yet ux-designed` report line

`docs-check` marks a requirement ux-designed only when a serving journey's own
subtree holds ≥1 flow **and** ≥1 leaf surface. Because the nesting is a tree
while the experience is a graph, two entries on that list are deliberate, not
debt — recorded here so neither is "fixed" by inventing a duplicate screen:

- **XH-2 "Just talk"** (→ CHT-1..CHT-5, INT-3, INT-4, MEM-2, UX-2). It nests
  flows XH-7/8/9/10 and no screen **by design**: DEC-18 abolished the chat page,
  so the conversation is REGION 3 of the home screen [XH-12](home.yaml) — homed
  under XH-5 (its steady life) and referenced by body from XH-2, exactly the
  shared-surface rule above. Chat UI therefore `constrained-by`s XH-12 + XH-2 and
  the design gate is satisfied; a second "chat screen" would re-create the surface
  DEC-18 removed. Read that report line as "shares a designed surface", not
  "undesigned".
- **XB-1 "Fair account and exit"** (→ BIL-1, BIL-2). This one IS a real gap:
  flows XB-2/XB-3 nest no screen (XB-6 hangs off XB-4/XB-5). Billing UI needs a
  `/cortex:ux` step adding that screen first — tracked in
  [bil-billing.yaml](../specs/bil-billing.yaml) `open-questions`, and outside the
  P1b founder-loop slice.
