/**
 * Auth router (ACCS-1, SEC-7). `devLogin` is the dev email-only flow — it drives
 * BetterAuth's email-OTP with the code captured in-process, then, for a brand-new
 * user, creates the (User, Org, owner-Membership) signup triple and sets the
 * active org. Production sign-in is Google (mounted at /api/auth, not here).
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { devOtpStore } from "../auth/auth.js";
import { publicProcedure, router } from "../trpc.js";
import { orgSlug } from "./org.js";

export const authRouter = router({
  /** Dev email-only sign-in (SEC-7) — no mail sent; production is Google. */
  devLogin: publicProcedure
    .input(z.object({ email: z.email() }))
    .mutation(async ({ ctx, input }) => {
      if (process.env.NODE_ENV === "production") {
        throw new TRPCError({ code: "FORBIDDEN", message: "dev login is disabled in production" });
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
});
