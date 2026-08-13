import { useQuery } from "@tanstack/react-query";
import { MemberRow } from "@/features/groups/components/members/member-row";
import { RemovedMemberRow } from "@/features/groups/components/members/removed-member-row";
import { api } from "@/lib/api";
import type { Group } from "@/lib/api-types";
import { GROUP_LIVE_REFRESH_MS } from "@/lib/query-config";
import { queryKeys } from "@/lib/query-keys";

export function MembersTab({ group }: { group: Group }) {
  const canManageMembers = group.role === "OWNER" || group.role === "ADMIN";
  const membersQuery = useQuery({
    queryKey: queryKeys.members.list(group.id),
    queryFn: () => api.groups.listMembers(group.id, { limit: 100 }),
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });
  const removedMembersQuery = useQuery({
    queryKey: queryKeys.members.removed(group.id),
    queryFn: () =>
      api.groups.listMembers(group.id, { limit: 100, status: "REMOVED" }),
    enabled: canManageMembers,
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {membersQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        )}
        {membersQuery.data?.members.map((member) => (
          <MemberRow key={member.id} member={member} group={group} />
        ))}
      </div>
      {canManageMembers && removedMembersQuery.data?.members.length ? (
        <div className="space-y-3 border-t pt-6">
          <div>
            <h3 className="font-semibold">Membros removidos</h3>
            <p className="text-sm text-muted-foreground">
              Restaure o acesso de quem foi removido anteriormente.
            </p>
          </div>
          {removedMembersQuery.data.members.map((member) => (
            <RemovedMemberRow key={member.id} member={member} group={group} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
