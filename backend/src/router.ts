/**
 * The application tRPC router — the API surface the client calls (ARC-3).
 *
 * ACCS-1/2: identity + org are BetterAuth (organization + admin plugins, ADR-0006).
 * `auth.devLogin` is the dev email-only flow (SEC-7) — it drives BetterAuth's
 * email-OTP with the code captured in-process, then, for a brand-new user, creates
 * the (User, Org, owner-Membership) signup triple (ACCS-1) and sets the active org.
 * `org.*` go through the BetterAuth org API; scope is the SESSION's active org
 * (ACC-3), never a client-supplied id. `system`/`ping` remain from the skeleton.
 */
import { setTimeout as sleep } from "node:timers/promises";
import type { Org } from "@steward/shared";
import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { devOtpStore } from "./auth/auth.js";
import { orgProcedure, protectedProcedure, publicProcedure, router } from "./trpc.js";

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "org";

/** A unique-enough dev slug (BetterAuth requires org slugs to be unique). */
const orgSlug = (name: string): string => `${slugify(name)}-${Date.now().toString(36)}`;

/** Compose the cross-boundary Org from a BetterAuth organization record. */
function toOrg(o: {
  id: string;
  name: string;
  slug: string;
  logo?: string | null | undefined;
  createdAt: Date;
}): Org {
  return { id: o.id, name: o.name, slug: o.slug, logo: o.logo ?? null, createdAt: o.createdAt };
}

export const appRouter = router({
  auth: router({
    /** Dev email-only sign-in (SEC-7) — no mail sent; production is Google. */
    devLogin: publicProcedure
      .input(z.object({ email: z.email() }))
      .mutation(async ({ ctx, input }) => {
        if (process.env.NODE_ENV === "production") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "dev login is disabled in production",
          });
        }
        await ctx.auth.api.sendVerificationOTP({ body: { email: input.email, type: "sign-in" } });
        const otp = devOtpStore.get(input.email);
        if (!otp)
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "dev OTP not captured" });

        const signIn = await ctx.auth.api.signInEmailOTP({
          body: { email: input.email, otp },
          asResponse: true,
        });
        const cookies = signIn.headers.getSetCookie();
        ctx.appendCookies?.(cookies);
        const authed = new Headers({ cookie: cookies.map((c) => c.split(";")[0]).join("; ") });

        // Signup triple (ACCS-1): a brand-new user gets an Org + owner Membership.
        const memberships = await ctx.auth.api.listOrganizations({ headers: authed });
        const firstOrg = memberships[0];
        let activeOrgId: string;
        if (firstOrg) {
          activeOrgId = firstOrg.id;
        } else {
          const name = input.email.split("@")[0] || "My organization";
          const created = await ctx.auth.api.createOrganization({
            body: { name, slug: orgSlug(name) },
            headers: authed,
          });
          if (!created)
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "org creation failed" });
          activeOrgId = created.id;
        }
        await ctx.auth.api.setActiveOrganization({
          body: { organizationId: activeOrgId },
          headers: authed,
        });

        const session = await ctx.auth.api.getSession({ headers: authed });
        return session?.user ?? null;
      }),

    me: publicProcedure.query(({ ctx }) =>
      ctx.session
        ? {
            user: ctx.session.user,
            activeOrganizationId: ctx.session.session.activeOrganizationId ?? null,
          }
        : null,
    ),

    logout: publicProcedure.mutation(async ({ ctx }) => {
      const res = await ctx.auth.api.signOut({ headers: ctx.headers, asResponse: true });
      ctx.appendCookies?.(res.headers.getSetCookie());
      return { ok: true };
    }),
  }),

  org: router({
    /** The orgs the signed-in user is a member of (BetterAuth confines this). */
    list: protectedProcedure.query(async ({ ctx }) => {
      const orgs = await ctx.auth.api.listOrganizations({ headers: ctx.headers });
      return orgs.map(toOrg);
    }),

    create: protectedProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const created = await ctx.auth.api.createOrganization({
          body: { name: input.name, slug: orgSlug(input.name) },
          headers: ctx.headers,
        });
        if (!created)
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "org creation failed" });
        return toOrg(created);
      }),

    /** The active org (ACC-3: id comes from the session via orgProcedure, never the client). */
    active: orgProcedure.query(async ({ ctx }) => {
      const orgs = await ctx.auth.api.listOrganizations({ headers: ctx.headers });
      const active = orgs.find((o) => o.id === ctx.orgId);
      if (!active) throw new TRPCError({ code: "NOT_FOUND", message: "active org not found" });
      return toOrg(active);
    }),

    /** Switch the active org — BetterAuth refuses an org the user is not a member of (ACCS-2). */
    setActive: protectedProcedure
      .input(z.object({ organizationId: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        await ctx.auth.api.setActiveOrganization({
          body: { organizationId: input.organizationId },
          headers: ctx.headers,
        });
        return { ok: true };
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
