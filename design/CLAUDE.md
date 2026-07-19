# design/ — Design Artifacts

Visual/UX artifacts that cannot live in `.spec/` YAML (method/ui.md): design
systems, and — as the design pass produces them — Claude Design mockups and
wireframes. **The addressable node is always a design-element in
`.spec/experience/spine.yaml` (EXP-*); files here are its attachments**,
linked from the owning element's `body`. Never the reverse.

```mermaid
graph LR
  UI[".spec/experience/spine.yaml — EXP-* screens/flows/journeys"] -- body links --> ART["design/** artifacts"]
  DS[".spec/product/requirements/ds-design-system.yaml — DS-*"] -- realized by --> TOK["design-system/steward/ tokens + theme"]
```

## Structure

- [design-system/](design-system/CLAUDE.md) — the token-based design system:
  vendored Airbnb substrate + the Steward theme (ADR-0001, DEC-6/DEC-7).
- `mockups/` *(arrives with the Claude Design pass)* — screen mockups, one
  folder per EXP-* element. Each folder's `PROVENANCE.md` records the owning
  design-element; the design-system `preview/` files carry
  `<!-- @implements DS-* -->` markers and participate in the evidence graph.
  (Existing `ui-7-*` folders predate DEC-18 and attach to the superseded
  UI-* register — historical reference material, not current mockups.)

## Rules

- Mockups and components resolve style exclusively via the steward theme
  tokens (DS-1) — never raw values, never the airbnb reference directly.
- Airbnb brand marks (Rausch coral, Cereal VF, wordmark) never appear in
  Steward surfaces (ADR-0001 consequences).
