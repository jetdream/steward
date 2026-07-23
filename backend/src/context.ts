/**
 * tRPC request context. Built per request (HTTP) or per socket (WS): it carries
 * the Drizzle handle, the BetterAuth instance, the request headers (for auth.api
 * calls), and the resolved BetterAuth session. Over HTTP it can append Set-Cookie
 * headers to the response (the dev-login flow forwards BetterAuth's cookies).
 */
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { fromNodeHeaders } from "better-auth/node";
import type { Auth } from "./auth/auth.js";
import type { Database } from "./db/client.js";

/** The `{ session, user }` object BetterAuth returns, or null when signed out. */
export type SessionResult = Awaited<ReturnType<Auth["api"]["getSession"]>>;

export interface Context {
  db: Database;
  auth: Auth;
  /** Web `Headers` for the request — passed to `auth.api.*` calls. */
  headers: Headers;
  session: SessionResult;
  /** Append Set-Cookie headers to the response — HTTP only (null over WS). */
  appendCookies: ((cookies: string[]) => void) | null;
}

/** Build the HTTP + WS context factories over a shared db handle and auth instance. */
export function makeContext(db: Database, auth: Auth) {
  const base = async (headers: Headers) => ({
    db,
    auth,
    headers,
    session: await auth.api.getSession({ headers }),
  });
  return {
    async fromHttp({ req, res }: CreateHTTPContextOptions): Promise<Context> {
      const headers = fromNodeHeaders(req.headers);
      return {
        ...(await base(headers)),
        appendCookies: (cookies) => {
          for (const cookie of cookies) res.appendHeader("Set-Cookie", cookie);
        },
      };
    },
    async fromWs({ req }: CreateWSSContextFnOptions): Promise<Context> {
      return { ...(await base(fromNodeHeaders(req.headers))), appendCookies: null };
    },
  };
}
