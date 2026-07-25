/**
 * Topics router — the editorial-agenda surface over @backend/topics (ARC-26).
 * Org-confined via `orgProcedure` (ACC-3). The agenda is WHAT the org talks about
 * (DEC-23): the single source the planner (GENS-1), Strategy section (a), and the
 * Radar read. The port carries `{ db }` so the `identify-topics` ModelCall is
 * cost-logged (PIPE-5).
 *
 * @implements TOPS-1 v1  (identify — grounded topic identification)
 * @implements TOPS-4 v1  (agenda — the active-topic read half)
 */
import { OrgId } from "@shared";
import { createLlmPort } from "../adapters/llm/index.js";
import type { Database } from "../db/client.js";
import type { Memory } from "../memory/index.js";
import { createTopics } from "../topics/index.js";
import { orgProcedure, router } from "../trpc.js";

function topicsFor(ctx: { db: Database; memory: Memory }) {
  return createTopics({ db: ctx.db, memory: ctx.memory, port: createLlmPort({ db: ctx.db }) });
}

export const topicsRouter = router({
  /** TOPS-4: the editorial agenda — the org's active topic set (pull-only read). */
  agenda: orgProcedure.query(({ ctx }) => topicsFor(ctx).getAgenda(OrgId.parse(ctx.orgId))),

  /** TOPS-1: run grounded identification, guard the evidence, persist the new topics. */
  identify: orgProcedure.mutation(({ ctx }) => topicsFor(ctx).identify(OrgId.parse(ctx.orgId))),
});
