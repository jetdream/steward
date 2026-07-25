/**
 * @implements DSS-4 v1 (accessibility primitives)
 *
 * The DS-4 baseline as reusable pieces: a visible 2px ink focus ring, ≥44px
 * touch targets, landmarked regions, and polite live regions. DS-4 is P0
 * `flexibility: hard`, and ADR-0011 makes this module load-bearing — founder
 * surfaces build their own dialog/tab behaviour on native primitives, so the
 * a11y contract lives here rather than inside a library.
 *
 * Everything is a token-resolved class string or a plain ARIA attribute set —
 * no raw values (DSS-1), no component of its own (GR-7).
 */

/**
 * The visible focus treatment: a 2px INK ring, never the accent. Photography is
 * the hero surface and a terracotta ring vanishes against warm imagery
 * (tokens.css #Bind S4). Apply to every interactive element.
 */
export const focusRing =
  "outline-none focus-visible:shadow-[var(--focus-ring)] focus-visible:relative";

/**
 * The ≥44px target floor (DS-4). Applied to controls whose visual box is
 * smaller than their hit area — icon buttons, tabs, compact rows.
 */
export const minTarget = "min-h-[44px] min-w-[44px]";

/** A control that is visually small but must still meet the target floor. */
export const tapTarget = `${minTarget} ${focusRing}`;

/**
 * Screen-reader-only text: present in the accessibility tree, invisible on
 * screen. For the label a sighted user gets from context (an icon's name, a
 * region's heading).
 */
export const srOnly =
  "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip-path:inset(50%)]";

/**
 * The polite live region used for stream updates (XH-12: "polite live-region
 * updates — the stream is navigable, not a moving feed"). `atomic: false` so a
 * new card is announced, not the whole region re-read.
 *
 * Load-bearing for DSS-24: the PINNED zone keeps its live region while a pane
 * is open, which is why that zone is excluded from the pane's `inert`.
 */
export const politeLiveRegion = {
  role: "status",
  "aria-live": "polite",
  "aria-atomic": false,
} as const;

/** An assertive live region — reserved for the kill switch's confirmation (AUT-3). */
export const assertiveLiveRegion = {
  role: "alert",
  "aria-live": "assertive",
  "aria-atomic": true,
} as const;

/**
 * Landmark props for one of the home's four regions (XH-12 REGIONS, fixed
 * order). Each region is a labelled landmark so the stream is navigable by
 * region rather than by scrolling.
 */
export function regionLandmark(label: string): {
  role: "region";
  "aria-label": string;
} {
  return { role: "region", "aria-label": label };
}

/**
 * Per-region inertness (DSS-24). `inert` is set on the region that must go
 * unreachable while a summoned pane is open — NEVER on the whole document, and
 * never on the pinned zone in desktop mode.
 *
 * Returns the attribute object rather than mutating, so React owns the DOM.
 * `inert` is a boolean attribute: React 19 renders it correctly from a boolean.
 */
export function inertWhen(inert: boolean): { inert?: true } {
  return inert ? { inert: true } : {};
}
