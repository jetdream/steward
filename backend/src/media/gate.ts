/**
 * The GENS-3/GENS-4 picture gate — DETERMINISTIC editorial-state logic (not an LLM
 * hope). GEN-3 is a HARD invariant: every post carries a picture, so a ContentItem
 * cannot leave `awaiting_picture` toward `approved` without an attached MediaAsset
 * (DM-5 invariant 1). Pure functions the content store + APR approve path call.
 */
import type { EditorialState } from "@shared";

/** GENS-4: a freshly-generated master with no picture lands `awaiting_picture`, else `draft`. */
export function editorialStateForDraft(hasPicture: boolean): EditorialState {
  return hasPicture ? "draft" : "awaiting_picture";
}

/**
 * GENS-3/4: a ContentItem may advance to `approved` ONLY with an attached picture.
 * The hard editorial gate (APR's approve path calls this before permitting approval).
 */
export function canApprove(item: { mediaAssetId: string | null }): boolean {
  return item.mediaAssetId != null;
}
