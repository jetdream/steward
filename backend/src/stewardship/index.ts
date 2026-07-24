/**
 * @module @backend/stewardship (ARC-15 — the donor-lifecycle read; STW)
 *
 * STW-1's stewardship rhythm is REALIZED by the GENS-1 planner quota (the ≥1
 * impact/gratitude-per-trailing-28-day reservation, a plan-time slot designation —
 * @backend/content/planner). Stewardship owns NO separate planner (no double-
 * ownership). This module adds the READ the home shows (XH-1): the unbroken
 * posting streak (the G-4 north-star metric) and whether the trailing window
 * actually carries an impact/gratitude post. All DETERMINISTIC counts (LRN-20) —
 * never an LLM classification of realized prose.
 *
 * @implements STWS-1 v1  (the STW-1 rhythm — evidenced on the GENS-1 quota + this streak read)
 *
 * DEFERRED: STWS-2 milestone recaps (a campaign end-date / founder tap → a
 * thank-you+impact package via GENS + PRO-1) and PROS-3 ask-hygiene (P1) — the
 * quota alone carries the P0 STW-1 guarantee.
 */
import type { OrgId } from "@shared";
import { channelVariant, contentItem } from "@shared/db/schema.js";
import { and, eq, isNotNull } from "drizzle-orm";
import type { Database } from "../db/client.js";

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
/** The STW-1 stewardship window: ≥1 impact/gratitude per trailing 28 days (GENS-1). */
export const RHYTHM_WINDOW_DAYS = 28;

/**
 * The count of CONSECUTIVE trailing 7-day weeks (ending at `now`) that each carry
 * ≥1 post — the G-4 "unbroken 4-week streak" read. Pure. Week 0 is the 7 days up
 * to `now`; the streak stops at the first empty week.
 */
export function computeWeekStreak(postDates: readonly Date[], now: Date): number {
  const times = postDates.map((d) => d.getTime());
  let streak = 0;
  for (let week = 0; ; week++) {
    const end = now.getTime() - week * WEEK_MS;
    const start = end - WEEK_MS;
    if (times.some((t) => t > start && t <= end)) streak++;
    else break;
  }
  return streak;
}

/** Whether an impact/gratitude post falls within the trailing STW-1 window. Pure. */
export function hasImpactRhythm(
  impactDates: readonly Date[],
  now: Date,
  windowDays: number = RHYTHM_WINDOW_DAYS,
): boolean {
  const cutoff = now.getTime() - windowDays * DAY_MS;
  return impactDates.some((d) => d.getTime() >= cutoff);
}

/** The stewardship status the home reads (XH-1). */
export interface StewardshipStatus {
  /** Consecutive trailing weeks with ≥1 published post (G-4). */
  weekStreak: number;
  /** True when the trailing 28-day window carries an impact/gratitude post (STW-1). */
  hasRecentImpact: boolean;
  /** The most recent impact/gratitude post date, or null. */
  lastImpactAt: Date | null;
  windowDays: number;
}

export interface Stewardship {
  status(orgId: OrgId, now?: Date): Promise<StewardshipStatus>;
}

export function createStewardship(deps: { db: Database }): Stewardship {
  const { db } = deps;
  return {
    async status(orgId, now = new Date()) {
      // Posting streak: real published deliveries (DM-5 published variants).
      const published = await db
        .select({ at: channelVariant.publishedAt })
        .from(channelVariant)
        .where(and(eq(channelVariant.orgId, orgId), isNotNull(channelVariant.publishedAt)));
      const postDates = published.flatMap((r) => (r.at ? [r.at] : []));

      // Impact rhythm: impact/gratitude-designated items, dated by their calendar
      // slot (scheduledFor) or, failing that, when they were created.
      const impactItems = await db
        .select({ scheduledFor: contentItem.scheduledFor, createdAt: contentItem.createdAt })
        .from(contentItem)
        .where(and(eq(contentItem.orgId, orgId), eq(contentItem.designation, "impact_gratitude")));
      const impactDates = impactItems.map((r) => r.scheduledFor ?? r.createdAt);
      const lastImpactMs = impactDates.length
        ? Math.max(...impactDates.map((d) => d.getTime()))
        : null;

      return {
        weekStreak: computeWeekStreak(postDates, now),
        hasRecentImpact: hasImpactRhythm(impactDates, now),
        lastImpactAt: lastImpactMs != null ? new Date(lastImpactMs) : null,
        windowDays: RHYTHM_WINDOW_DAYS,
      };
    },
  };
}
