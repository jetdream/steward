# experience/ — The Experience Spine (the experienced-HOW)

The UX parallel of [../architecture/](../architecture/CLAUDE.md) (method/ui.md,
v0.14): every user-facing requirement traces to a **journey** that `serves` it
(lint-enforced, orphans rejected); journeys nest **flows**, flows nest
**screens** and **touchpoints** (email/push/bot — Steward-specific kind in
[../architecture/pattern.yaml](../architecture/pattern.yaml)).

| File | Owns | IDs | Status |
|---|---|---|---|
| [spine.yaml](spine.yaml) | **The living spine** — the One-Home model (DEC-18): the trust-arc journeys, the fused home stream, the glass-wall views, touchpoints | `EXP-*` | approved |
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
