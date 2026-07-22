/**
 * Ping domain hook — subscribes to the backend's WebSocket server push and
 * returns the latest tick. Proves realtime end-to-end (constitution: WebSocket
 * for realtime updates). Components call this, never tRPC directly.
 */
import { useSubscription } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { useTRPC } from "../trpc";

export interface PingTick {
  seq: number;
  at: string;
}

export function usePing(): PingTick | null {
  const trpc = useTRPC();
  const [last, setLast] = useState<PingTick | null>(null);

  useSubscription(
    trpc.ping.stream.subscriptionOptions(undefined, {
      onData: (tick: PingTick) => setLast(tick),
    }),
  );

  return last;
}
