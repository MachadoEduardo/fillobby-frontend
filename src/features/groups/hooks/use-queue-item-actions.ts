import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getGroupActionErrorMessage } from "@/features/groups/group-errors";
import { api, ApiError } from "@/lib/api";
import type { QueueItem } from "@/lib/api-types";
import { queryKeys } from "@/lib/query-keys";

type QueueTransition = "VOTING" | "PLAYING" | "COMPLETED";

export function useQueueItemActions(groupId: string, item: QueueItem) {
  const queryClient = useQueryClient();
  const [optimisticVote, setOptimisticVote] = useState<boolean | null>(null);

  function invalidateRelatedQueries() {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.queue.list(groupId),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.history.root(groupId),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.votes.list(groupId, item.id),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.votingRounds.list(groupId),
    });
  }

  const vote = useMutation({
    mutationFn: () => api.votes.create(groupId, item.id),
    onSuccess: () => {
      setOptimisticVote(true);
      invalidateRelatedQueries();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "VOTE_ALREADY_EXISTS") {
        setOptimisticVote(true);
        return;
      }
      toast.error(getQueueActionError(error));
    },
  });

  const removeVote = useMutation({
    mutationFn: () => api.votes.removeOwn(groupId, item.id),
    onSuccess: () => {
      setOptimisticVote(false);
      invalidateRelatedQueries();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "VOTE_NOT_FOUND") {
        setOptimisticVote(false);
        return;
      }
      toast.error(getQueueActionError(error));
    },
  });

  const markReady = useMutation({
    mutationFn: () => api.queue.markReady(groupId, item.id),
    onSuccess: invalidateRelatedQueries,
    onError: (error) => toast.error(getQueueActionError(error)),
  });

  const unmarkReady = useMutation({
    mutationFn: () => api.queue.unmarkReady(groupId, item.id),
    onSuccess: invalidateRelatedQueries,
    onError: (error) => toast.error(getQueueActionError(error)),
  });

  const transition = useMutation({
    mutationFn: (status: QueueTransition) => api.queue.transition(groupId, item.id, status),
    onSuccess: invalidateRelatedQueries,
    onError: (error) => toast.error(getQueueActionError(error)),
  });

  const cancel = useMutation({
    mutationFn: () => api.queue.cancel(groupId, item.id),
    onSuccess: () => {
      toast.success("Item cancelado.");
      invalidateRelatedQueries();
    },
    onError: (error) => toast.error(getQueueActionError(error)),
  });

  return {
    hasVoted: optimisticVote ?? item.viewerHasVoted,
    vote,
    removeVote,
    markReady,
    unmarkReady,
    transition,
    cancel,
  };
}

function getQueueActionError(error: unknown) {
  return getGroupActionErrorMessage(
    error,
    "Não foi possível atualizar a fila agora. Tente novamente em alguns instantes.",
  );
}
