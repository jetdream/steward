/**
 * Vite config for the web app (ARC-2). Proxies tRPC — HTTP and WebSocket — to
 * @backend on :3001 so the browser talks to the API same-origin (no CORS). The
 * @shared/@client aliases mirror the tsconfig paths for any runtime value import.
 */
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../shared/src/index.ts", import.meta.url)),
      "@client": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/trpc": {
        target: "http://localhost:3001",
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/trpc/, ""),
      },
    },
  },
});
