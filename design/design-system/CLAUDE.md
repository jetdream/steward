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
  (the single token source, DS-1 — terracotta accent, Inter; deltas
  documented inline), `tailwind-v4.css` (identical mapping to the
  reference, import swapped), and `DESIGN.md` (Steward's adaptation
  language: the marketplace→workspace inversion, trust chrome, voice
  rules — deltas only, substrate not repeated).

Consumers (mockups now, `@client` components later) import **steward only**.
Governance: DS-1..7 (requirements), ADR-0001, DEC-6/DEC-7.
