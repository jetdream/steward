/**
 * @implements DSS-3 v1 (typography scale)
 *
 * The DS-3 two-face rhythm as named ROLES rather than sizes: a chiseled display
 * face (Bricolage Grotesque) over a neutral humanist body (Source Sans 3,
 * DEC-15). Components pick a role — never a size — so the scale can move in
 * `tokens.css` without touching a component (DSS-1: type roles are tokens,
 * never ad-hoc sizes).
 *
 * Display sizes carry the negative tracking token; body text never does.
 */

/** The display face + its tracking. Composed into every display role below. */
const display = "font-display tracking-[var(--tracking-display)] leading-tight";

/**
 * The type roles, matching the scale demonstrated in
 * `design/design-system/steward/preview/typography.html`.
 */
export const typeRole = {
  /** 28px/700 — the page's one display line ("Your week is ready"). */
  display: `${display} text-2xl font-bold`,
  /** 22px/600 — a subsection ("What I know about your programs"). */
  subsection: `${display} text-xl font-semibold`,
  /** 20px/600 — a card title. */
  cardTitle: `${display} text-lg font-semibold`,
  /** 16px — the body default; the reading size for draft text. */
  body: "font-body text-base leading-[var(--leading-body)]",
  /** 14px — secondary body: reasons, notes, skip explanations. */
  secondary: "font-body text-sm leading-[var(--leading-body)]",
  /** 12px/600 — metadata: channel names, timestamps, badge text. */
  meta: "font-body text-xs font-semibold",
  /**
   * 44px/700 — the RHYTHM numeral, completion moments only (the caught-up
   * terminus, XH-12 region 4). Never "streak" in founder-facing copy (DEC-16).
   */
  rhythm: `${display} text-3xl font-bold`,
} as const;

export type TypeRole = keyof typeof typeRole;

/** The ink tones that pair with the type roles — the grayscale ramp, never the accent. */
export const textTone = {
  primary: "text-fg",
  secondary: "text-fg-2",
  muted: "text-muted",
  meta: "text-meta",
} as const;

export type TextTone = keyof typeof textTone;
