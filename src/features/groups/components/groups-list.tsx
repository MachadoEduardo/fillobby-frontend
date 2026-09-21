import type { UseQueryResult } from "@tanstack/react-query";
import { CircleAlert, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import FadeContent from "@/components/fade-content";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
    return <GroupsListSkeleton />;
  }

  if (query.error) {
    return (
      <GroupsContentFade>
        <div className="rounded-xl border bg-card/70 px-5 py-8 text-center">
          <CircleAlert className="mx-auto h-6 w-6 text-destructive" />
          <h2 className="mt-3 font-semibold">Não foi possível carregar seus grupos</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {query.error instanceof ApiError
              ? query.error.message
              : "Tente novamente em alguns instantes."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-5 bg-transparent"
            onClick={() => void query.refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      </GroupsContentFade>
    );
  }

  if (!query.data) return null;

  if (query.data.groups.length === 0) {
    return (
      <GroupsContentFade>
        <EmptyGroups />
      </GroupsContentFade>
    );
  }

  return (
    <GroupsContentFade>
      <section aria-labelledby="groups-list-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="groups-list-heading" className="text-sm font-semibold">
            Grupos disponíveis
          </h2>
          <p className="text-sm text-muted-foreground">
            {query.data.meta.total} {query.data.meta.total === 1 ? "grupo" : "grupos"}
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {query.data.groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      </section>
    </GroupsContentFade>
  );
}

function GroupsContentFade({ children }: { children: ReactNode }) {
  return (
    <FadeContent duration={470} initialOpacity={0} threshold={0.05} respectReducedMotion>
      {children}
    </FadeContent>
  );
}

function EmptyGroups() {
  return (
    <div className="rounded-xl border bg-card/70 px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border bg-muted text-foreground">
        <UsersRound className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Nenhum grupo por aqui</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Crie um grupo para reunir seus amigos ou use o código de um convite que você recebeu.
      </p>
    </div>
  );
}

function GroupsListSkeleton() {
  return (
    <div aria-label="Carregando grupos" aria-busy="true">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="rounded-xl border bg-card/70 p-5">
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-2/5" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
