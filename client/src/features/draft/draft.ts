/**
 * The deterministic rules of the opened draft (XH-13, APRS-1).
 *
 * Which variant opens first, and how a delivery time reads. Pure and
 * unit-tested; nothing here judges content (LRN-20).
 */

/** A variant as the pane needs it. */
export interface DraftVariant {
  id: string;
  platform: string;
  body: string;
  fitVerdict: string;
  fitReason: string;
  overridden: boolean;
  scheduledFor: string | Date | null;
}

/**
 * The variant to open on.
 *
 * A FITTING channel first, because opening on a skipped one presents the
 * founder with an explanation before they have seen the thing being explained.
 * Falls back to the first variant so the pane never opens on nothing — a draft
 * with every channel skipped still has to be reviewable and overridable
 * (GENS-5 retains skipped variants precisely so they can be overridden).
 */
export function defaultVariant<T extends { platform: string; fitVerdict: string }>(
  variants: readonly T[],
): T | undefined {
  return variants.find((v) => v.fitVerdict === "fit") ?? variants[0];
}

/** Weekday names, as a person says them. */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * A delivery slot in PLAIN LANGUAGE — "Tuesday 9:05 am", never an ISO string.
 *
 * XH-13 asks for schedule rows a founder can read at a glance. A raw timestamp
 * is the software voice VAL-5 rules out, and it also hides the only thing that
 * matters here: which day, roughly when.
 */
export function plainWhen(value: string | Date | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  const at = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(at.getTime())) return undefined;
  const day = DAYS[at.getDay()];
  const hours = at.getHours();
  const minutes = at.getMinutes().toString().padStart(2, "0");
  const suffix = hours < 12 ? "am" : "pm";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${day} ${hour12}:${minutes} ${suffix}`;
}

/** One schedule row as the approve panel shows it. */
export interface ScheduleLine {
  platform: string;
  when?: string;
  skipped?: boolean;
}

/**
 * The schedule rows for a draft's variants.
 *
 * A SKIPPED channel still gets a row. Dropping it would make the skip
 * invisible at exactly the moment the founder is deciding whether to ship —
 * GENS-5 retains the variant and its reason so the omission can be seen and
 * overridden, not so it can be quietly filtered out of the summary.
 */
export function scheduleLines(variants: readonly DraftVariant[]): ScheduleLine[] {
  return variants.map((v) => {
    const skipped = v.fitVerdict === "skipped" && !v.overridden;
    const when = plainWhen(v.scheduledFor);
    return {
      platform: v.platform,
      ...(skipped ? { skipped: true } : {}),
      ...(when !== undefined ? { when } : {}),
    };
  });
}
