/**
 * The Content Engine end-to-end loop (ARC-15) — the wiring that turns the four
 * separately-built pieces into a runnable pipeline:
 *
 *   agenda (TOPS-1) → plan (GENS-1) → generate (GENS-7) → VAL-gate → persist (DM-5)
 *
 * `planAndDraftCalendar` reads the editorial agenda, plans the rolling calendar
 * (deterministic mix quotas seeded from the org's dated history), then generates +
 * VAL-gates + persists each slot as a dated draft ContentItem. This is the "moves
 * first, never a blank page" core (VIS-2, VAL-6): one call yields a month of
 * grounded, guardrailed, scheduled drafts.
 *
 * @implements GENS-1 v1  (the plan→generate→persist calendar orchestration)
 */
import type { ContentItem, OrgId } from "@shared";
import type { Database } from "../db/client.js";
import type { Memory } from "../memory/index.js";
import type { ContentSlot, LlmPort } from "../ports/llm.js";
import type { Topics } from "../topics/index.js";
import { draftForSlot } from "./generate.js";
import { planCalendar } from "./planner.js";
import { persistDraft, recentDesignations } from "./store.js";

const WINDOW_DAYS = 28;
const DAY_MS = 86_400_000;

export interface ContentEngine {
  /**
   * Plan + draft the rolling calendar for an org (GENS-1): plan the slots, then
   * generate + VAL-gate + persist each as a dated draft ContentItem. Returns the
   * persisted items (empty if the agenda is empty — the caller keeps it auto-drafted
   * via TOPS-1). `startDate`/`slotCount` are injectable for tests.
   */
  planAndDraftCalendar(
    orgId: OrgId,
    opts?: { startDate?: Date; slotCount?: number },
  ): Promise<ContentItem[]>;
}

/** Bind the content engine to its dependencies (ADR-0003 composition root). */
export function createContentEngine(deps: {
  db: Database;
  memory: Memory;
  topics: Topics;
  port: LlmPort;
}): ContentEngine {
  return {
    async planAndDraftCalendar(orgId, opts = {}) {
      const startDate = opts.startDate ?? new Date();
      const agenda = (await deps.topics.getAgenda(orgId)).map((t) => ({
        id: t.id,
        description: t.description,
      }));
      const history = await recentDesignations(
        deps.db,
        orgId,
        new Date(startDate.getTime() - WINDOW_DAYS * DAY_MS),
      );
      const slots = await planCalendar(deps.port, {
        orgId,
        agenda,
        history,
        startDate,
        ...(opts.slotCount !== undefined ? { slotCount: opts.slotCount } : {}),
      });

      const items: ContentItem[] = [];
      for (const slot of slots) {
        const contentSlot: ContentSlot = {
          type: slot.type,
          subject: slot.subject,
          designation: slot.designation,
        };
        const result = await draftForSlot(deps.memory, deps.port, orgId, contentSlot);
        items.push(
          await persistDraft(deps.db, {
            orgId,
            slot: contentSlot,
            result,
            scheduledFor: slot.scheduledFor,
          }),
        );
      }
      return items;
    },
  };
}
