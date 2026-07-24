/**
 * Radar router — the org-scoped API surface over @backend/radar (ARC-16).
 * Org-confined via `orgProcedure` (ACC-3). Runs agenda-driven discovery, reads the
 * pull-only Discoveries feed + saved pool, and records a read-first triage. The
 * port carries `{ db }` so the `radar-discover` ModelCall is cost-logged (PIPE-5).
 *
 * @implements EXTS-1 v1  (discover)
 * @implements EXTS-5 v1  (discoveries / saved / triage)
 */
import { ExternalItemDisposition, OrgId } from "@shared";
import { z } from "zod";
import { createLlmPort } from "../adapters/llm/index.js";
import type { Database } from "../db/client.js";
import type { Memory } from "../memory/index.js";
import { createRadar } from "../radar/index.js";
import { getAgenda } from "../topics/store.js";
import { orgProcedure, router } from "../trpc.js";

/** Build a Radar bound to the request's db + memory, with the agenda from TOPS. */
function radarFor(ctx: { db: Database; memory: Memory }) {
  return createRadar({
    db: ctx.db,
    memory: ctx.memory,
    port: createLlmPort({ db: ctx.db }),
    agendaFor: (orgId) =>
      getAgenda(ctx.db, orgId).then((ts) =>
        ts.map((t) => ({ id: t.id, description: t.description })),
      ),
  });
}

export const radarRouter = router({
  /** EXTS-1: run agenda-driven grounded discovery → R-4-guarded ExternalItems. */
  discover: orgProcedure.mutation(({ ctx }) => radarFor(ctx).discoverRun(OrgId.parse(ctx.orgId))),

  /** EXTS-5: the pull-only Discoveries feed (never badged/counted). */
  discoveries: orgProcedure.query(({ ctx }) => radarFor(ctx).discoveries(OrgId.parse(ctx.orgId))),

  /** GEN-1: the saved pool the planner draws from. */
  saved: orgProcedure.query(({ ctx }) => radarFor(ctx).savedPool(OrgId.parse(ctx.orgId))),

  /** EXTS-5: a read-first triage disposition — writes Memory to tune future discovery. */
  triage: orgProcedure
    .input(z.object({ id: z.string().min(1), disposition: ExternalItemDisposition }))
    .mutation(({ ctx, input }) =>
      radarFor(ctx).triage(OrgId.parse(ctx.orgId), input.id, input.disposition),
    ),
});
