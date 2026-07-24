/**
 * Autonomy router — the org-scoped API surface over @backend/autonomy (ARC-20).
 * Org-confined via `orgProcedure` (ACC-3). P1b: TL0 + the kill switch. The kill
 * switch is the always-on revocability reachable from the chrome (UXS-6).
 *
 * @implements AUTS-1 v1  (level / setLevel)
 * @implements AUTS-3 v1  (killSwitch / pauseChannel / resume / status)
 */
import { OrgId, TrustLevelValue, VetoModel } from "@shared";
import { z } from "zod";
import { createAutonomy } from "../autonomy/index.js";
import type { Database } from "../db/client.js";
import { orgProcedure, router } from "../trpc.js";

function autonomyFor(ctx: { db: Database }) {
  return createAutonomy({ db: ctx.db });
}

export const autonomyRouter = router({
  /** AUT-1: the Trust Level for a content category (default TL0). */
  level: orgProcedure
    .input(z.object({ category: z.string().min(1) }))
    .query(({ ctx, input }) =>
      autonomyFor(ctx).trustLevelFor(OrgId.parse(ctx.orgId), input.category),
    ),

  /** AUT-1: set a category's Trust Level (+ optional veto model). */
  setLevel: orgProcedure
    .input(
      z.object({
        category: z.string().min(1),
        level: TrustLevelValue,
        vetoModel: VetoModel.optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      autonomyFor(ctx).setTrustLevel(
        OrgId.parse(ctx.orgId),
        input.category,
        input.level,
        input.vetoModel,
      ),
    ),

  /** AUT-3: the global kill switch — halt ALL publishing instantly. */
  killSwitch: orgProcedure.mutation(({ ctx }) =>
    autonomyFor(ctx).killSwitch(OrgId.parse(ctx.orgId)),
  ),

  /** AUT-3: pause one channel. */
  pauseChannel: orgProcedure
    .input(z.object({ platform: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      autonomyFor(ctx).pauseChannel(OrgId.parse(ctx.orgId), input.platform),
    ),

  /** AUT-3: resume a scope (default global) — instantly reversible. */
  resume: orgProcedure
    .input(z.object({ scope: z.string().min(1).optional() }))
    .mutation(({ ctx, input }) => autonomyFor(ctx).resume(OrgId.parse(ctx.orgId), input.scope)),

  /** AUT-3: is publishing paused for the org (or a given channel)? */
  status: orgProcedure
    .input(z.object({ platform: z.string().min(1).optional() }))
    .query(({ ctx, input }) => autonomyFor(ctx).isPaused(OrgId.parse(ctx.orgId), input.platform)),
});
