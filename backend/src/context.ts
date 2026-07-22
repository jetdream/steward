/**
 * tRPC request context. Built per request (HTTP) or per socket (WS): it carries
 * the Drizzle handle and the resolved session. Over HTTP it can also set/clear the
 * session cookie on the response; over WS it is read-only (no response to write to).
 */
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { Database } from "./db/client.js";
import {
  type AppSession,
  readCookie,
  SESSION_COOKIE,
  sessionCookieHeader,
  signSession,
  verifySession,
} from "./session.js";

export interface Context {
  db: Database;
  session: AppSession | null;
  /** Set/clear the session cookie — present over HTTP only (null over WS). */
  setSession: ((session: AppSession | null) => void) | null;
}

/** Build the HTTP + WS context factories over a shared db handle and signing secret. */
export function makeContext(db: Database, secret: string) {
  return {
    fromHttp({ req, res }: CreateHTTPContextOptions): Context {
      return {
        db,
        session: verifySession(readCookie(req.headers.cookie, SESSION_COOKIE), secret),
        setSession: (session) => {
          const token = session ? signSession(session, secret) : null;
          res.setHeader("Set-Cookie", sessionCookieHeader(token));
        },
      };
    },
    fromWs({ req }: CreateWSSContextFnOptions): Context {
      return {
        db,
        session: verifySession(readCookie(req.headers.cookie, SESSION_COOKIE), secret),
        setSession: null,
      };
    },
  };
}
