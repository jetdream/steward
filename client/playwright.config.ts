/**
 * The e2e tier (DEC-43) — the machine-checkable half of the founder-loop
 * stories in `.spec/stories/founder-loop.yaml`.
 *
 * KEYLESS, not model-free-by-accident. From the doorstep story (E6) this tier
 * boots a REAL @backend against the dev Postgres, because "sign in and land on
 * your home" is not a story you can validate against a stub. `STEWARD_LLM=dev-stub`
 * is therefore now the live mechanism rather than a forward-looking pin: it is
 * what keeps the tier off live Gemini (the DEC-41 tiering extended to the
 * browser; LRN-27). CI supplies the same pgvector Postgres the integration tier
 * uses and runs the migrations before this step.
 *
 * Distinct from `.coder/playwright`, which is an INTERACTIVE headed browser an
 * agent drives over CDP. This config owns its own browser and its own servers.
 */
import { defineConfig, devices } from "@playwright/test";

// Its own PAIR of ports — never :3000/:3001 — so a run can neither fight a dev
// server the founder has open nor, worse, quietly sign in against it.
const PORT = 3100;
const API_PORT = 3101;
const BASE = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // A story is validated or it is not; a retry that passes on the second go is
  // a flake we want to see, not hide.
  retries: 0,
  // A stray `.only` must FAIL CI, not quietly narrow it to one story — the
  // challenger proved a single `.only` turns this suite green with 4 of 5
  // stories unrun.
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  reporter: process.env.CI ? [["list"], ["github"]] : [["list"]],
  use: {
    baseURL: BASE,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    // The two layout modes DEC-19/DEC-20 allow, and nothing between them: a
    // story that only holds at one width has not been validated.
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 860 } },
    },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      // @backend on its own port. FRONTEND_URL puts the e2e origin in
      // BetterAuth's trustedOrigins so the session cookie is issued (SEC-7);
      // BETTER_AUTH_URL keeps its baseURL on the matching API port.
      command:
        `STEWARD_LLM=dev-stub API_PORT=${API_PORT} ` +
        `BETTER_AUTH_URL=http://127.0.0.1:${API_PORT} FRONTEND_URL=${BASE} ` +
        `npx tsx backend/src/server.ts`,
      // From the REPO ROOT: the server reads `.env` relative to its cwd
      // (`process.loadEnvFile()`), and a webServer otherwise inherits the
      // config's directory — which is how it lost DATABASE_URL the first time.
      cwd: "..",
      // BetterAuth's health route. Deliberately not `/`, which the tRPC
      // standalone adapter answers 404 to — Playwright treats that as not-ready
      // and burns the whole timeout against a server that is already up.
      url: `http://127.0.0.1:${API_PORT}/api/auth/ok`,
      reuseExistingServer: !process.env.CI,
      timeout: 90_000,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      // Vite proxies /trpc and /api/auth to API_PORT above — same-origin, so
      // the Set-Cookie survives (see client/vite.config.ts).
      command: `STEWARD_LLM=dev-stub API_PORT=${API_PORT} npx vite --port ${PORT} --strictPort`,
      url: BASE,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
});
