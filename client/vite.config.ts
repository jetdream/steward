/**
 * Vite config for the web app (ARC-2). Proxies tRPC — HTTP and WebSocket — AND the
 * BetterAuth handler (`/api/auth/*`) to @backend so the browser talks to both
 * same-origin (no CORS; the session cookie rides along). The @shared/@client
 * aliases mirror the tsconfig paths for any runtime value import.
 */
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Where @backend is listening. Matches the server's own `API_PORT` default, and
 * is read from the env for the same reason the server reads it: the e2e tier
 * boots its OWN api+web pair on a second pair of ports so it never fights (or
 * silently talks to) a dev server the founder has open.
 */
const API_PORT = Number(process.env.API_PORT ?? 3001);
const API = `http://localhost:${API_PORT}`;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../shared/src/index.ts", import.meta.url)),
      "@client": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // Bind 0.0.0.0 so the Coder proxy / the Playwright container's Caddy can reach
    // the dev server via host.docker.internal; allow the workspace's external host
    // (Vite blocks unknown Host headers by default). Dev only — gated by Coder auth.
    host: true,
    // `host.docker.internal` is how the .coder/playwright container reaches the
    // dev server (its Caddy reverse-proxies to it), so agent browser checks and
    // the e2e suite need it allowlisted alongside the Coder workspace host.
    allowedHosts: [".coder.bpms.dev", "localhost", "host.docker.internal"],
    port: 3000,
    proxy: {
      "/trpc": {
        target: API,
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/trpc/, ""),
      },
      // The BetterAuth handler is mounted at /api/auth on the API server (SEC-7).
      // Same-origin so Set-Cookie is accepted; no rewrite — the path is the route.
      "/api/auth": {
        target: API,
        changeOrigin: true,
      },
    },
  },
});
