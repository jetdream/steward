/**
 * The application tRPC router (ARC-3) — composed from per-capability routers, one
 * file each under ./routers, so it stays modular as verticals land. `AppRouter` is
 * the API contract type the client imports.
 */
import { authRouter } from "./routers/auth.js";
import { orgRouter } from "./routers/org.js";
import { pingRouter } from "./routers/ping.js";
import { systemRouter } from "./routers/system.js";
import { router } from "./trpc.js";

export const appRouter = router({
  auth: authRouter,
  org: orgRouter,
  system: systemRouter,
  ping: pingRouter,
});

export type AppRouter = typeof appRouter;
