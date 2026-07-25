/**
 * The deterministic rules of the Controls tray (UXS-6, AUTS-1/3, ONBS-4).
 *
 * How a channel's health reads, and what the founder is told about it. Pure and
 * unit-tested; no content judgment (LRN-20).
 */

/** The DM-14 health states, as the deterministic machine reports them. */
export type ChannelStatus = "connected" | "expired" | "revoked" | "error";

/** One channel row in the tray. */
export interface ChannelRow {
  platform: string;
  status: ChannelStatus | null;
  statusReason: string;
}

/** What the founder should see and be offered for a channel's health. */
export interface ChannelPresentation {
  /** Plain language, first person, never a status code. */
  summary: string;
  /** `connect` for a channel never linked; `reconnect` to repair one. */
  action: "connect" | "reconnect" | null;
  /** Does this belong in the pinned needs-you zone (ONBS-4 / XO-4)? */
  needsYou: boolean;
}

/**
 * How a channel's health reads to a founder.
 *
 * The load-bearing distinction is UNCONNECTED vs BROKEN. A channel that was
 * never linked is not a problem — ONBS-4 makes connecting a non-gate, so it
 * gets an invitation and never a needs-you card. A channel that WAS working and
 * stopped is the case the founder must never discover silently: it says what
 * happened, offers re-auth, and earns a pinned card.
 */
export function presentChannel(row: ChannelRow): ChannelPresentation {
  if (row.status === null) {
    return {
      summary: "Not connected — drafts still flow, I just can't post there yet.",
      action: "connect",
      needsYou: false,
    };
  }
  if (row.status === "connected") {
    return { summary: "Connected.", action: null, needsYou: false };
  }
  // expired | revoked | error — all three are "it was working and now isn't".
  const because = row.statusReason.trim();
  const why =
    row.status === "expired"
      ? "the connection timed out"
      : row.status === "revoked"
        ? "access was withdrawn on their side"
        : "something went wrong with the connection";
  return {
    summary: `I can't post here right now — ${because || why}.`,
    action: "reconnect",
    needsYou: true,
  };
}

/** The Trust Levels, with the plain label and the promise each one makes. */
export const TRUST_LEVELS = [
  { id: "TL0", label: "I approve everything", detail: "Nothing goes out until you say yes." },
  {
    id: "TL1",
    label: "Let the routine ones go",
    detail: "I publish the ordinary posts and show you each one, pullable for a day.",
  },
  {
    id: "TL2",
    label: "Run it",
    detail: "I publish without asking, and you can stop me at any moment.",
  },
] as const;

/**
 * Categories permanently capped at heads-up (XA-6/AUT-1): a fundraising ask and
 * anything sourced externally never auto-publish, whatever the dial says.
 *
 * A cap that is not SHOWN is indistinguishable from a bug the first time a
 * founder raises a dial and nothing changes — so the tray states it.
 */
export const CAPPED_CATEGORIES: ReadonlySet<string> = new Set(["fundraising_ask", "external"]);

/** Is this category's autonomy permanently limited, whatever the dial reads? */
export function isCapped(category: string): boolean {
  return CAPPED_CATEGORIES.has(category);
}
