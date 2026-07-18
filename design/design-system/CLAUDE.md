# design-system/ — Token-Based Design System

Two siblings sharing one token schema (the Open Design cross-brand
contract — schema names identical, values differ):

- [airbnb/](airbnb/) — **vendored reference substrate**, from
  `github:nexu-io/open-design` `design-systems/airbnb` (snapshot 2026-07-16;
  translated `DESIGN-*.md` duplicates dropped). Kept pristine — never edit;
  refreshing it is a conscious re-import reviewed against the steward
  deltas (ADR-0001). Read its `USAGE.md` → `DESIGN.md` for the substrate's
  visual philosophy, `components.manifest.json` / `components.html` for
  component recipes, `preview/` for visual sanity checks.
- [steward/](steward/) — **the theme Steward actually uses**: `tokens.css`
  (the single token source, DS-1 — terracotta accent, Bricolage Grotesque
  + Source Sans 3; deltas
  documented inline), `tailwind-v4.css` (identical mapping to the
  reference, import swapped), `DESIGN.md` (Steward's adaptation
  language: the marketplace→workspace inversion, trust chrome, voice
  rules — deltas only, substrate not repeated), and `preview/` — the
  `@dsCard` preview kit uploaded to Claude Design via `/design-sync`.
  **Never edit `preview/*.html` by hand**: they are stamped from
  `build-previews.mjs` (which inlines `tokens.css`); edit the template
  or the tokens and re-run `node build-previews.mjs`.

Consumers (mockups now, `@client` components later) import **steward only**.
Governance: DS-1..8 (requirements), ADR-0001, DEC-6/DEC-7/DEC-15.
