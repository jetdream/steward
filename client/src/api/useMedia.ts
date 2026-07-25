/**
 * Media domain hook — the picture library and the GENS-3 attach (DM-4).
 *
 * LIBRARY FIRST is the ordering GENS-3 asks for, and it is a hook-level
 * decision as much as a UI one: the library is a plain query the composer can
 * read immediately, while upload is a mutation the founder only reaches when
 * nothing in the library fits. Leading with an upload control would ask a
 * time-poor founder to go find a file before they can post at all.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc";

export function useMedia() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const library = useQuery(trpc.media.library.queryOptions());

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: trpc.media.library.queryKey() });
    // Attaching a picture clears `awaiting_picture`, which changes whether a
    // card in the spine can be approved at all (GENS-4).
    void queryClient.invalidateQueries({ queryKey: trpc.approval.readyStack.queryKey() });
  };

  const upload = useMutation(trpc.media.upload.mutationOptions({ onSuccess: refresh }));
  const attach = useMutation(trpc.media.attach.mutationOptions({ onSuccess: refresh }));

  return { library, upload, attach };
}
