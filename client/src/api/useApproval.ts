/**
 * Approval domain hook — the Ready spine and its dispositions (APRS-1 v3).
 *
 * The most-used surface in the product, so the invalidation matters: every
 * disposition changes the stack AND writes to Memory (the APRS-3 learning loop),
 * which changes what the conversation can suggest next. Refreshing the stack
 * alone would leave the founder looking at openings computed from a world one
 * action out of date.
 *
 * `skip` deliberately takes no reason: APRS-1 asks for it AFTER the action
 * completes ("answering is a gift, never a toll"), so the reason arrives as a
 * separate `explainSkip` call against an item that is already gone from the
 * count. Making it one call with an optional argument is how a toll gets
 * reintroduced by accident.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc";

export function useApproval() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const stack = useQuery(trpc.approval.readyStack.queryOptions());

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: trpc.approval.readyStack.queryKey() });
    // A disposition is a Memory write (APRS-3) — what Steward knows, and what it
    // can suggest, both move with it.
    void queryClient.invalidateQueries({ queryKey: trpc.onboarding.profile.queryKey() });
    void queryClient.invalidateQueries({ queryKey: trpc.chat.openings.queryKey() });
  };

  const approve = useMutation(trpc.approval.approve.mutationOptions({ onSuccess: refresh }));
  const batchApprove = useMutation(
    trpc.approval.batchApprove.mutationOptions({ onSuccess: refresh }),
  );
  const skip = useMutation(trpc.approval.skip.mutationOptions({ onSuccess: refresh }));
  const editDraft = useMutation(trpc.approval.editDraft.mutationOptions({ onSuccess: refresh }));
  const redirect = useMutation(trpc.approval.redirect.mutationOptions({ onSuccess: refresh }));

  /**
   * The after-the-fact skip reason (CHTS-5 enrichment loop). A second call on
   * purpose — the card is already skipped and out of the count by the time this
   * is offered, so declining costs the founder nothing.
   */
  const explainSkip = (itemId: string, reason: string): void => {
    skip.mutate({ itemId, reason });
  };

  return { stack, approve, batchApprove, skip, explainSkip, editDraft, redirect };
}
