/**
 * Stewardship router — the org-scoped read over @backend/stewardship (STWS-1).
 * Org-confined via `orgProcedure` (ACC-3). Surfaces the streak + impact-rhythm
 * status the weekly-visit home shows (XH-1, the G-4 north-star metric). The STW-1
 * rhythm itself is enforced upstream by the GENS-1 planner quota — this is a read.
 *
 * @implements STWS-1 v1  (status read)
 */
import { OrgId } from "@shared";
import type { Database } from "../db/client.js";
import { createStewardship } from "../stewardship/index.js";
import { orgProcedure, router } from "../trpc.js";

function stewardshipFor(ctx: { db: Database }) {
  return createStewardship({ db: ctx.db });
}

export const stewardshipRouter = router({
  /** STWS-1: the posting streak + impact-rhythm status the home reads (XH-1). */
  status: orgProcedure.query(({ ctx }) => stewardshipFor(ctx).status(OrgId.parse(ctx.orgId))),
});
