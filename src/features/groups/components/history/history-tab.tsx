import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CircleAlert, Gamepad2, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoryParticipants } from "@/features/groups/components/people-roster";
import { getGroupLoadErrorMessage } from "@/features/groups/group-errors";
import { api, resolveApiAssetUrl } from "@/lib/api";
import type { Group, QueueItem } from "@/lib/api-types";
import { GROUP_LIVE_REFRESH_MS } from "@/lib/query-config";
import { queryKeys } from "@/lib/query-keys";

export function HistoryTab({ group }: { group: Group }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [gameId, setGameId] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [page, setPage] = useState(1);
  const hasActiveFilters = Boolean(from || to || gameId || participantId);
  const invalidDateRange = Boolean(from && to && from > to);

  const gamesQuery = useQuery({
    queryKey: queryKeys.games.all(),
    queryFn: () => api.games.list({ limit: 100 }),
  });
  const membersQuery = useQuery({
    queryKey: queryKeys.members.list(group.id),
    queryFn: () => api.groups.listMembers(group.id, { limit: 100 }),
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });
  const historyQuery = useQuery({
    queryKey: queryKeys.history.list(group.id, {
      from,
      to,
      gameId,
      participantId,
      page,
    }),
    queryFn: () =>
      api.history.list(group.id, {
        from: from || undefined,
        to: to || undefined,
        gameId: gameId || undefined,
        participantId: participantId || undefined,
        page,
        limit: 20,
      }),
    enabled: !invalidDateRange,
    placeholderData: (previousData) => previousData,
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  function clearFilters() {
    setFrom("");
    setTo("");
    setGameId("");
    setParticipantId("");
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Partidas concluídas</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulte as escolhas anteriores e quem participou de cada partida.
        </p>
      </div>

      <Card className="bg-card/70 shadow-none">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold">Filtrar histórico</h3>
            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                <X /> Limpar
              </Button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="history-from" className="text-xs">
                A partir de
              </Label>
              <Input
                id="history-from"
                type="date"
                max={to || undefined}
                value={from}
                aria-invalid={invalidDateRange}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="history-to" className="text-xs">
                Até
              </Label>
              <Input
                id="history-to"
                type="date"
                min={from || undefined}
                value={to}
                aria-invalid={invalidDateRange}
                onChange={(event) => {
                  setTo(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="history-game" className="text-xs">
                Jogo
              </Label>
              <Select
                value={gameId || "ALL"}
                disabled={gamesQuery.isLoading || gamesQuery.isError}
                onValueChange={(value) => {
                  setGameId(value === "ALL" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger id="history-game">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os jogos</SelectItem>
                  {gamesQuery.data?.games.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="history-participant" className="text-xs">
                Participante
              </Label>
              <Select
                value={participantId || "ALL"}
                disabled={membersQuery.isLoading || membersQuery.isError}
                onValueChange={(value) => {
                  setParticipantId(value === "ALL" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger id="history-participant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os participantes</SelectItem>
                  {membersQuery.data?.members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {invalidDateRange && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              A data inicial deve ser anterior ou igual à data final.
            </p>
          )}
          {(gamesQuery.isError || membersQuery.isError) && (
            <p className="mt-3 text-xs text-muted-foreground">
              Alguns filtros estão temporariamente indisponíveis. As datas continuam funcionando
              normalmente.
            </p>
          )}
        </CardContent>
      </Card>

      {!invalidDateRange && historyQuery.isLoading && <HistorySkeleton />}
      {!invalidDateRange && historyQuery.error && !historyQuery.data && (
        <HistoryError
          message={getGroupLoadErrorMessage(historyQuery.error, "histórico")}
          retrying={historyQuery.isFetching}
          onRetry={() => void historyQuery.refetch()}
        />
      )}
      {!invalidDateRange && historyQuery.data?.historyItems.length === 0 && (
        <div className="rounded-xl border bg-card/70 px-6 py-12 text-center">
          <Gamepad2 className="mx-auto h-6 w-6 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">
            {hasActiveFilters
              ? "Nenhuma partida corresponde aos filtros"
              : "Nenhuma partida concluída ainda"}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {hasActiveFilters
              ? "Ajuste o período ou escolha outras opções para ampliar a busca."
              : "As partidas finalizadas pelo grupo aparecerão aqui para consulta."}
          </p>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-5 bg-transparent"
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      )}

      {!invalidDateRange && historyQuery.data && historyQuery.data.historyItems.length > 0 && (
        <section aria-labelledby="history-results-heading">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h3 id="history-results-heading" className="text-sm font-semibold">
                Resultados
              </h3>
              <span className="mt-1 block text-sm text-muted-foreground">
                {historyQuery.data.meta.total}{" "}
                {historyQuery.data.meta.total === 1 ? "partida" : "partidas"}
              </span>
            </div>
            {historyQuery.isFetching && (
              <span role="status" className="flex items-center gap-2 text-xs text-muted-foreground">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Atualizando resultados...
              </span>
            )}
          </div>
          <div className="space-y-2">
            {historyQuery.data.historyItems.map((item) => (
              <HistoryItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {!invalidDateRange && historyQuery.data && historyQuery.data.meta.totalPages > 1 && (
        <nav
          aria-label="Paginação do histórico"
          className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full bg-transparent sm:w-auto"
            disabled={page <= 1 || historyQuery.isFetching}
            onClick={() => setPage((current) => current - 1)}
          >
            <ChevronLeft /> Anterior
          </Button>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            Página {historyQuery.data.meta.page} de {historyQuery.data.meta.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full bg-transparent sm:w-auto"
            disabled={page >= historyQuery.data.meta.totalPages || historyQuery.isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima <ChevronRight />
          </Button>
        </nav>
      )}
    </div>
  );
}

function HistoryItem({ item }: { item: QueueItem }) {
  const coverUrl = resolveApiAssetUrl(item.game.coverUrl);

  return (
    <Card
      role="article"
      aria-label={`Partida concluída: ${item.game.title}`}
      className="bg-card/70 shadow-none"
    >
      <CardContent className="space-y-3 p-3">
        <div className="flex items-center gap-3">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`Capa de ${item.game.title}`}
              loading="lazy"
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Gamepad2 className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{item.game.title}</div>
            <div className="text-xs text-muted-foreground">
              {formatCompletionDate(item.completedAt)}
            </div>
          </div>
          <Badge variant="outline">
            {item.voteCount} {item.voteCount === 1 ? "voto" : "votos"}
          </Badge>
        </div>
        <HistoryParticipants participants={item.participants} />
      </CardContent>
    </Card>
  );
}

function HistoryError({
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
      <h3 className="mt-3 font-semibold">Não foi possível ver o histórico</h3>
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

function HistorySkeleton() {
  return (
    <div aria-label="Carregando histórico" aria-busy="true" className="space-y-2">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-xl border p-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

function formatCompletionDate(completedAt: string | null | undefined) {
  if (!completedAt) return "Data de conclusão não disponível";
  const date = new Date(completedAt);
  if (Number.isNaN(date.getTime())) return "Data de conclusão não disponível";

  return `Concluído em ${new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)}`;
}
