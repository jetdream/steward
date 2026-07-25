/**
 * The e2e tier (DEC-43) — the machine-checkable half of the founder-loop
 * stories in `.spec/stories/founder-loop.yaml`.
 *
 * HERMETIC. Today that holds because this tier boots VITE ONLY — there is no
 * server here that could call a model. The `STEWARD_LLM=dev-stub` pin below is
 * therefore forward-looking, not the current mechanism: it is in place for when
 * a data-bound story boots `dev:api`, so the tier can never silently start
 * reaching live Gemini (the DEC-41 tiering extended to the browser; LRN-27).
 *
 * Distinct from `.coder/playwright`, which is an INTERACTIVE headed browser an
 * agent drives over CDP. This config owns its own browser and its own server.
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100; // not :3000 — never fight a dev server the founder has open
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
  webServer: {
    // Vite only — these stories are shell/DS assertions with no backend calls.
    // The increments that add data-bound stories extend this to boot dev:api.
    command: `STEWARD_LLM=dev-stub npx vite --port ${PORT} --strictPort`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
