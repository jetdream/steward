/**
 * Channels domain hook — connections, health and re-auth (ONBS-4).
 *
 * Connect is available in ANY order at ANY time and is NEVER a gate: zero
 * connections still let drafts flow, and publishing simply activates a
 * destination once a healthy connection exists. That is why this hook exposes
 * no "is the org set up?" predicate — there is nothing here for the rest of the
 * app to block on, and offering such a flag is how a non-gate becomes one.
 *
 * The credential never crosses the boundary: `list` returns the secret-free
 * `ChannelConnection` view (SEC-10).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc";

export function useChannels() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const connections = useQuery(trpc.channels.list.queryOptions());

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: trpc.channels.list.queryKey() });
    // A newly healthy channel changes where an approved post can actually go.
    void queryClient.invalidateQueries({ queryKey: trpc.approval.readyStack.queryKey() });
  };

  const connect = useMutation(trpc.channels.connect.mutationOptions({ onSuccess: refresh }));
  const reconnect = useMutation(trpc.channels.reconnect.mutationOptions({ onSuccess: refresh }));

  return { connections, connect, reconnect };
}
