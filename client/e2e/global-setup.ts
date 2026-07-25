/**
 * Playwright global setup — seed the demo org before any story runs.
 *
 * The Ready-spine stories need a stack in SPECIFIC states (a clean approvable
 * card, a GR-3 hold, an awaiting-picture card). Those cannot be produced through
 * the UI on this tier: the keyless model port's guardrail judge is deliberately
 * dormant and fail-safe, so it escalates EVERY draft — a correct posture that
 * makes "a clean card" unreachable by generation. The seed writes them
 * deterministically instead (`backend/src/demo/seed.ts`, synthetic-only per
 * SEC-4).
 *
 * Seeding here rather than in a test keeps `npm run e2e` self-contained: one
 * command, no remembered prerequisite. It runs AFTER the webServers boot, so the
 * database is already migrated by whatever brought them up.
 */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { FullConfig } from "@playwright/test";
import { DEMO_SUITES, demoEmailFor } from "../../backend/src/demo/seed.js";

export default function globalSetup(config: FullConfig): void {
  const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
  // ONE ORG PER (PROJECT x SPEC FILE) — see `demoEmailFor` for why both axes
  // matter: disposing specs must not clear each other's stacks, and concurrent
  // dev sign-ins as the same founder race a single in-memory OTP.
  const emails = config.projects.flatMap((p) => DEMO_SUITES.map((s) => demoEmailFor(p.name, s)));
  execFileSync("npm", ["run", "--silent", "demo:seed", "--", ...emails], {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });
}
