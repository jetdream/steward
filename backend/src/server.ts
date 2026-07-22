/**
 * @backend dev server entrypoint (ARC-3). Boots OpenTelemetry FIRST (side-effect
 * import), then serves the tRPC router over HTTP and attaches a WebSocket server
 * for subscriptions. Run with `npm run dev:api`. Reads .env via Node's built-in
 * loader; connects to the .coder Postgres (DATABASE_URL).
 */
import "./otel.js";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { WebSocketServer } from "ws";
import { makeContext } from "./context.js";
import { createDb } from "./db/client.js";
import { appRouter } from "./router.js";

try {
  process.loadEnvFile?.();
} catch {
  // .env is optional — fall back to the ambient environment.
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set (copy .env.example to .env)");
const secret = process.env.BETTER_AUTH_SECRET ?? "dev-insecure-secret";
const port = Number(process.env.API_PORT ?? 3001);

const db = createDb(databaseUrl);
const ctx = makeContext(db, secret);

const server = createHTTPServer({ router: appRouter, createContext: ctx.fromHttp });
const wss = new WebSocketServer({ server });
const wsHandler = applyWSSHandler({ wss, router: appRouter, createContext: ctx.fromWs });

process.on("SIGTERM", () => {
  wsHandler.broadcastReconnectNotification();
  wss.close();
  server.close();
});

server.listen(port);
console.log(`@backend listening on http://localhost:${port} (tRPC + WebSocket)`);
