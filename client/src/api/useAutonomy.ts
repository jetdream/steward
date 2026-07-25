/**
 * Autonomy domain hook — today the global kill switch only (AUTS-3 / AUT-3).
 *
 * The chrome's Pause control is live from the moment the shell renders, because
 * AUT-3 is P0 `flexibility: hard`: "one gesture at every trust level". A Pause
 * button wired to component state would look like a kill switch and stop
 * nothing — the single worst thing this surface could do. So the shell binds
 * here from its first increment, before the Controls tray exists.
 *
 * Trust levels and per-channel pause (also AUTS-3) join when the tray is built.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc";

export function useAutonomy() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  // Refetch the paused fact after either verb, so the chrome shows the SERVER's
  // answer rather than an optimistic guess about whether publishing stopped.
  const invalidateStatus = () =>
    queryClient.invalidateQueries({ queryKey: trpc.autonomy.status.queryKey() });

  const status = useQuery(trpc.autonomy.status.queryOptions({}));
  const killSwitch = useMutation(
    trpc.autonomy.killSwitch.mutationOptions({ onSuccess: invalidateStatus }),
  );
  const resume = useMutation(trpc.autonomy.resume.mutationOptions({ onSuccess: invalidateStatus }));

  return { status, killSwitch, resume };
}
