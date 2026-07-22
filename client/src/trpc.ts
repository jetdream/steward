/**
 * Typed tRPC + TanStack Query context for the app. `useTRPC()` yields the typed
 * proxy the domain hooks (src/api/*) build query/mutation/subscription options
 * from — components never touch this directly (constitution "Client": all backend
 * access goes through domain-specific API hooks).
 */
import type { AppRouter } from "@backend";
import { createTRPCContext } from "@trpc/tanstack-react-query";

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();
