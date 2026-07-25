/**
 * The Ready spine's deterministic rules (APRS-1 v3, UXS-3).
 *
 * Three of them, and each is a One-Home invariant rather than a layout
 * preference: what PINS, what "approve all ready" may touch, and the header
 * contract that makes the spine finite. Pure and unit-tested; no content
 * judgment (LRN-20).
 */

/** The card fields these rules read — a projection of the DM-5 ContentItem. */
export interface SpineCard {
  id: string;
  editorialState: "draft" | "awaiting_picture" | "approved" | "skipped";
  /** VAL escalated (GR-3 sensitive / GR-8 taboo) — a human must clear it per card. */
  escalated: boolean;
  /** GENS-3/4: no picture ⇒ approval is honestly blocked. */
  hasPicture: boolean;
}

/**
 * Split the stack into the PINNED needs-you zone and the clearable spine.
 *
 * A held card pins (UXS-3: "holds/failures PIN"), and pinning is not decoration
 * — the pinned zone cannot scroll away and stays live beside an open pane
 * (DSS-24), which is the only reason a GR-3 hold cannot be missed.
 *
 * Awaiting-picture does NOT pin. It is complete-but-blocked, not a failure
 * (GENS-4 is explicit that it "reads as awaiting-picture, not an error"), so it
 * belongs in the spine with its Approve disabled and its reason stated.
 */
export function partitionSpine<T extends SpineCard>(
  cards: readonly T[],
): {
  pinned: T[];
  spine: T[];
} {
  const pinned: T[] = [];
  const spine: T[] = [];
  for (const c of cards) (c.escalated ? pinned : spine).push(c);
  return { pinned, spine };
}

/** Why a card cannot be swept by "approve all ready" — null when it can. */
export type BatchExclusion = "held" | "awaiting-picture" | "not-a-draft";

/**
 * The batch-approve exclusion rule (APRS-1), mirroring the server's
 * `batchEligible` so the button can state up-front what it will NOT touch.
 *
 * The client copy exists to make the exclusion VISIBLE, never to decide it: the
 * server re-applies the same rule, so a client that drifted would over-promise
 * in the button label, not over-approve.
 */
export function batchExclusion(card: SpineCard): BatchExclusion | null {
  if (card.escalated) return "held"; // GR-3 / GR-8 — never batch-cleared
  if (card.editorialState === "awaiting_picture" || !card.hasPicture) return "awaiting-picture";
  if (card.editorialState !== "draft") return "not-a-draft";
  return null;
}

/** How many cards "approve all ready" would take, and how many it would leave. */
export function batchPlan(cards: readonly SpineCard[]): { eligible: number; excluded: number } {
  let eligible = 0;
  for (const c of cards) if (batchExclusion(c) === null) eligible += 1;
  return { eligible, excluded: cards.length - eligible };
}

/** Minutes a founder should budget per card — the estimate behind the header. */
const MINUTES_PER_CARD = 2;

/**
 * The spine header (XH-5): "Ready for you · 3 of 5 · about six minutes".
 *
 * The COUNT is what makes the spine finite and therefore clearable — the
 * founder can see the end of it, which is the difference between a stack and a
 * feed (UXS-3). The time estimate is what makes the visit committable inside
 * the G-3 budget; it is rounded to whole minutes because "about 4.5 minutes"
 * is a claim of precision nobody has.
 */
export function spineHeader(remaining: number, total: number): string {
  if (total === 0) return "Nothing waiting for you";
  const minutes = Math.max(1, Math.round(remaining * MINUTES_PER_CARD));
  const unit = minutes === 1 ? "minute" : "minutes";
  return `Ready for you · ${remaining} of ${total} · about ${minutes} ${unit}`;
}
