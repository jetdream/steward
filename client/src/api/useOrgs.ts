/**
 * Orgs domain hook — the active org (DM-1) and the membership list, over the
 * BetterAuth-backed org router. Components call this, never tRPC directly.
 *
 * ACCS-2 resolves an org's scope SERVER-SIDE from the session's active org, so
 * the client never passes an org id to a data query. The consequence for the
 * cache is absolute: **switching the active org invalidates every cached answer
 * in the app**, because each one silently belonged to the org that was active
 * when it was fetched. Invalidating only `org.active` would leave the previous
 * org's memory, drafts, and publish log on screen under the new org's name —
 * a confidentiality failure, not just a stale view (SEC-4).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc";

export function useOrgs() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const list = useQuery(trpc.org.list.queryOptions());
  const active = useQuery(trpc.org.active.queryOptions());

  const create = useMutation(
    trpc.org.create.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: trpc.org.list.queryKey() }),
    }),
  );

  const setActive = useMutation(
    trpc.org.setActive.mutationOptions({
      // Reset, not invalidate: an invalidated query keeps serving its stale
      // value while it refetches, and here the stale value is another org's data.
      // Not `clear()` either — that empties the cache WITHOUT notifying
      // observers, so the screen would keep rendering the old org (LRN-31).
      onSuccess: () => queryClient.resetQueries(),
    }),
  );

  return { list, active, create, setActive };
}
