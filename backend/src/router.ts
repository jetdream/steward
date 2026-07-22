/**
 * The application tRPC router — the API surface the client calls. For the walking
 * skeleton it exercises every layer of the stack end to end: a dev login/session
 * (auth), a Drizzle write+read against Postgres (org), a raw pgvector round-trip
 * (system), and a WebSocket server push (ping). Real capabilities replace/extend
 * these routers as their specs are built. `AppRouter` is the type the client imports.
 */
import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { toOrg } from "./db/map.js";
import { orgs } from "./db/schema.js";
import { protectedProcedure, publicProcedure, router } from "./trpc.js";

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "org";

export const appRouter = router({
  /** Dev login/session seam — BetterAuth replaces this in the ACCS vertical (SEC-7). */
  auth: router({
    devLogin: publicProcedure.input(z.object({ email: z.email() })).mutation(({ ctx, input }) => {
      const session = { userId: `dev:${input.email}`, email: input.email };
      ctx.setSession?.(session);
      return session;
    }),
    me: publicProcedure.query(({ ctx }) => ctx.session),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.setSession?.(null);
      return { ok: true };
    }),
  }),

  /** Drizzle write+read round-trip against Postgres (DM-1 orgs). */
  org: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const rows = await ctx.db.select().from(orgs);
      return rows.map(toOrg);
    }),
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const [row] = await ctx.db
          .insert(orgs)
          .values({
            id: `org_${randomUUID()}`,
            name: input.name,
            newsConfig: { slug: slugify(input.name), mode: "app-path" },
          })
          .returning();
        if (!row) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "insert failed" });
        return toOrg(row);
      }),
  }),

  /** pgvector round-trip proof: a vector distance computed inside Postgres. */
  system: router({
    vectorCheck: publicProcedure.query(async ({ ctx }) => {
      const rows = await ctx.db.execute<{ distance: number }>(
        sql`SELECT ('[1,0,0]'::vector <-> '[0,1,0]'::vector) AS distance`,
      );
      return { pgvectorDistance: Number(rows[0]?.distance ?? -1) };
    }),
  }),

  /** WebSocket server push: a tick every second until the client unsubscribes. */
  ping: router({
    stream: publicProcedure.subscription(async function* (opts) {
      let seq = 0;
      while (!opts.signal?.aborted) {
        yield { seq: ++seq, at: new Date().toISOString() };
        await sleep(1000);
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
