import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmGroupActionDialog } from "@/features/groups/components/confirm-group-action-dialog";
import { getGroupActionErrorMessage } from "@/features/groups/group-errors";
import { api } from "@/lib/api";
import type { Group, VotingRound } from "@/lib/api-types";
import { GROUP_LIVE_REFRESH_MS } from "@/lib/query-config";
import { queryKeys } from "@/lib/query-keys";

function actionError(error: unknown) {
  return getGroupActionErrorMessage(
    error,
    "Não foi possível atualizar a votação. Tente novamente.",
  );
}

export function VotingRoundsPanel({
  group,
  hasSuggestions,
  hasLegacyVoting,
}: {
  group: Group;
  hasSuggestions: boolean;
  hasLegacyVoting: boolean;
}) {
  const isAdmin = group.role === "OWNER" || group.role === "ADMIN";
  const queryClient = useQueryClient();
  const rounds = useQuery({
    queryKey: queryKeys.votingRounds.list(group.id),
    queryFn: () => api.votingRounds.list(group.id),
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });
  const active = rounds.data?.rounds.find((round) => round.status === "OPEN");
  const finished = rounds.data?.rounds.filter((round) => round.status !== "OPEN") ?? [];

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.votingRounds.list(group.id) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.queue.list(group.id) });
  }

  if (rounds.isLoading)
    return <p className="text-sm text-muted-foreground">Carregando votação...</p>;
  if (rounds.error && !rounds.data)
    return (
      <div role="alert" className="rounded-lg border bg-card p-4 text-sm">
        <p>Não foi possível carregar a votação.</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => void rounds.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );

  return (
    <section aria-label="Votação do grupo" className="space-y-3">
      {active ? (
        <ActiveRound groupId={group.id} round={active} isAdmin={isAdmin} onChange={refresh} />
      ) : isAdmin && hasLegacyVoting ? (
        <p className="rounded-lg border bg-muted/35 p-4 text-sm text-muted-foreground">
          Finalize as votações antigas selecionando participantes ou cancelando os itens antes de
          abrir uma rodada.
        </p>
      ) : isAdmin && hasSuggestions ? (
        <StartRoundDialog groupId={group.id} onChange={refresh} />
      ) : null}

      {finished[0] && (
        <div className="rounded-xl border bg-card p-4 text-sm">
          <h3 className="font-semibold">Última votação</h3>
          <RoundResult round={finished[0]} />
          {finished.length > 1 && (
            <details className="mt-3 border-t pt-3">
              <summary className="cursor-pointer text-muted-foreground">
                Ver resultados anteriores
              </summary>
              <div className="mt-3 space-y-3">
                {finished.slice(1).map((round) => (
                  <RoundResult key={round.id} round={round} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </section>
  );
}

function StartRoundDialog({ groupId, onChange }: { groupId: string; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const suggestions = useQuery({
    queryKey: [...queryKeys.queue.list(groupId), "suggestions"],
    queryFn: () => api.queue.list(groupId, { status: "SUGGESTED", limit: 100 }),
    enabled: open,
  });
  const start = useMutation({
    mutationFn: () => api.votingRounds.start(groupId, selected),
    onSuccess: () => {
      setOpen(false);
      setSelected([]);
      onChange();
      toast.success("Votação iniciada.");
    },
    onError: (error) => toast.error(actionError(error)),
  });

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Iniciar votação</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escolher jogos da votação</DialogTitle>
          <DialogDescription>
            Selecione até 20 sugestões. Cada membro pode aprovar mais de um jogo.
          </DialogDescription>
        </DialogHeader>
        {suggestions.isLoading && (
          <p className="text-sm text-muted-foreground">Carregando sugestões...</p>
        )}
        {suggestions.error && (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar as sugestões. Feche e tente novamente.
          </p>
        )}
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {suggestions.data?.queueItems.map((item) => (
            <label
              key={item.id}
              htmlFor={`round-candidate-${item.id}`}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm"
            >
              <Checkbox
                id={`round-candidate-${item.id}`}
                checked={selected.includes(item.id)}
                disabled={!selected.includes(item.id) && selected.length >= 20}
                onCheckedChange={() => toggle(item.id)}
              />
              <span>{item.game.title}</span>
            </label>
          ))}
        </div>
        {suggestions.data?.queueItems.length === 0 && (
          <p className="text-sm text-muted-foreground">Ainda não há sugestões disponíveis.</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Voltar
          </Button>
          <Button
            disabled={selected.length === 0 || start.isPending}
            onClick={() => start.mutate()}
          >
            {start.isPending
              ? "Iniciando..."
              : `Iniciar com ${selected.length} jogo${selected.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActiveRound({
  groupId,
  round,
  isAdmin,
  onChange,
}: {
  groupId: string;
  round: VotingRound;
  isAdmin: boolean;
  onChange: () => void;
}) {
  const [closeOpen, setCloseOpen] = useState(false);
  const [chosen, setChosen] = useState("");
  const maxVotes = Math.max(...round.candidates.map((candidate) => candidate.voteCount));
  const leaders = round.candidates.filter((candidate) => candidate.voteCount === maxVotes);
  const tied = maxVotes > 0 && leaders.length > 1;
  const close = useMutation({
    mutationFn: () => api.votingRounds.close(groupId, round.id, tied ? chosen : undefined),
    onSuccess: () => {
      setCloseOpen(false);
      setChosen("");
      onChange();
      toast.success("Resultado da votação registrado.");
    },
    onError: (error) => toast.error(actionError(error)),
  });
  const cancel = useMutation({
    mutationFn: () => api.votingRounds.cancel(groupId, round.id),
    onSuccess: () => {
      onChange();
      toast.success("Rodada cancelada; sugestões disponíveis novamente.");
    },
    onError: (error) => toast.error(actionError(error)),
  });

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="font-semibold">Votação aberta</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Aprove os jogos que você gostaria de jogar. O administrador encerra a votação.
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        {round.candidates.map((candidate) => (
          <li key={candidate.itemId} className="flex justify-between gap-3">
            <span>{candidate.gameTitle}</span>
            <span>
              {candidate.voteCount} voto{candidate.voteCount === 1 ? "" : "s"}
            </span>
          </li>
        ))}
      </ul>
      {isAdmin && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={maxVotes === 0}>
                Encerrar votação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Encerrar votação?</DialogTitle>
                <DialogDescription>
                  O vencedor seguirá para a seleção de participantes. Os demais jogos voltarão às
                  sugestões, com os votos zerados.
                </DialogDescription>
              </DialogHeader>
              {tied ? (
                <div className="space-y-2 text-sm">
                  <p>Houve empate. Escolha um dos jogos mais votados:</p>
                  {leaders.map((candidate) => (
                    <label
                      key={candidate.itemId}
                      className="flex items-center gap-2 rounded-lg border p-3"
                    >
                      <input
                        type="radio"
                        name="round-winner"
                        value={candidate.itemId}
                        checked={chosen === candidate.itemId}
                        onChange={() => setChosen(candidate.itemId)}
                      />
                      {candidate.gameTitle}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm">Mais votado: {leaders[0]?.gameTitle}</p>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setCloseOpen(false)}>
                  Voltar
                </Button>
                <Button
                  disabled={close.isPending || (tied && !chosen)}
                  onClick={() => close.mutate()}
                >
                  {close.isPending ? "Encerrando..." : "Confirmar resultado"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <ConfirmGroupActionDialog
            trigger={
              <Button size="sm" variant="outline">
                Cancelar rodada
              </Button>
            }
            title="Cancelar votação?"
            description="Os jogos voltarão às sugestões e os votos desta rodada serão removidos."
            confirmLabel="Cancelar votação"
            pendingLabel="Cancelando..."
            pending={cancel.isPending}
            confirmVariant="destructive"
            onConfirm={() => cancel.mutateAsync()}
          />
          {maxVotes === 0 && (
            <p className="w-full text-sm text-muted-foreground">
              Sem votos, cancele a rodada para liberar as sugestões.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RoundResult({ round }: { round: VotingRound }) {
  if (round.status === "CANCELLED")
    return (
      <p className="mt-2 text-muted-foreground">
        Rodada cancelada por {round.closedBy?.name ?? "um administrador"}.
      </p>
    );
  const winner = round.candidates.find((candidate) => candidate.itemId === round.winnerItemId);
  return (
    <div className="mt-2">
      <p className="font-medium">
        Vencedor: {winner?.gameTitle} ({winner?.voteCount} voto{winner?.voteCount === 1 ? "" : "s"})
      </p>
      <p className="text-muted-foreground">
        Resultado registrado por {round.closedBy?.name ?? "um administrador"}.
      </p>
      <ul className="mt-2 text-muted-foreground">
        {round.candidates.map((candidate) => (
          <li key={candidate.itemId}>
            {candidate.gameTitle}: {candidate.voteCount}
          </li>
        ))}
      </ul>
    </div>
  );
}
