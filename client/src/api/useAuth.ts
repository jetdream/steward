/**
 * Auth domain hook — the app's only surface for the dev login/session (the
 * BetterAuth seam, SEC-7/ACCS). Components call this, never tRPC directly.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc";

export function useAuth() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const invalidateMe = () => queryClient.invalidateQueries({ queryKey: trpc.auth.me.queryKey() });

  const me = useQuery(trpc.auth.me.queryOptions());
  const login = useMutation(trpc.auth.devLogin.mutationOptions({ onSuccess: invalidateMe }));
  const logout = useMutation(trpc.auth.logout.mutationOptions({ onSuccess: invalidateMe }));

  return { me, login, logout };
}
