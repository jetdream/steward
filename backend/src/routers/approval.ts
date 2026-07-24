/**
 * Approval router — the org-scoped API over @backend/approval (APRS-1/3/5). The
 * single most-used surface (XH-5/XH-13): the Ready spine + the two verbs. Org-
 * confined via `orgProcedure` (ACC-3). Dispositions write Memory via the MEMS-1
 * correction path; the composer routes through the content engine (no bypass).
 *
 * @implements APRS-1 v3  (readyStack / approve / batchApprove / editDraft / skip / redirect)
 * @implements APRS-3 v1  (proposeRule)
 * @implements APRS-5 v1  (compose)
 */
import { ChannelPlatform, OrgId } from "@shared";
import { z } from "zod";
import { createLlmPort } from "../adapters/llm/index.js";
import { type ComposeInput, createApproval } from "../approval/index.js";
import type { Database } from "../db/client.js";
import type { Memory } from "../memory/index.js";
import { orgProcedure, router } from "../trpc.js";

function approvalFor(ctx: { db: Database; memory: Memory }) {
  return createApproval({ db: ctx.db, memory: ctx.memory, port: createLlmPort({ db: ctx.db }) });
}

export const approvalRouter = router({
  /** APRS-1: the ordered Ready spine — pending cards with per-variant fit verdicts (XH-5). */
  readyStack: orgProcedure.query(({ ctx }) => approvalFor(ctx).readyStack(OrgId.parse(ctx.orgId))),

  /** APRS-1: one-tap Approve (GENS-4-gated — awaiting-picture cannot approve). */
  approve: orgProcedure
    .input(z.object({ itemId: z.string().min(1) }))
    .mutation(({ ctx, input }) => approvalFor(ctx).approve(OrgId.parse(ctx.orgId), input.itemId)),

  /** APRS-1: "approve all ready" — deterministically excludes held/sensitive/awaiting-picture. */
  batchApprove: orgProcedure.mutation(({ ctx }) =>
    approvalFor(ctx).batchApprove(OrgId.parse(ctx.orgId)),
  ),

  /** APRS-1/APRS-3: inline edit (master or a variant) — diffed for the learning loop. */
  editDraft: orgProcedure
    .input(
      z.object({
        itemId: z.string().min(1),
        text: z.string().min(1),
        variantId: z.string().min(1).optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      approvalFor(ctx).editDraft(OrgId.parse(ctx.orgId), input.itemId, input.text, input.variantId),
    ),

  /** APRS-1: skip → skipped, with an optional after-the-fact reason that writes Memory (CHTS-5). */
  skip: orgProcedure
    .input(z.object({ itemId: z.string().min(1), reason: z.string().optional() }))
    .mutation(({ ctx, input }) =>
      approvalFor(ctx).skip(OrgId.parse(ctx.orgId), input.itemId, input.reason),
    ),

  /** APRS-1: free-text redirect (CHT-2 confirm-back) → a Memory styleRule/taboo. */
  redirect: orgProcedure
    .input(z.object({ itemId: z.string().min(1), text: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      approvalFor(ctx).redirect(OrgId.parse(ctx.orgId), input.itemId, input.text),
    ),

  /** APRS-3: accept a rule-proposal → a founder-confirmed Memory styleRule/taboo. */
  proposeRule: orgProcedure
    .input(z.object({ pattern: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      approvalFor(ctx).proposeRule(OrgId.parse(ctx.orgId), input.pattern),
    ),

  /** APRS-5: the founder composer — same VAL → persist → adapt chain (no bypass). */
  compose: orgProcedure
    .input(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        reasonLine: z.string().min(1).optional(),
        mediaAssetId: z.string().min(1).optional(),
        channels: z.array(ChannelPlatform).optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      // Drop absent optionals so the shape satisfies exactOptionalPropertyTypes.
      const composeInput: ComposeInput = {
        title: input.title,
        body: input.body,
        ...(input.reasonLine ? { reasonLine: input.reasonLine } : {}),
        ...(input.mediaAssetId ? { mediaAssetId: input.mediaAssetId } : {}),
        ...(input.channels ? { channels: input.channels } : {}),
      };
      return approvalFor(ctx).compose(OrgId.parse(ctx.orgId), composeInput);
    }),
});
