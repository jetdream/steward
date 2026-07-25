/**
 * Content router — the generation + per-channel adaptation surface over
 * @backend/content (ARC-15). Org-confined via `orgProcedure` (ACC-3). Every port
 * carries `{ db }` so each ModelCall is cost-logged (PIPE-5).
 *
 * @implements GENS-1 v1  (planAndDraft — the rolling plan → generate → persist loop)
 * @implements GENS-2 v1  (adapt — per-channel variants)
 * @implements GENS-5 v1  (variants — the fit verdicts the Ready spine shows)
 */
import { OrgId } from "@shared";
import { z } from "zod";
import { createLlmPort } from "../adapters/llm/index.js";
import { createContentEngine } from "../content/engine.js";
import { adaptContentItem, listVariants } from "../content/variants.js";
import { createTopics } from "../topics/index.js";
import { orgProcedure, router } from "../trpc.js";

const itemInput = z.object({ contentItemId: z.string().min(1) });

export const contentRouter = router({
  /**
   * GENS-1: plan the rolling calendar and draft each slot into a dated
   * ContentItem — the "moves first, never a blank page" entry point the founder
   * surface calls to fill the Ready spine. Returns the persisted drafts (empty
   * when the agenda is empty; the caller keeps it auto-drafted via TOPS-1).
   */
  planAndDraft: orgProcedure
    .input(
      z
        .object({ slotCount: z.number().int().positive().max(30).optional() })
        .optional()
        .default({}),
    )
    .mutation(({ ctx, input }) => {
      const port = createLlmPort({ db: ctx.db });
      const engine = createContentEngine({
        db: ctx.db,
        memory: ctx.memory,
        topics: createTopics({ db: ctx.db, memory: ctx.memory, port }),
        port,
      });
      // Drop the absent optional so the shape satisfies exactOptionalPropertyTypes.
      return engine.planAndDraftCalendar(
        OrgId.parse(ctx.orgId),
        input.slotCount ? { slotCount: input.slotCount } : {},
      );
    }),

  /** GENS-2/5: adapt an approved master to each channel + fit-gate → persisted variants. */
  adapt: orgProcedure
    .input(itemInput)
    .mutation(({ ctx, input }) =>
      adaptContentItem(
        { db: ctx.db, port: createLlmPort({ db: ctx.db }) },
        OrgId.parse(ctx.orgId),
        input.contentItemId,
      ),
    ),

  /** GENS-5: the per-channel variants + fit verdicts for a ContentItem. */
  variants: orgProcedure
    .input(itemInput)
    .query(({ ctx, input }) => listVariants(ctx.db, OrgId.parse(ctx.orgId), input.contentItemId)),
});
