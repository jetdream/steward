/**
 * The application tRPC router (ARC-3) — composed from per-capability routers, one
 * file each under ./routers, so it stays modular as verticals land. `AppRouter` is
 * the API contract type the client imports.
 */
import { authRouter } from "./routers/auth.js";
import { memoryRouter } from "./routers/memory.js";
import { onboardingRouter } from "./routers/onboarding.js";
import { orgRouter } from "./routers/org.js";
import { pingRouter } from "./routers/ping.js";
import { radarRouter } from "./routers/radar.js";
import { strategyRouter } from "./routers/strategy.js";
import { systemRouter } from "./routers/system.js";
import { router } from "./trpc.js";

export const appRouter = router({
  auth: authRouter,
  org: orgRouter,
  memory: memoryRouter,
  onboarding: onboardingRouter,
  strategy: strategyRouter,
  radar: radarRouter,
  system: systemRouter,
  ping: pingRouter,
});

export type AppRouter = typeof appRouter;
