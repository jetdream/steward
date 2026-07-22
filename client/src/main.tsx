/**
 * React entry (ARC-2). Wires the tRPC client (HTTP for query/mutation, WebSocket
 * for subscriptions — split by op type) and TanStack Query, then mounts the app.
 * tRPC is reached same-origin at /trpc (proxied to @backend by Vite).
 */
import type { AppRouter } from "@backend";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import { App } from "./App";
import "./index.css";
import { TRPCProvider } from "./trpc";

const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
const wsClient = createWSClient({ url: `${wsProtocol}://${window.location.host}/trpc` });

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === "subscription",
      true: wsLink({ client: wsClient, transformer: superjson }),
      false: httpBatchLink({ url: "/trpc", transformer: superjson }),
    }),
  ],
});

const queryClient = new QueryClient();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root not found");

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <App />
      </TRPCProvider>
    </QueryClientProvider>
  </StrictMode>,
);
