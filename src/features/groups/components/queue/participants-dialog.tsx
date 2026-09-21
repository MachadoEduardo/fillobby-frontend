import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, UsersRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getGroupActionErrorMessage,
  getGroupLoadErrorMessage,
} from "@/features/groups/group-errors";
import { api, resolveApiAssetUrl } from "@/lib/api";
import type { Group, QueueItem } from "@/lib/api-types";
import { GROUP_LIVE_REFRESH_MS } from "@/lib/query-config";
import { queryKeys } from "@/lib/query-keys";

type ParticipantsDialogProps = {
  group: Group;
  item: QueueItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ParticipantsDialog({ group, item, open, onOpenChange }: ParticipantsDialogProps) {
  const [selected, setSelected] = useState<string[]>(item.participantIds);
  const [operationError, setOperationError] = useState("");
  const queryClient = useQueryClient();
  const membersQuery = useQuery({
    queryKey: queryKeys.members.list(group.id),
    queryFn: () => api.groups.listMembers(group.id, { limit: 100 }),
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
    enabled: open,
  });
  const updateParticipants = useMutation({
    mutationFn: () => api.queue.setParticipants(group.id, item.id, selected),
    onSuccess: () => {
      toast.success("Participantes atualizados.");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.queue.list(group.id),
      });
      onOpenChange(false);
    },
    onError: (error) =>
      setOperationError(
        getGroupActionErrorMessage(
          error,
          "Não foi possível salvar os participantes agora. Tente novamente em alguns instantes.",
        ),
      ),
  });

  function toggleParticipant(memberId: string) {
    setOperationError("");
    setSelected((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : item.game.maxPlayers && current.length >= item.game.maxPlayers
          ? current
          : [...current, memberId],
    );
  }

  const reachedLimit = Boolean(item.game.maxPlayers && selected.length >= item.game.maxPlayers);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-md gap-0 overflow-y-auto bg-card p-0">
        <DialogHeader className="border-b px-6 py-5 pr-12 text-left">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border bg-muted text-foreground">
            <UsersRound className="h-5 w-5" />
          </div>
          <DialogTitle>Selecionar participantes</DialogTitle>
          <DialogDescription>Escolha quem participará de {item.game.title}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              {item.game.maxPlayers
                ? `Até ${item.game.maxPlayers} jogadores`
                : "Sem limite informado"}
            </span>
            <span className="font-medium">
              {selected.length} selecionado{selected.length === 1 ? "" : "s"}
            </span>
          </div>
          {reachedLimit && (
            <p className="text-xs text-muted-foreground">
              Limite atingido. Desmarque alguém para escolher outra pessoa.
            </p>
          )}
          {membersQuery.isLoading && (
            <div aria-label="Carregando membros" aria-busy="true" className="space-y-2">
              {[0, 1, 2].map((entry) => (
                <Skeleton key={entry} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          )}
          {membersQuery.error && (
            <div role="alert" className="space-y-3 rounded-lg border bg-muted/35 p-4 text-sm">
              <p className="text-muted-foreground">
                {getGroupLoadErrorMessage(membersQuery.error, "membros")}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void membersQuery.refetch()}
              >
                Tentar novamente
              </Button>
            </div>
          )}
          <div className="space-y-2">
            {membersQuery.data?.members.map((member) => (
              <label
                key={member.id}
                className="flex min-h-12 items-center gap-3 rounded-lg border bg-background p-2.5 transition-colors hover:bg-accent"
              >
                <Checkbox
                  checked={selected.includes(member.id)}
                  disabled={
                    updateParticipants.isPending || (reachedLimit && !selected.includes(member.id))
                  }
                  onCheckedChange={() => toggleParticipant(member.id)}
                />
                <Avatar className="h-8 w-8">
                  <AvatarImage src={resolveApiAssetUrl(member.avatarUrl)} />
                  <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{member.name}</span>
              </label>
            ))}
          </div>
          {operationError && (
            <div
              role="alert"
              className="flex gap-3 rounded-lg border border-destructive/35 bg-destructive/10 px-3 py-3 text-sm text-foreground"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p>{operationError}</p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 border-t bg-muted/35 px-6 py-4 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={updateParticipants.isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            disabled={updateParticipants.isPending || selected.length === 0}
            onClick={() => updateParticipants.mutate()}
          >
            {updateParticipants.isPending && <LoaderCircle className="animate-spin" aria-hidden />}
            {updateParticipants.isPending ? "Salvando participantes..." : "Salvar participantes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
