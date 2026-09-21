import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getGroupActionErrorMessage } from "@/features/groups/group-errors";
import { api } from "@/lib/api";
import type { Group, Member } from "@/lib/api-types";
import { queryKeys } from "@/lib/query-keys";

export function useMemberActions(group: Group, member: Member) {
  const queryClient = useQueryClient();

  function invalidateRelatedQueries() {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.members.list(group.id),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.group.detail(group.id),
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
  }

  const changeRole = useMutation({
    mutationFn: (role: "ADMIN" | "MEMBER") => api.groups.changeRole(group.id, member.id, role),
    onSuccess: () => {
      toast.success("Papel alterado.");
      invalidateRelatedQueries();
    },
    onError: (error) =>
      toast.error(
        getGroupActionErrorMessage(
          error,
          "Não foi possível alterar a permissão agora. Tente novamente em alguns instantes.",
        ),
      ),
  });

  const remove = useMutation({
    mutationFn: () => api.groups.removeMember(group.id, member.id),
    onSuccess: () => {
      toast.success("Membro removido.");
      invalidateRelatedQueries();
    },
    onError: (error) =>
      toast.error(
        getGroupActionErrorMessage(
          error,
          "Não foi possível remover o membro agora. Tente novamente em alguns instantes.",
        ),
      ),
  });

  const transferOwnership = useMutation({
    mutationFn: () => api.groups.transferOwner(group.id, member.id),
    onSuccess: () => {
      toast.success("Propriedade transferida.");
      invalidateRelatedQueries();
    },
    onError: (error) =>
      toast.error(
        getGroupActionErrorMessage(
          error,
          "Não foi possível transferir o grupo agora. Tente novamente em alguns instantes.",
        ),
      ),
  });

  return { changeRole, remove, transferOwnership };
}
