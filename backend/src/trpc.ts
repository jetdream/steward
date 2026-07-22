/**
 * tRPC initialization: the router/procedure builders every capability uses.
 * superjson is the transformer (Date/Map/etc. survive the wire). Two seams:
 * an OpenTelemetry span per procedure call, and `protectedProcedure` for the
 * server-side auth gate (ACC-3 org confinement will tighten this in the vertical).
 */
import { SpanStatusCode, trace } from "@opentelemetry/api";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context.js";

const t = initTRPC.context<Context>().create({ transformer: superjson });
const tracer = trace.getTracer("steward-trpc");

/** Wrap each call in a span named `trpc.<type> <path>` (the app-level OTel span). */
const otelMiddleware = t.middleware(({ path, type, next }) =>
  tracer.startActiveSpan(`trpc.${type} ${path}`, async (span) => {
    try {
      const result = await next();
      span.setStatus({ code: result.ok ? SpanStatusCode.UNSET : SpanStatusCode.ERROR });
      return result;
    } finally {
      span.end();
    }
  }),
);

export const router = t.router;
export const publicProcedure = t.procedure.use(otelMiddleware);

/** Requires a session. Narrows `ctx.session` to non-null for downstream resolvers. */
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, session: ctx.session } });
});
