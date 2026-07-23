/**
 * @backend dev server entrypoint (ARC-3). Boots OpenTelemetry FIRST, then serves:
 *   - /api/auth/*  → the BetterAuth handler (Google OAuth callbacks, client auth)
 *   - everything else → the tRPC router (HTTP) + a WebSocket server (subscriptions)
 * Run with `npm run dev:api`. Reads .env; connects to the .coder Postgres.
 */
import "./otel.js";
import type { IncomingMessage } from "node:http";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { fromNodeHeaders } from "better-auth/node";
import { WebSocketServer } from "ws";
import { createLlmPort } from "./adapters/llm/index.js";
import { createAuth } from "./auth/auth.js";
import { makeContext } from "./context.js";
import { createDb } from "./db/client.js";
import { createMemory } from "./memory/index.js";
import { appRouter } from "./router.js";

try {
  process.loadEnvFile?.();
} catch {
  // .env is optional — fall back to the ambient environment.
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set (copy .env.example to .env)");
const port = Number(process.env.API_PORT ?? 3001);

const db = createDb(databaseUrl);
const auth = createAuth(db);
// LLM port: real Vertex/Gemini when VERTEX_AI_KEY is set, else the keyless dev
// stub (ADR-0003/ADR-0008). Memory (ARC-11) is the shared brain over both.
const llm = createLlmPort();
const memory = createMemory(db, llm);
const ctx = makeContext(db, auth, memory);
console.log(`@backend LLM adapter: ${llm.name}`);

/** Convert a Node request to a Web `Request` (buffering the body) for auth.handler. */
async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const method = req.method ?? "GET";
  const init: RequestInit = { method, headers: fromNodeHeaders(req.headers) };
  if (method !== "GET" && method !== "HEAD") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    if (chunks.length) init.body = new Uint8Array(Buffer.concat(chunks));
  }
  return new Request(url, init);
}

const server = createHTTPServer({
  router: appRouter,
  createContext: ctx.fromHttp,
  middleware: async (req, res, next) => {
    if (!req.url?.startsWith("/api/auth")) return next();
    try {
      const response = await auth.handler(await toWebRequest(req));
      res.statusCode = response.status;
      const setCookie = response.headers.getSetCookie();
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "set-cookie") res.setHeader(key, value);
      });
      if (setCookie.length) res.setHeader("set-cookie", setCookie);
      res.end(response.body ? Buffer.from(await response.arrayBuffer()) : undefined);
    } catch {
      res.statusCode = 500;
      res.end();
    }
  },
});

const wss = new WebSocketServer({ server });
const wsHandler = applyWSSHandler({ wss, router: appRouter, createContext: ctx.fromWs });

process.on("SIGTERM", () => {
  wsHandler.broadcastReconnectNotification();
  wss.close();
  server.close();
});

server.listen(port);
console.log(`@backend listening on http://localhost:${port} (tRPC + WebSocket + /api/auth)`);
