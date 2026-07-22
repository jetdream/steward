/**
 * Dev session — a signed cookie carrying the logged-in principal.
 *
 * THIS IS A SEAM, NOT THE AUTH IMPLEMENTATION. The constitution mandates
 * BetterAuth (Google sign-in + dev email-only login, SEC-7); that lands with the
 * accounts/identity vertical (ACCS). The walking skeleton only needs to prove the
 * session seam — a login writes a session the tRPC context reads — so it uses a
 * minimal HMAC-signed cookie instead of standing up BetterAuth's full schema.
 * Replace `signSession`/`verifySession` + the cookie wiring with BetterAuth in ACCS.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

/** The authenticated principal carried in the session (skeleton shape). */
export interface AppSession {
  userId: string;
  email: string;
}

export const SESSION_COOKIE = "steward_dev_session";

const b64url = (s: string) => Buffer.from(s).toString("base64url");
const unb64url = (s: string) => Buffer.from(s, "base64url").toString("utf8");

function hmac(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Sign a session into a `<payload>.<sig>` token. */
export function signSession(session: AppSession, secret: string): string {
  const payload = b64url(JSON.stringify(session));
  return `${payload}.${hmac(payload, secret)}`;
}

/** Verify a token and return the session, or null if missing/tampered. */
export function verifySession(token: string | undefined, secret: string): AppSession | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = hmac(payload, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(unb64url(payload)) as AppSession;
  } catch {
    return null;
  }
}

/** Read a cookie value from a raw Cookie header. */
export function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

/** Build a Set-Cookie header value for the session (or a clearing cookie when null). */
export function sessionCookieHeader(token: string | null): string {
  const base = `${SESSION_COOKIE}=${token ?? ""}; Path=/; HttpOnly; SameSite=Lax`;
  return token ? base : `${base}; Max-Age=0`;
}
