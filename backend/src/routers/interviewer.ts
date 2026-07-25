/**
 * Interviewer router — the org-scoped API surface over @backend/interviewer
 * (ARC-13). Org-confined via `orgProcedure` (ACC-3). The port carries `{ db }` so
 * the `interview-questions` ModelCall is cost-logged (PIPE-5).
 *
 * @implements INTS-1 v1  (nextQuestions)
 * @implements INTS-2 v1  (startSession / answer / transcript)
 * @implements INTS-4 v1  (openQuestions)
 */
import { OrgId } from "@shared";
import { z } from "zod";
import { createLlmPort } from "../adapters/llm/index.js";
import type { Database } from "../db/client.js";
import { createInterviewer } from "../interviewer/index.js";
import type { Memory } from "../memory/index.js";
import { orgProcedure, router } from "../trpc.js";

function interviewerFor(ctx: { db: Database; memory: Memory }) {
  return createInterviewer({ db: ctx.db, memory: ctx.memory, port: createLlmPort({ db: ctx.db }) });
}

const sessionInput = z.object({ sessionId: z.string().min(1) });

export const interviewerRouter = router({
  /** INTS-2: open a resumable conversation session. */
  startSession: orgProcedure.mutation(({ ctx }) =>
    interviewerFor(ctx).startSession(OrgId.parse(ctx.orgId)),
  ),

  /**
   * INTS-2: the session to RESUME, or null. Without this, "resumable forever"
   * was unreachable from a client — a reload could only open a NEW session and
   * strand the transcript it meant to continue.
   */
  session: orgProcedure.query(({ ctx }) =>
    interviewerFor(ctx).latestSession(OrgId.parse(ctx.orgId)),
  ),

  /** INTS-1: a few gap-driven, open questions (recorded on the session). */
  nextQuestions: orgProcedure
    .input(sessionInput)
    .mutation(({ ctx, input }) =>
      interviewerFor(ctx).nextQuestions(OrgId.parse(ctx.orgId), input.sessionId),
    ),

  /** INTS-2: record a founder answer → transcript + Memory (MEMS-1). */
  answer: orgProcedure
    .input(z.object({ sessionId: z.string().min(1), answer: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      interviewerFor(ctx).recordAnswer(OrgId.parse(ctx.orgId), input.sessionId, input.answer),
    ),

  /** INTS-4: the always-available open-questions list (filtered gap-model view). */
  openQuestions: orgProcedure.query(({ ctx }) =>
    interviewerFor(ctx).openQuestions(OrgId.parse(ctx.orgId)),
  ),

  /** INTS-2: the resumable session transcript. */
  transcript: orgProcedure
    .input(sessionInput)
    .query(({ ctx, input }) =>
      interviewerFor(ctx).transcript(OrgId.parse(ctx.orgId), input.sessionId),
    ),
});
