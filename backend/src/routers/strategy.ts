/**
 * Strategy router — the org-scoped API surface over @backend/strategy (ARC-14).
 * Org-confined via `orgProcedure` (ACC-3). Reads the five-section contract (c
 * derived live, DEC-22), auto-drafts from Memory, and applies founder edits with
 * semantic routing (STRS-2). The port carries `{ db }` on auto-draft so the
 * `draft-strategy` ModelCall is cost-logged (PIPE-5).
 *
 * @implements STRS-1 v1  (get — the five-section view)
 * @implements STRS-2 v1  (autoDraft / edit)
 */
import { OrgId } from "@shared";
import { z } from "zod";
import { createLlmPort } from "../adapters/llm/index.js";
import { createStrategy } from "../strategy/index.js";
import { orgProcedure, router } from "../trpc.js";

const editInput = z.object({
  section: z.enum(["a", "b", "c", "d", "e"]),
  text: z.string().min(1),
  channel: z.string().min(1).optional(),
});

export const strategyRouter = router({
  /** STRS-1: the five-section Strategy view (c reflects the live overlay). */
  get: orgProcedure.query(({ ctx }) =>
    createStrategy({ db: ctx.db, memory: ctx.memory, port: createLlmPort() }).getStrategy(
      OrgId.parse(ctx.orgId),
    ),
  ),

  /** STRS-2: auto-draft sections (a/b/d/e) from Memory → a new StrategyDoc version. */
  autoDraft: orgProcedure.mutation(({ ctx }) =>
    createStrategy({
      db: ctx.db,
      memory: ctx.memory,
      port: createLlmPort({ db: ctx.db }),
    }).autoDraft(OrgId.parse(ctx.orgId)),
  ),

  /** STRS-2: a founder edit — soft (a/b/d/e) → a version; an org rule / prohibition → Memory. */
  edit: orgProcedure
    .input(editInput)
    .mutation(({ ctx, input }) =>
      createStrategy({ db: ctx.db, memory: ctx.memory, port: createLlmPort() }).editSection(
        OrgId.parse(ctx.orgId),
        input.section,
        input.text,
        input.channel,
      ),
    ),
});
