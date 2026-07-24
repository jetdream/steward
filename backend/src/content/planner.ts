/**
 * The `plan-calendar` planner (GENS-1) — the rolling 4-week plan. Pairs a taxonomy
 * TYPE with an agenda SUBJECT (the grounded LLM step, run through the ARC-27/PIPE-4
 * runtime) and assigns the overlay DESIGNATIONS deterministically at plan time —
 * the LRN-20 split: the mix quotas are COUNTED RESERVATIONS over plan-time slot
 * designations, never a model's post-hoc classification.
 *
 * G4 slice: INTERNAL taxonomy types only — external slots (relatedEvent/News/
 * Research) draw on the Radar (EXT-1) + saved pool (EXT-5), deferred until EXT
 * lands. The planner returns a validated PLAN; wiring each slot through
 * generateDraft (G1) + persistDraft (G1b) into dated ContentItems is the follow-on.
 *
 * @implements GENS-1 v1  (the pairing + the deterministic mix-quota designations)
 */
import type { ContentType, SlotDesignation } from "@shared";
import { runSkill } from "../harness/runtime.js";
import type { LlmPort, SlotPairing } from "../ports/llm.js";

/** The internal taxonomy types the planner may schedule now (external needs the Radar). */
export const INTERNAL_TYPES: readonly ContentType[] = [
  "mission",
  "founderStory",
  "caseStudy",
  "ownEvent",
  "people",
];

const DAY_MS = 86_400_000;
/** The stewardship rhythm window (STW-1): ≥1 impact/gratitude per trailing 28 days. */
const DEFAULT_WINDOW_DAYS = 28;
/** Fundraising asks ≤25% of designated slots (a scope boundary, GEN-1). */
const ASK_CAP_RATIO = 0.25;

/** One planned calendar slot — a taxonomy TYPE × an agenda SUBJECT + its overlay + date. */
export interface PlannedSlot {
  type: ContentType;
  topicId: string;
  /** The agenda topic's description (WHAT to talk about). */
  subject: string;
  designation: SlotDesignation;
  scheduledFor: Date;
}

/** A prior designated slot (from content_item history) — seeds the trailing-window quota. */
export interface HistorySlot {
  designation: SlotDesignation;
  date: Date;
}

/** Everything `planCalendar` needs; agenda + history injected (from TOPS / content_item). */
export interface PlanCalendarInput {
  orgId: string;
  agenda: { id: string; description: string }[];
  /** Prior designations (content_item) for the trailing-window impact-rhythm seed. */
  history: HistorySlot[];
  /** Plan-block start date (injectable — deterministic in tests). */
  startDate: Date;
  /** Slots to plan across the window (default ~12 over 4 weeks ≈ 3/week). */
  slotCount?: number;
  windowDays?: number;
  runId?: string;
}

/**
 * DETERMINISTIC agenda/taxonomy guard: keep only pairings whose topicId is in the
 * agenda and whose type is an allowed internal taxonomy type. A pairing citing a
 * fabricated/retired topic or an external type (deferred) is dropped. Pure.
 */
export function applyPairingGuard(pairings: SlotPairing[], agendaIds: Set<string>): SlotPairing[] {
  const internal = new Set(INTERNAL_TYPES);
  return pairings.filter((p) => agendaIds.has(p.topicId) && internal.has(p.type));
}

/** Spread `n` slots evenly across `windowDays` from `startDate`, ascending. */
function scheduleDates(n: number, startDate: Date, windowDays: number): Date[] {
  if (n <= 1) return n === 1 ? [startDate] : [];
  return Array.from(
    { length: n },
    (_u, i) => new Date(startDate.getTime() + Math.round((i * windowDays) / n) * DAY_MS),
  );
}

/**
 * Assign dates + the deterministic mix-quota DESIGNATIONS to guarded pairings
 * (GENS-1). Impact/gratitude is reserved so NO trailing `windowDays` window lacks
 * one — seeded from history so an ~8-week gap across two plan regenerations cannot
 * hide (STW-1). Fundraising asks stay `none` in the base plan (campaign asks are
 * PRO-2, injected later) — the ≤25% cap is then trivially held and asserted. Pure.
 */
export function designateAndSchedule(
  pairings: SlotPairing[],
  agenda: { id: string; description: string }[],
  history: HistorySlot[],
  startDate: Date,
  windowDays: number = DEFAULT_WINDOW_DAYS,
): PlannedSlot[] {
  const subjectById = new Map(agenda.map((t) => [t.id, t.description]));
  const dates = scheduleDates(pairings.length, startDate, windowDays);

  // Seed the last impact date from history; if none, backdate so the plan's first
  // eligible slot forces an impact (guarantees ≥1 impact when history is empty).
  const impactDates = history
    .filter((h) => h.designation === "impact_gratitude")
    .map((h) => h.date.getTime());
  let lastImpact = impactDates.length
    ? Math.max(...impactDates)
    : startDate.getTime() - (windowDays + 1) * DAY_MS;

  return pairings.map((p, i) => {
    const scheduledFor = dates[i] ?? startDate;
    let designation: SlotDesignation = "none";
    // A full window has elapsed since the last impact → reserve this slot for one.
    if (scheduledFor.getTime() - lastImpact > windowDays * DAY_MS) {
      designation = "impact_gratitude";
      lastImpact = scheduledFor.getTime();
    }
    return {
      type: p.type,
      topicId: p.topicId,
      subject: subjectById.get(p.topicId) ?? "",
      designation,
      scheduledFor,
    };
  });
}

/** The designated-ask ratio over a plan (the ≤25% GEN-1 cap check). */
export function askRatio(slots: PlannedSlot[]): number {
  if (slots.length === 0) return 0;
  return slots.filter((s) => s.designation === "fundraising_ask").length / slots.length;
}

export { ASK_CAP_RATIO };

/**
 * Plan the rolling calendar (GENS-1): pair TYPE×SUBJECT (grounded LLM step), guard
 * to the agenda + internal taxonomy, then assign deterministic dates + mix-quota
 * designations. An empty agenda yields an empty plan — the caller keeps the agenda
 * auto-drafted (TOPS-1, VAL-6) so this is never a blank page in practice.
 */
export async function planCalendar(
  port: LlmPort,
  input: PlanCalendarInput,
): Promise<PlannedSlot[]> {
  if (input.agenda.length === 0) return [];
  const slotCount = input.slotCount ?? 12;
  const windowDays = input.windowDays ?? DEFAULT_WINDOW_DAYS;

  const pairings = await runSkill(
    {
      orgId: input.orgId,
      skillId: "plan-calendar",
      ...(input.runId ? { runId: input.runId } : {}),
    },
    () => port.planSlots({ agenda: input.agenda, count: slotCount }),
  );

  const agendaIds = new Set(input.agenda.map((t) => t.id));
  const guarded = applyPairingGuard(pairings, agendaIds);
  return designateAndSchedule(guarded, input.agenda, input.history, input.startDate, windowDays);
}
