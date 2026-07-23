/**
 * Ping router — a WebSocket server push (a tick every second) proving realtime
 * end to end (constitution: WebSocket for realtime updates).
 */
import { setTimeout as sleep } from "node:timers/promises";
import { publicProcedure, router } from "../trpc.js";

export const pingRouter = router({
  stream: publicProcedure.subscription(async function* (opts) {
    let seq = 0;
    while (!opts.signal?.aborted) {
      yield { seq: ++seq, at: new Date().toISOString() };
      await sleep(1000);
    }
  }),
});
