/**
 * System router — infra health probes. `vectorCheck` proves the Postgres +
 * pgvector round-trip (a vector distance computed in-DB).
 */
import { sql } from "drizzle-orm";
import { publicProcedure, router } from "../trpc.js";

export const systemRouter = router({
  vectorCheck: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.execute<{ distance: number }>(
      sql`SELECT ('[1,0,0]'::vector <-> '[0,1,0]'::vector) AS distance`,
    );
    return { pgvectorDistance: Number(rows[0]?.distance ?? -1) };
  }),
});
