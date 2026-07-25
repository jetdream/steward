/**
 * Chat domain hook — the conversation region's data (CHTS-1/2/4/5).
 *
 * Chat and the interviewer share ONE session (both persist through the same
 * transcript store), which is what makes the home's conversation a single
 * conversation rather than two threads sharing a scroll (DEC-18). This hook
 * therefore takes the session id resolved by `useInterviewer` rather than
 * opening one of its own.
 *
 * THE REDIRECT IS TWO CALLS ON PURPOSE. CHTS-2 makes confirm-back a
 * deterministic gate: `previewRedirect` is a pure read that writes nothing, and
 * only `applyRedirect` binds the rule to Memory. Collapsing them into one
 * "helpful" call would bind a misread instruction as a permanent rule — the
 * exact failure the gate exists to prevent.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc";

export function useChat(sessionId: string | null, pendingRedirect: string | null) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const openings = useQuery(trpc.chat.openings.queryOptions());

  /** The interpretation to confirm. Fetched only while a redirect is pending. */
  const redirectPreview = useQuery(
    trpc.chat.previewRedirect.queryOptions(
      { text: pendingRedirect ?? "" },
      { enabled: pendingRedirect !== null },
    ),
  );

  const refreshTranscript = () => {
    if (sessionId !== null) {
      void queryClient.invalidateQueries({
        queryKey: trpc.interviewer.transcript.queryKey({ sessionId }),
      });
    }
    // An answer can change what is worth suggesting next (CHTS-5).
    void queryClient.invalidateQueries({ queryKey: trpc.chat.openings.queryKey() });
  };

  const answer = useMutation(trpc.chat.answer.mutationOptions({ onSuccess: refreshTranscript }));

  const applyRedirect = useMutation(
    trpc.chat.applyRedirect.mutationOptions({
      onSuccess: () => {
        refreshTranscript();
        // A bound rule is a Memory write: it changes the profile and the gaps,
        // and it binds the NEXT draft immediately (MEMS-3).
        void queryClient.invalidateQueries({ queryKey: trpc.onboarding.profile.queryKey() });
        void queryClient.invalidateQueries({ queryKey: trpc.onboarding.gaps.queryKey() });
        void queryClient.invalidateQueries({ queryKey: trpc.onboarding.ready.queryKey() });
      },
    }),
  );

  /**
   * Ask Steward a question on the shared session (CHTS-1).
   *
   * The session id is a PARAMETER, not read from the hook's own state: a
   * brand-new org has none until one is opened, and an `if (sessionId)` guard
   * here would swallow the founder's very first message with no error and no
   * message in the stream. The caller resolves it via
   * `useInterviewer().ensureSession()`.
   */
  const askOn = (sessionId: string, question: string): void => {
    answer.mutate({ sessionId, question });
  };

  return {
    openings,
    redirectPreview,
    askOn,
    asking: answer.isPending,
    lastAnswer: answer.data ?? null,
    applyRedirect,
  };
}
