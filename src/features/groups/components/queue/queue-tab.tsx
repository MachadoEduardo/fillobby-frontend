import { useQuery } from "@tanstack/react-query";
import { CircleAlert, Gamepad2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getGroupLoadErrorMessage } from "@/features/groups/group-errors";
import { QueueItemCard } from "@/features/groups/components/queue/queue-item-card";
import { SuggestGameDialog } from "@/features/groups/components/queue/suggest-game-dialog";
import { api } from "@/lib/api";
import type { Group } from "@/lib/api-types";
import { GROUP_LIVE_REFRESH_MS } from "@/lib/query-config";
import { queryKeys } from "@/lib/query-keys";

export function QueueTab({ group }: { group: Group }) {
  const queueQuery = useQuery({
    queryKey: queryKeys.queue.list(group.id),
    queryFn: () => api.queue.list(group.id, { limit: 50, sort: "votes_desc" }),
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Decisão em andamento</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em]">Próximos jogos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Vote, reúna os participantes e leve a escolha até a partida.
          </p>
        </div>
        <SuggestGameDialog groupId={group.id} />
      </div>

      {queueQuery.isLoading && <QueueSkeleton />}
      {queueQuery.error && !queueQuery.data && (
        <QueueError
          message={getGroupLoadErrorMessage(queueQuery.error, "fila")}
          retrying={queueQuery.isFetching}
          onRetry={() => void queueQuery.refetch()}
        />
      )}
      {queueQuery.error && queueQuery.data && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-lg border bg-muted/35 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="text-muted-foreground">
            Não foi possível atualizar a fila. Você ainda está vendo os dados anteriores.
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={queueQuery.isFetching}
            onClick={() => void queueQuery.refetch()}
          >
            Tentar atualizar
          </Button>
        </div>
      )}
      {queueQuery.data?.queueItems.length === 0 && (
        <div className="rounded-xl border bg-card/70 px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border bg-muted text-foreground">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">A fila está livre</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Sugira o primeiro jogo e dê ao grupo um ponto de partida para a próxima sessão.
          </p>
        </div>
      )}
      <div className="space-y-3">
        {queueQuery.data?.queueItems.map((item, index) => (
          <QueueItemCard key={item.id} item={item} group={group} position={index + 1} />
        ))}
      </div>
    </div>
  );
}

function QueueError({
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
      <h3 className="mt-3 font-semibold">Não foi possível abrir a fila</h3>
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

function QueueSkeleton() {
  return (
    <div aria-label="Carregando fila de jogos" aria-busy="true" className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-xl border bg-card/70 p-5">
          <div className="flex gap-4">
            <Skeleton className="h-24 w-20 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
