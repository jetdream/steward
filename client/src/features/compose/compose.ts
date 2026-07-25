/**
 * The deterministic rules of the composer (APRS-5, UXS-7).
 *
 * What a founder still has to supply, and what happens if they stop. Pure and
 * unit-tested; no content judgment (LRN-20).
 */
import type { ChannelPlatform } from "@shared";

/** What the founder has assembled so far. */
export interface ComposeDraft {
  title: string;
  body: string;
  mediaAssetId: string | null;
  channels: readonly ChannelPlatform[];
}

/** An empty sheet. */
export const EMPTY_COMPOSE: ComposeDraft = {
  title: "",
  body: "",
  mediaAssetId: null,
  channels: [],
};

/** Is there anything worth parking? */
export function hasContent(draft: ComposeDraft): boolean {
  return (
    draft.title.trim().length > 0 ||
    draft.body.trim().length > 0 ||
    draft.mediaAssetId !== null ||
    draft.channels.length > 0
  );
}

/**
 * Can this be sent to the content engine yet?
 *
 * Only the WORDS are required. A picture is NOT a gate here even though GENS-3
 * makes it a hard invariant, because the invariant blocks APPROVAL, not
 * authorship: a composed post with no picture is a legitimate
 * `awaiting_picture` draft (GENS-4 — "complete but blocked, never an error").
 * Refusing to accept it would invent a gate the spec deliberately puts later,
 * and would lose the founder's words while they go hunting for a photo.
 */
export function canCompose(draft: ComposeDraft): boolean {
  return draft.title.trim().length > 0 && draft.body.trim().length > 0;
}

/**
 * What is still missing, in the order the founder should hear it — never a
 * validation error, always the next concrete step (VAL-6).
 *
 * The picture line appears as a CONSEQUENCE ("it will wait for a picture"),
 * not as a blocker, which is exactly the difference GENS-4 draws.
 */
export function whatIsMissing(draft: ComposeDraft): string[] {
  const missing: string[] = [];
  if (draft.title.trim().length === 0) missing.push("a short title, so I can file it");
  if (draft.body.trim().length === 0) missing.push("the words you want to say");
  if (draft.mediaAssetId === null) {
    missing.push("a picture — without one it'll wait in Ready rather than go out");
  }
  if (draft.channels.length === 0) {
    missing.push("channels, or leave it to me and I'll pick the ones that fit");
  }
  return missing;
}

/**
 * The honest note shown when a founder closes an unfinished sheet (XH-14:
 * "closing parks an unfinished draft honestly").
 *
 * It states the SCOPE of the parking truthfully — this visit, not forever —
 * because the composer holds an unsent draft in memory and nothing more.
 * Promising it is saved would be a promise a reload breaks.
 */
export function parkedNote(draft: ComposeDraft): string | null {
  if (!hasContent(draft)) return null;
  return "I've kept what you wrote for this visit — open Compose again and it's there. It isn't saved anywhere yet.";
}
