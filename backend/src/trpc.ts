/**
 * tRPC initialization: the router/procedure builders every capability uses.
 * superjson is the transformer (Date/Map/etc. survive the wire). Three seams:
 * an OpenTelemetry span per procedure call, `protectedProcedure` for the
 * server-side auth gate, and `orgProcedure` for ACCS-2 active-org confinement.
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

/** Requires a signed-in User. Narrows `ctx.session` to non-null downstream. */
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, session: ctx.session } });
});

/**
 * ACC-3 server-side org confinement: resolves the org scope from the SESSION's
 * active org, never a client-supplied id, and exposes it as `ctx.orgId`. Every
 * org-scoped procedure builds on this — a request can only act within its one
 * active org (switch it via auth.setActiveOrganization, itself confined to the
 * user's memberships).
 *
 * @implements ACCS-2 v1  (active-org context resolved server-side; the confinement seam)
 */
export const orgProcedure = protectedProcedure.use(({ ctx, next }) => {
  const orgId = ctx.session.session.activeOrganizationId;
  if (!orgId) throw new TRPCError({ code: "FORBIDDEN", message: "no active organization" });
  return next({ ctx: { ...ctx, orgId } });
});
