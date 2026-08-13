import type { UseQueryResult } from "@tanstack/react-query";
import type { Group, PaginationMeta } from "@/lib/api-types";
import { ApiError } from "@/lib/api";
import { GroupCard } from "@/features/groups/components/group-card";

type GroupsResponse = {
  groups: Group[];
  meta: PaginationMeta;
};

type GroupsListProps = {
  query: UseQueryResult<GroupsResponse, Error>;
};

export function GroupsList({ query }: GroupsListProps) {
  if (query.isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Carregando grupos...</p>
    );
  }

  if (query.error) {
    return (
      <p className="text-sm text-destructive">
        {query.error instanceof ApiError
          ? query.error.message
          : "Não foi possível carregar os grupos."}
      </p>
    );
  }

  if (!query.data) return null;

  if (query.data.groups.length === 0) {
    return <EmptyGroups />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {query.data.groups.map((group, index) => (
        <GroupCard key={group.id} group={group} position={index + 1} />
      ))}
    </div>
  );
}

function EmptyGroups() {
  return (
    <div className="rounded-2xl border border-dashed border-brand/20 bg-card px-6 py-14 text-center">
      <span className="mono-data text-4xl font-semibold text-signal/55">
        00
      </span>
      <h2 className="mt-3 text-lg font-semibold">Nenhum lobby aberto</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Crie um grupo para reunir seus amigos ou use o código de um convite que
        você recebeu.
      </p>
    </div>
  );
}
