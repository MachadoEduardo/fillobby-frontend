import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
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
    mutationFn: (role: "ADMIN" | "MEMBER") =>
      api.groups.changeRole(group.id, member.id, role),
    onSuccess: () => {
      toast.success("Papel alterado.");
      invalidateRelatedQueries();
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Erro."),
  });

  const remove = useMutation({
    mutationFn: () => api.groups.removeMember(group.id, member.id),
    onSuccess: () => {
      toast.success("Membro removido.");
      invalidateRelatedQueries();
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Erro."),
  });

  const transferOwnership = useMutation({
    mutationFn: () => api.groups.transferOwner(group.id, member.id),
    onSuccess: () => {
      toast.success("Propriedade transferida.");
      invalidateRelatedQueries();
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Erro."),
  });

  return { changeRole, remove, transferOwnership };
}
