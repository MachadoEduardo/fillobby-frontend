import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CircleAlert, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupDetailTabs } from "@/features/groups/components/group-detail-tabs";
import { GroupHeader } from "@/features/groups/components/group-header";
import { groupDetailQuery } from "@/features/groups/queries";
import { ApiError } from "@/lib/api";

export function GroupDetailPage({ groupId }: { groupId: string }) {
  const groupQuery = useQuery(groupDetailQuery(groupId));

  if (groupQuery.isLoading) {
    return <GroupDetailSkeleton />;
  }

  if (groupQuery.error && !groupQuery.data) {
    return (
      <GroupDetailError
        error={groupQuery.error}
        retrying={groupQuery.isFetching}
        onRetry={() => void groupQuery.refetch()}
      />
    );
  }

  if (!groupQuery.data) return null;

  return (
    <div className="space-y-8">
      <GroupHeader group={groupQuery.data} />
      <GroupDetailTabs group={groupQuery.data} />
    </div>
  );
}

function GroupDetailError({
  error,
  retrying,
  onRetry,
}: {
  error: Error;
  retrying: boolean;
  onRetry: () => void;
}) {
  const groupUnavailable =
    error instanceof ApiError && (error.status === 403 || error.status === 404);

  return (
    <div className="rounded-xl border bg-card/70 px-6 py-12 text-center">
      <CircleAlert className="mx-auto h-6 w-6 text-destructive" />
      <h1 className="mt-3 text-lg font-semibold">
        {groupUnavailable
          ? "Este grupo não está disponível"
          : "Não foi possível abrir o grupo"}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {groupUnavailable
          ? "Ele pode ter sido encerrado ou você pode não ter mais acesso. Confira seus outros grupos."
          : "Verifique sua conexão e tente novamente. Se o problema continuar, volte para a lista de grupos."}
      </p>
      <div className="mt-5 flex flex-col-reverse justify-center gap-2 sm:flex-row">
        <Button asChild variant="ghost">
          <Link to="/groups">
            <ArrowLeft /> Voltar para grupos
          </Link>
        </Button>
        {!groupUnavailable && (
          <Button
            type="button"
            variant="outline"
            disabled={retrying}
            onClick={onRetry}
          >
            {retrying && <LoaderCircle className="animate-spin" aria-hidden />}
            {retrying ? "Tentando novamente..." : "Tentar novamente"}
          </Button>
        )}
      </div>
    </div>
  );
}

function GroupDetailSkeleton() {
  return (
    <div aria-label="Carregando informações do grupo" aria-busy="true">
      <div className="rounded-xl border bg-card/70 px-5 py-6 sm:px-7 sm:py-8">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-3 pt-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-2/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </div>
      <div className="mt-8 border-b pb-3">
        <div className="flex gap-5">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-5 w-16" />
          ))}
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
