import { useQuery } from "@tanstack/react-query";
import { QueueItemCard } from "@/features/groups/components/queue/queue-item-card";
import { SuggestGameDialog } from "@/features/groups/components/queue/suggest-game-dialog";
import { api, ApiError } from "@/lib/api";
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
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em]">
            Próximos jogos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Vote, reúna os participantes e leve a escolha até a partida.
          </p>
        </div>
        <SuggestGameDialog groupId={group.id} />
      </div>

      {queueQuery.isLoading && (
        <p className="text-sm text-muted-foreground">Carregando fila...</p>
      )}
      {queueQuery.error && (
        <p className="text-sm text-destructive">
          {queueQuery.error instanceof ApiError
            ? queueQuery.error.message
            : "Não foi possível carregar a fila."}
        </p>
      )}
      {queueQuery.data?.queueItems.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand/20 bg-card px-6 py-14 text-center">
          <span className="mono-data text-4xl font-semibold text-signal/55">
            01
          </span>
          <h3 className="mt-3 text-lg font-semibold">A fila está livre</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Sugira o primeiro jogo e dê ao grupo um ponto de partida para a
            próxima sessão.
          </p>
        </div>
      )}
      <div className="space-y-3">
        {queueQuery.data?.queueItems.map((item, index) => (
          <QueueItemCard
            key={item.id}
            item={item}
            group={group}
            position={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
