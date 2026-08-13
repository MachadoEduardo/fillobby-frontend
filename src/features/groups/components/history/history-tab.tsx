import { useQuery } from "@tanstack/react-query";
import { Gamepad2 } from "lucide-react";
import { useState } from "react";
import { HistoryParticipants } from "@/features/groups/components/people-roster";
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
import { api } from "@/lib/api";
import type { Group, QueueItem } from "@/lib/api-types";
import { GROUP_LIVE_REFRESH_MS } from "@/lib/query-config";
import { queryKeys } from "@/lib/query-keys";

export function HistoryTab({ group }: { group: Group }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [gameId, setGameId] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [page, setPage] = useState(1);

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
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs">De</Label>
            <Input
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Até</Label>
            <Input
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Jogo</Label>
            <Select
              value={gameId || "ALL"}
              onValueChange={(value) => {
                setGameId(value === "ALL" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {gamesQuery.data?.games.map((game) => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Participante</Label>
            <Select
              value={participantId || "ALL"}
              onValueChange={(value) => {
                setParticipantId(value === "ALL" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {membersQuery.data?.members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {historyQuery.isLoading && (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      )}
      {historyQuery.data?.historyItems.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma partida concluída ainda.
        </p>
      )}
      <div className="space-y-2">
        {historyQuery.data?.historyItems.map((item) => (
          <HistoryItem key={item.id} item={item} />
        ))}
      </div>

      {historyQuery.data && historyQuery.data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            {historyQuery.data.meta.page} / {historyQuery.data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= historyQuery.data.meta.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

function HistoryItem({ item }: { item: QueueItem }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <div className="flex items-center gap-3">
          {item.game.coverUrl ? (
            <img
              src={item.game.coverUrl}
              alt=""
              className="h-12 w-12 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-muted-foreground">
              <Gamepad2 className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{item.game.title}</div>
            <div className="text-xs text-muted-foreground">
              Concluído em{" "}
              {item.completedAt
                ? new Date(item.completedAt).toLocaleString("pt-BR")
                : "-"}
            </div>
          </div>
          <Badge variant="outline">{item.voteCount} voto(s)</Badge>
        </div>
        <HistoryParticipants participants={item.participants} />
      </CardContent>
    </Card>
  );
}
