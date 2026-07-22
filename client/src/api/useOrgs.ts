/**
 * Orgs domain hook — lists and creates organizations (DM-1) via the protected
 * tRPC procedures. Components call this, never tRPC directly.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc";

export function useOrgs() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const list = useQuery(trpc.org.list.queryOptions());
  const create = useMutation(
    trpc.org.create.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: trpc.org.list.queryKey() }),
    }),
  );

  return { list, create };
}
