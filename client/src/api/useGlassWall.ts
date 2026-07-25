/**
 * Glass-wall domain hooks — the four pull-only views (UXS-4/5/8).
 *
 * One file because they share the property that defines them: these are READS.
 * VAL-3's transparency guarantee says the founder can look at any time without
 * asking; UXS-4/8 add that the views never badge, count or nudge. Grouping the
 * reads keeps that shared posture visible — the moment one of these grows a
 * "3 new" count, it stops being a glass wall and becomes an inbox.
 *
 * The two WRITES that live here are founder-initiated and neither creates a
 * task: editing the strategy (STRS-2) and triaging a discovery (EXTS-5).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc";

/** How I write — the five-section Posting Strategy (XG-7, STRS-1/2). */
export function useStrategy() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const strategy = useQuery(trpc.strategy.get.queryOptions());

  const edit = useMutation(
    trpc.strategy.edit.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.strategy.get.queryKey() });
        // An edit may route to MEMORY rather than the doc (STRS-2/DEC-22): an
        // org rule is a Memory write the Knowledge view must also reflect.
        void queryClient.invalidateQueries({ queryKey: trpc.onboarding.profile.queryKey() });
      },
    }),
  );

  return { strategy, edit };
}

/** Plan & Published — the calendar plus the append-only publish log (XG-8). */
export function usePlan() {
  const trpc = useTRPC();
  const plan = useQuery(trpc.content.plan.queryOptions());
  const log = useQuery(trpc.publishing.log.queryOptions());
  return { plan, log };
}

/** Discoveries — the pull-only external feed and its read-first triage (XG-9). */
export function useDiscoveries() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const discoveries = useQuery(trpc.radar.discoveries.queryOptions());

  const triage = useMutation(
    trpc.radar.triage.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.radar.discoveries.queryKey() });
        // A triage mark is a Memory write that tunes future discovery (EXTS-5).
        void queryClient.invalidateQueries({ queryKey: trpc.onboarding.profile.queryKey() });
      },
    }),
  );

  return { discoveries, triage };
}
