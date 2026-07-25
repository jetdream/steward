/**
 * Interviewer domain hook — the in-stream interview (INTS-1/2/4).
 *
 * RESUMPTION is the load-bearing part, and this hook owns it end to end so no
 * caller can get it wrong. INTS-2 promises the interview is resumable forever,
 * so the hook reads `interviewer.session` first and only opens a new one when
 * the org has genuinely never talked. Starting a fresh session per page load
 * would keep the transcript in the database and lose it from the founder's
 * view — which reads as Steward forgetting the conversation you just had.
 *
 * `nextQuestions` is a MUTATION though it reads like a query: it records the
 * questions on the transcript, so asking twice would double them.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "../trpc";

export function useInterviewer() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const session = useQuery(trpc.interviewer.session.queryOptions());
  const openQuestions = useQuery(trpc.interviewer.openQuestions.queryOptions());

  // A session opened in THIS visit wins over the fetched one only until the
  // query catches up; both resolve to the same row.
  const [openedNow, setOpenedNow] = useState<string | null>(null);
  const sessionId = openedNow ?? session.data?.id ?? null;

  // The transcript exists only once a session does; `enabled` keeps it from
  // firing with a placeholder id.
  const transcript = useQuery(
    trpc.interviewer.transcript.queryOptions(
      { sessionId: sessionId ?? "" },
      { enabled: sessionId !== null },
    ),
  );

  const refreshSession = () => {
    void queryClient.invalidateQueries({ queryKey: trpc.interviewer.session.queryKey() });
    if (sessionId !== null) {
      void queryClient.invalidateQueries({
        queryKey: trpc.interviewer.transcript.queryKey({ sessionId }),
      });
    }
  };

  /** An answer is a Memory write, so everything derived from Memory moves too. */
  const refreshKnowledge = () => {
    void queryClient.invalidateQueries({ queryKey: trpc.onboarding.gaps.queryKey() });
    void queryClient.invalidateQueries({ queryKey: trpc.onboarding.profile.queryKey() });
    void queryClient.invalidateQueries({ queryKey: trpc.onboarding.ready.queryKey() });
    void queryClient.invalidateQueries({ queryKey: trpc.interviewer.openQuestions.queryKey() });
  };

  const startSession = useMutation(trpc.interviewer.startSession.mutationOptions());
  const nextQuestions = useMutation(
    trpc.interviewer.nextQuestions.mutationOptions({ onSuccess: refreshSession }),
  );
  const answer = useMutation(
    trpc.interviewer.answer.mutationOptions({
      onSuccess: () => {
        refreshSession();
        refreshKnowledge();
      },
    }),
  );

  /**
   * The id of the conversation, opening it if this org has never talked.
   *
   * Every write to the conversation goes through here, including chat's — the
   * session is SHARED (DEC-18), and a caller that skips this silently drops the
   * founder's first message on the floor, because a brand-new org has no session
   * to write to and no way to notice.
   */
  const ensureSession = async (): Promise<string> => {
    if (sessionId !== null) return sessionId;
    const id = (await startSession.mutateAsync()).id;
    setOpenedNow(id);
    void queryClient.invalidateQueries({ queryKey: trpc.interviewer.session.queryKey() });
    return id;
  };

  /**
   * Ask the next few questions, resuming the session or opening the first one.
   * The only entry point — a caller that could start a session itself is a
   * caller that can strand a transcript.
   */
  const ask = async (): Promise<void> => {
    await nextQuestions.mutateAsync({ sessionId: await ensureSession() });
  };

  /** Record the founder's answer on the conversation. */
  const reply = async (text: string): Promise<void> => {
    await answer.mutateAsync({ sessionId: await ensureSession(), answer: text });
  };

  return {
    session,
    sessionId,
    ensureSession,
    transcript,
    openQuestions,
    ask,
    reply,
    asking: startSession.isPending || nextQuestions.isPending,
    replying: answer.isPending,
  };
}
