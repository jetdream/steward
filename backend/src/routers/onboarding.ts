/**
 * Onboarding router — the org-scoped API surface over @backend/onboarding
 * (ARC-12). Org-confined via `orgProcedure` (ACC-3). The brain-spine slice:
 * the gap model, the "here's what I know" review + correction, and the
 * minimum-viable-context readiness predicate.
 *
 * @implements ONBS-3 v1  (gaps)
 * @implements ONBS-5 v1  (profile / correct)
 * @implements ONBS-6 v1  (ready)
 */
import { OrgId } from "@shared";
import { z } from "zod";
import {
  applyCorrection,
  computeGaps,
  getProfileForReview,
  readyForFirstDrafts,
} from "../onboarding/index.js";
import { orgProcedure, router } from "../trpc.js";

const correctInput = z.object({ text: z.string().min(1) });

export const onboardingRouter = router({
  /** ONBS-3: the gap model driving the interview (derived over Memory). */
  gaps: orgProcedure.query(({ ctx }) => computeGaps(ctx.db, OrgId.parse(ctx.orgId))),

  /** ONBS-5: the assembled "here's what I know" profile for review. */
  profile: orgProcedure.query(({ ctx }) => getProfileForReview(ctx.db, OrgId.parse(ctx.orgId))),

  /** ONBS-5: a review correction → a permanent rule via the single write path. */
  correct: orgProcedure
    .input(correctInput)
    .mutation(({ ctx, input }) => applyCorrection(ctx.memory, OrgId.parse(ctx.orgId), input.text)),

  /** ONBS-6: the deterministic minimum-viable-context predicate. */
  ready: orgProcedure.query(({ ctx }) => readyForFirstDrafts(ctx.db, OrgId.parse(ctx.orgId))),
});
