/**
 * @module @client/ds — the Steward design system, realized (DSS-1..25)
 *
 * The founder-surface component inventory GR-7 v3 binds every screen to. One
 * file per DSS contract, each carrying its `@implements DSS-n` marker; the
 * visual source of truth for each is its card in
 * `design/design-system/steward/preview/`.
 *
 * ADR-0011 / DEC-42: founder surfaces take NO ShadCN and NO Radix. Behaviour
 * comes from native platform primitives (a non-modal `<dialog>.show()` plus
 * per-region `inert` for the summoned pane, a roving-tabindex tablist);
 * appearance comes from here. Internal staff tools keep their DEC-35 shadcn
 * allowance — the scope is by surface, not by package.
 *
 * E1 lands the FOUNDATIONS (DSS-1..4). The component contracts (DSS-5..25)
 * arrive in E2/E3.
 */

// DSS-1 — the token source is `../index.css`, which imports the steward theme.
// It has no runtime export; the marker lives in that file.

export {
  assertiveLiveRegion,
  focusRing,
  inertWhen,
  minTarget,
  politeLiveRegion,
  regionLandmark,
  srOnly,
  tapTarget,
} from "./a11y.js";
export {
  ACCENT_FOCAL_ATTR,
  ACCENT_FOCAL_SELECTOR,
  accentFocal,
  assertSingleAccent,
  countAccentFocals,
} from "./accent.js";
export { type TextTone, type TypeRole, textTone, typeRole } from "./type.js";
