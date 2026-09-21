import { Check, Play, ThumbsDown, ThumbsUp, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmGroupActionDialog } from "@/features/groups/components/confirm-group-action-dialog";
import type { Group, QueueItem } from "@/lib/api-types";
import { useQueueItemActions } from "@/features/groups/hooks/use-queue-item-actions";

type QueueItemActionsProps = {
  group: Group;
  item: QueueItem;
  isReady: boolean;
  canVote: boolean;
  canReady: boolean;
  canSelectParticipants: boolean;
  onSelectParticipants: () => void;
};

export function QueueItemActions({
  group,
  item,
  isReady,
  canVote,
  canReady,
  canSelectParticipants,
  onSelectParticipants,
}: QueueItemActionsProps) {
  const isAdmin = group.role === "OWNER" || group.role === "ADMIN";
  const actions = useQueueItemActions(group.id, item);

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
      {canVote &&
        (actions.hasVoted ? (
          <Button
            size="sm"
            variant="outline"
            disabled={actions.removeVote.isPending}
            onClick={() => actions.removeVote.mutate()}
          >
            <ThumbsDown className="mr-1 h-3 w-3" /> Remover voto
          </Button>
        ) : (
          <Button
            size="sm"
            className="bg-signal text-signal-foreground hover:bg-signal/90"
            disabled={actions.vote.isPending}
            onClick={() => actions.vote.mutate()}
          >
            <ThumbsUp className="mr-1 h-3 w-3" /> Votar neste jogo
          </Button>
        ))}

      {canReady &&
        (isReady ? (
          <Button
            size="sm"
            variant="outline"
            disabled={actions.unmarkReady.isPending}
            onClick={() => actions.unmarkReady.mutate()}
          >
            <X className="mr-1 h-3 w-3" /> Não estou pronto
          </Button>
        ) : (
          <Button
            size="sm"
            className="bg-status-ready text-white hover:bg-status-ready/90"
            disabled={actions.markReady.isPending}
            onClick={() => actions.markReady.mutate()}
          >
            <Check className="mr-1 h-3 w-3" /> Estou pronto
          </Button>
        ))}

      {canSelectParticipants && (
        <Button size="sm" variant="outline" onClick={onSelectParticipants}>
          <Users className="mr-1 h-3 w-3" /> Selecionar participantes
        </Button>
      )}

      {isAdmin && item.status === "SUGGESTED" && (
        <Button
          size="sm"
          disabled={actions.transition.isPending}
          onClick={() => actions.transition.mutate("VOTING")}
        >
          <ThumbsUp className="mr-1 h-3 w-3" /> Iniciar votação
        </Button>
      )}
      {isAdmin && item.status === "READY" && (
        <Button
          size="sm"
          className="bg-signal text-signal-foreground hover:bg-signal/90"
          disabled={actions.transition.isPending}
          onClick={() => actions.transition.mutate("PLAYING")}
        >
          <Play className="mr-1 h-3 w-3" /> Iniciar partida
        </Button>
      )}
      {isAdmin && item.status === "PLAYING" && (
        <Button
          size="sm"
          disabled={actions.transition.isPending}
          onClick={() => actions.transition.mutate("COMPLETED")}
        >
          <Check className="mr-1 h-3 w-3" /> Concluir partida
        </Button>
      )}
      {isAdmin && item.status !== "COMPLETED" && item.status !== "CANCELLED" && (
        <div className="sm:ml-auto">
          <ConfirmGroupActionDialog
            trigger={
              <Button size="sm" variant="ghost">
                <Trash2 /> Cancelar
              </Button>
            }
            title={`Cancelar ${item.game.title}?`}
            description="O jogo sairá da decisão em andamento e não poderá receber novos votos ou participantes."
            confirmLabel="Cancelar sugestão"
            pendingLabel="Cancelando sugestão..."
            pending={actions.cancel.isPending}
            confirmVariant="destructive"
            onConfirm={() => actions.cancel.mutateAsync()}
          />
        </div>
      )}
    </div>
  );
}
