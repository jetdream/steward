# experience/ — The Experience Spine (the experienced-HOW)

The UX parallel of [../architecture/](../architecture/CLAUDE.md) (method/ui.md,
v0.14): every user-facing requirement traces to a **journey** that `serves` it
(lint-enforced, orphans rejected); journeys nest **flows**, flows nest
**screens** and **touchpoints** (email/push — Steward-specific kind in
[../architecture/pattern.yaml](../architecture/pattern.yaml)).

| File | Owns | IDs |
|---|---|---|
| [ui.yaml](ui.yaml) | Journeys (relationship chapters), flows, screens, email touchpoints | `UI-*` |

Rules of this layer:

- **Top-down only**: journey before flow before screen; a screen with no
  journey above it is a nesting error. `serves` lives ONLY on journeys.
- **Design gate**: UI spec-elements may `constrained-by` an **approved**
  screen only; the register reaches `approved` via the Product-Designer
  challenger pass + HITL sign-off (DEC-8 for the founding round).
- **Artifacts attach, never lead**: Claude Design mockups/bundles live under
  [/design/](../../design/CLAUDE.md) and are linked from element bodies; the
  element is the addressable node. Visual conformance is governed by GR-7.
- Shared surfaces (shell, chat) are homed under their primary flow and
  referenced by body from other flows — the nesting is a tree, the
  experience is a graph; bodies carry the cross-links.
- The UX-coverage report in `docs-check` lists P0/P1 requirements with no
  serving journey; gaps are resolved consciously (backend-only requirements
  stay uncovered on purpose).
