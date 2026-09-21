import { useQuery } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getGroupLoadErrorMessage } from "@/features/groups/group-errors";
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
    queryFn: () => api.groups.listMembers(group.id, { limit: 100, status: "REMOVED" }),
    enabled: canManageMembers,
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Pessoas do grupo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Veja quem participa e gerencie permissões quando necessário.
          </p>
        </div>
        {membersQuery.data && (
          <span className="shrink-0 text-sm text-muted-foreground">
            {membersQuery.data.meta.total}{" "}
            {membersQuery.data.meta.total === 1 ? "membro" : "membros"}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {membersQuery.isLoading && <MembersSkeleton />}
        {membersQuery.error && !membersQuery.data && (
          <MembersError
            message={getGroupLoadErrorMessage(membersQuery.error, "membros")}
            retrying={membersQuery.isFetching}
            onRetry={() => void membersQuery.refetch()}
          />
        )}
        {membersQuery.data?.members.map((member) => (
          <MemberRow key={member.id} member={member} group={group} />
        ))}
        {membersQuery.data?.members.length === 0 && (
          <div className="rounded-xl border bg-card/70 px-6 py-12 text-center">
            <UsersRound className="mx-auto h-6 w-6 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">Nenhum membro encontrado</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Atualize a página. Se o grupo continuar vazio, volte para seus grupos e tente
              acessá-lo novamente.
            </p>
          </div>
        )}
      </div>

      {canManageMembers && removedMembersQuery.isLoading && (
        <div className="space-y-3 border-t pt-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      )}
      {canManageMembers && removedMembersQuery.error && !removedMembersQuery.data && (
        <div className="border-t pt-6">
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/35 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">
              Não foi possível carregar os acessos removidos.
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={removedMembersQuery.isFetching}
              onClick={() => void removedMembersQuery.refetch()}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      )}
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

function MembersError({
  message,
  retrying,
  onRetry,
}: {
  message: string;
  retrying: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border bg-card/70 px-6 py-10 text-center">
      <CircleAlert className="mx-auto h-6 w-6 text-destructive" />
      <h3 className="mt-3 font-semibold">Não foi possível ver os membros</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-5 bg-transparent"
        disabled={retrying}
        onClick={onRetry}
      >
        {retrying && <LoaderCircle className="animate-spin" aria-hidden />}
        {retrying ? "Tentando novamente..." : "Tentar novamente"}
      </Button>
    </div>
  );
}

function MembersSkeleton() {
  return (
    <div aria-label="Carregando membros" aria-busy="true" className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-xl border bg-card/70 p-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}
