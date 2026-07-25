/**
 * Onboarding domain hook — the day-one surface's data (ONBS-2/3/5/6).
 *
 * Four reads and two writes, and the invalidation between them is the whole
 * point: ingesting sources and correcting the profile both change what Steward
 * KNOWS, which changes the gap model, the profile, and the readiness predicate
 * at once. Refreshing one and not the others is how the day-one stream would
 * come to disagree with itself — findings landing while the readiness line still
 * says "still thin".
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc";

export function useOnboarding() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const gaps = useQuery(trpc.onboarding.gaps.queryOptions());
  const profile = useQuery(trpc.onboarding.profile.queryOptions());
  const ready = useQuery(trpc.onboarding.ready.queryOptions());

  /** Everything downstream of a Memory write — see the note above. */
  const refreshKnowledge = () => {
    void queryClient.invalidateQueries({ queryKey: trpc.onboarding.gaps.queryKey() });
    void queryClient.invalidateQueries({ queryKey: trpc.onboarding.profile.queryKey() });
    void queryClient.invalidateQueries({ queryKey: trpc.onboarding.ready.queryKey() });
    void queryClient.invalidateQueries({ queryKey: trpc.interviewer.openQuestions.queryKey() });
  };

  const ingest = useMutation(
    trpc.onboarding.ingest.mutationOptions({ onSuccess: refreshKnowledge }),
  );
  const correct = useMutation(
    trpc.onboarding.correct.mutationOptions({ onSuccess: refreshKnowledge }),
  );

  return { gaps, profile, ready, ingest, correct };
}
