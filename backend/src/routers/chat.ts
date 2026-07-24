/**
 * Chat router — the org-scoped API surface over @backend/chat (ARC-13).
 * Org-confined via `orgProcedure` (ACC-3). The answer port carries `{ db }` so the
 * `chat-answer` ModelCall is cost-logged (PIPE-5). Redirect binding is two-step:
 * `previewRedirect` (confirm-back, no write) then `applyRedirect` (CHTS-2).
 *
 * @implements CHTS-1 v1  (answer)
 * @implements CHTS-2 v1  (previewRedirect / applyRedirect)
 * @implements CHTS-4 v1 / CHTS-5 v1  (openings — each with a reason)
 */
import { OrgId } from "@shared";
import { z } from "zod";
import { createLlmPort } from "../adapters/llm/index.js";
import { createChat } from "../chat/index.js";
import type { Database } from "../db/client.js";
import type { Memory } from "../memory/index.js";
import { orgProcedure, router } from "../trpc.js";

function chatFor(ctx: { db: Database; memory: Memory }) {
  return createChat({ db: ctx.db, memory: ctx.memory, port: createLlmPort({ db: ctx.db }) });
}

const textInput = z.object({ text: z.string().min(1) });

export const chatRouter = router({
  /** CHTS-5: open a conversation session. */
  startSession: orgProcedure.mutation(({ ctx }) =>
    chatFor(ctx).startSession(OrgId.parse(ctx.orgId)),
  ),

  /** CHTS-1: a grounded, GR-2-gated answer (recorded on the session). */
  answer: orgProcedure
    .input(z.object({ sessionId: z.string().min(1), question: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      chatFor(ctx).answer(OrgId.parse(ctx.orgId), input.sessionId, input.question),
    ),

  /** CHTS-5: never-blank leading openings, each with a reason (CHTS-4). */
  openings: orgProcedure.query(({ ctx }) => chatFor(ctx).suggestOpenings(OrgId.parse(ctx.orgId))),

  /** CHTS-2: the confirm-back interpretation of a redirect — NO write. */
  previewRedirect: orgProcedure
    .input(textInput)
    .query(({ ctx, input }) => chatFor(ctx).previewRedirect(input.text)),

  /** CHTS-2: bind a CONFIRMED redirect to Memory (styleRule/taboo). */
  applyRedirect: orgProcedure
    .input(textInput)
    .mutation(({ ctx, input }) => chatFor(ctx).applyRedirect(OrgId.parse(ctx.orgId), input.text)),
});
