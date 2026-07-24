/**
 * Content router — the per-channel adaptation + fit surface over @backend/content
 * (ARC-15). Org-confined via `orgProcedure` (ACC-3). The adapt port carries `{ db }`
 * so each `adapt-variant` ModelCall is cost-logged (PIPE-5).
 *
 * @implements GENS-2 v1  (adapt — per-channel variants)
 * @implements GENS-5 v1  (variants — the fit verdicts the Ready spine shows)
 */
import { OrgId } from "@shared";
import { z } from "zod";
import { createLlmPort } from "../adapters/llm/index.js";
import { adaptContentItem, listVariants } from "../content/variants.js";
import { orgProcedure, router } from "../trpc.js";

const itemInput = z.object({ contentItemId: z.string().min(1) });

export const contentRouter = router({
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
