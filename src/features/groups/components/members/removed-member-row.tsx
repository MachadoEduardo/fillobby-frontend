import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getGroupActionErrorMessage } from "@/features/groups/group-errors";
import { api, resolveApiAssetUrl } from "@/lib/api";
import type { Group, Member } from "@/lib/api-types";
import { queryKeys } from "@/lib/query-keys";

export function RemovedMemberRow({
  member,
  group,
}: {
  member: Member;
  group: Group;
}) {
  const queryClient = useQueryClient();
  const restoreMember = useMutation({
    mutationFn: () => api.groups.restoreMember(group.id, member.id),
    onSuccess: () => {
      toast.success("Membro restaurado.");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.members.list(group.id),
      });
    },
    onError: (error) =>
      toast.error(
        getGroupActionErrorMessage(
          error,
          "Não foi possível restaurar o acesso agora. Tente novamente em alguns instantes.",
        ),
      ),
  });

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-wrap items-center gap-3 p-3">
        <Avatar>
          <AvatarImage src={resolveApiAssetUrl(member.avatarUrl)} />
          <AvatarFallback>
            {member.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium">{member.name}</div>
          <div className="text-xs text-muted-foreground">{member.email}</div>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={restoreMember.isPending}
          onClick={() => restoreMember.mutate()}
        >
          {restoreMember.isPending ? "Restaurando..." : "Restaurar acesso"}
        </Button>
      </CardContent>
    </Card>
  );
}
