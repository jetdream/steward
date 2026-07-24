/**
 * The application tRPC router (ARC-3) — composed from per-capability routers, one
 * file each under ./routers, so it stays modular as verticals land. `AppRouter` is
 * the API contract type the client imports.
 */
import { approvalRouter } from "./routers/approval.js";
import { authRouter } from "./routers/auth.js";
import { autonomyRouter } from "./routers/autonomy.js";
import { channelsRouter } from "./routers/channels.js";
import { chatRouter } from "./routers/chat.js";
import { contentRouter } from "./routers/content.js";
import { interviewerRouter } from "./routers/interviewer.js";
import { mediaRouter } from "./routers/media.js";
import { memoryRouter } from "./routers/memory.js";
import { onboardingRouter } from "./routers/onboarding.js";
import { orgRouter } from "./routers/org.js";
import { pingRouter } from "./routers/ping.js";
import { publishingRouter } from "./routers/publishing.js";
import { radarRouter } from "./routers/radar.js";
import { strategyRouter } from "./routers/strategy.js";
import { systemRouter } from "./routers/system.js";
import { router } from "./trpc.js";

export const appRouter = router({
  auth: authRouter,
  org: orgRouter,
  memory: memoryRouter,
  onboarding: onboardingRouter,
  interviewer: interviewerRouter,
  chat: chatRouter,
  content: contentRouter,
  media: mediaRouter,
  strategy: strategyRouter,
  radar: radarRouter,
  autonomy: autonomyRouter,
  channels: channelsRouter,
  publishing: publishingRouter,
  approval: approvalRouter,
  system: systemRouter,
  ping: pingRouter,
});

export type AppRouter = typeof appRouter;
