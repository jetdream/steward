/**
 * The pure summon rules — which regions go `inert` when a pane is open.
 *
 * This is the load-bearing logic of DSS-24 and the thing LRN-29 was written
 * about, so it lives as a pure function with its own unit test rather than
 * inline in a component.
 *
 * **The focus trap is not hand-written; it EMERGES from the inertness.** Once
 * everything except {chrome, pinned zone, pane} is inert, natural Tab order
 * already confines focus to exactly those three — no keydown interception, no
 * sentinel nodes. That is only true because the pane is NON-MODAL: a top-layer
 * `showModal()` (or Radix's `hideOthers()`) inerts the whole document and makes
 * `inert = false` on the pinned zone a no-op, which is precisely the trap
 * LRN-29 records.
 *
 * @implements DSS-24 v1 (the region-inertness rule)
 */

/** The home's four regions, in the order XH-12 fixes and never reorders. */
export const HOME_REGIONS = ["pinned", "ready", "conversation", "terminus"] as const;
export type HomeRegion = (typeof HOME_REGIONS)[number];

/** Exactly two layout modes — phone or desktop, never an in-between (DEC-19/DEC-20). */
export type LayoutMode = "phone" | "desktop";

export interface InertnessInput {
  mode: LayoutMode;
  paneOpen: boolean;
}

/**
 * Which home regions are inert while a summoned pane is open.
 *
 * - **No pane open** → nothing is inert, in either mode.
 * - **Desktop** → the pane opens BESIDE the home, so the stream recedes but the
 *   PINNED ZONE stays live: interactive, announcing, undimmed (XH-12). Only
 *   ready/conversation/terminus go inert.
 * - **Phone** → the pane is a full-screen takeover, so an off-screen-but-
 *   reachable pinned zone would itself be a defect: ALL FOUR regions go inert.
 *
 * The CHROME is never in this list and is never inert in either mode — XH-12's
 * "the chrome persists" holds in both, and AUTS-3 (P0 `hard`) requires the kill
 * switch to stay one gesture away even with a pane open.
 */
export function inertRegions({ mode, paneOpen }: InertnessInput): readonly HomeRegion[] {
  if (!paneOpen) return [];
  if (mode === "phone") return HOME_REGIONS;
  return HOME_REGIONS.filter((r) => r !== "pinned");
}

/** True when `region` must carry the `inert` attribute for this state. */
export function isRegionInert(region: HomeRegion, input: InertnessInput): boolean {
  return inertRegions(input).includes(region);
}

/**
 * Which regions are visually dimmed by the scrim. Desktop dims exactly what it
 * inerts (the stream); phone dims nothing, because the takeover covers the home
 * entirely and a scrim under an opaque surface is invisible work.
 */
export function scrimRegions(input: InertnessInput): readonly HomeRegion[] {
  return input.mode === "desktop" ? inertRegions(input) : [];
}

/**
 * Scroll lock applies to the INERTED region only (DSS-24) — never `body`. The
 * idiomatic modal lock (`body { overflow: hidden }`) would freeze the home
 * column, so a pinned card below the fold could not be scrolled to while the
 * pane is open, and focus moving into it could not bring it into view (DS-4).
 */
export function shouldLockScroll(region: HomeRegion, input: InertnessInput): boolean {
  return isRegionInert(region, input);
}
