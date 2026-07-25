/**
 * Auth domain hook — the app's only surface for the session (the BetterAuth
 * seam, SEC-7 / ACCS-1). Components call this, never tRPC directly.
 *
 * `signIn` carries the doorstep's two fields (XO-6): the email always, the org
 * name only when the founder is new. The backend ignores `orgName` for anyone
 * who already holds a membership, so the same call serves signup and sign-in —
 * which is what "sign-in thereafter is unremarkable" means in practice.
 *
 * CACHE RULE: signing in or out changes WHICH ORG the cache belongs to, so both
 * reset the whole cache rather than invalidating `auth.me` alone. Every other
 * cached query is org-scoped (ACCS-2 resolves scope from the session), so a
 * surviving entry would render the previous session's org data under the new
 * identity.
 *
 * `resetQueries()`, NOT `clear()` — see LRN-31. `clear()` empties the cache
 * without notifying observers, so a component holding `me` keeps rendering the
 * signed-out user's home forever. `resetQueries()` clears AND refetches the
 * active ones, which is what "start over under the new identity" means.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc";

export function useAuth() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  /** Drop every cached answer and refetch what is on screen — see CACHE RULE. */
  const resetCache = () => queryClient.resetQueries();

  const me = useQuery(trpc.auth.me.queryOptions());
  const signIn = useMutation(trpc.auth.devLogin.mutationOptions({ onSuccess: resetCache }));
  const logout = useMutation(trpc.auth.logout.mutationOptions({ onSuccess: resetCache }));

  return { me, signIn, logout };
}
