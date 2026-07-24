/**
 * BetterAuth — the identity mechanism (ACCS-1, ADR-0006, SEC-7). There is no
 * bespoke identity store: BetterAuth's organization + admin plugins ARE the
 * User/Org/Membership model (DM-15/16). Google is the production sign-in; the
 * dev email-only flow (SEC-7) uses email-OTP with the code captured in-process
 * (no mail sent) — see `devOtpStore` and the auth router's devLogin.
 *
 * This replaces the walking-skeleton's dev-session cookie seam (session.ts).
 *
 * @implements ACCS-1 v1  (User–Org identity on BetterAuth; the org + admin plugins)
 */

import * as authSchema from "@steward/shared/db/auth-schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, organization } from "better-auth/plugins";
import type { Database } from "../db/client.js";

/** Dev-only capture of the latest OTP per email (no email is sent in dev). */
export const devOtpStore = new Map<string, string>();

/** Build the BetterAuth instance over the shared Drizzle handle. */
export function createAuth(db: Database) {
  // Origins allowed for auth requests + cookies. In the Coder workspace the app is
  // served from the external FQDN (BETTER_AUTH_URL / FRONTEND_URL); localhost covers
  // plain local dev.
  const trustedOrigins = [
    process.env.BETTER_AUTH_URL,
    process.env.FRONTEND_URL,
    "http://localhost:3000",
  ].filter((origin): origin is string => Boolean(origin));

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
    secret: process.env.BETTER_AUTH_SECRET ?? "dev-insecure-secret",
    trustedOrigins,
    database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
    socialProviders: {
      // Google sign-in (production). Wired now; credentials come from env — the
      // dev flow below does not exercise it.
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    plugins: [
      organization(),
      admin(),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          // DEV: capture instead of emailing. A real email adapter replaces this
          // for production email-OTP if/when it is offered outside dev.
          devOtpStore.set(email, otp);
          if (process.env.NODE_ENV !== "production") {
            console.log(`[dev-auth] OTP for ${email}: ${otp}`);
          }
        },
      }),
    ],
  });
}

/** The BetterAuth instance type. */
export type Auth = ReturnType<typeof createAuth>;
