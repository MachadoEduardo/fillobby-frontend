import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError, resolveApiAssetUrl } from "@/lib/api";
import type { Group, QueueItem } from "@/lib/api-types";
import { GROUP_LIVE_REFRESH_MS } from "@/lib/query-config";
import { queryKeys } from "@/lib/query-keys";

type ParticipantsDialogProps = {
  group: Group;
  item: QueueItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ParticipantsDialog({
  group,
  item,
  open,
  onOpenChange,
}: ParticipantsDialogProps) {
  const [selected, setSelected] = useState<string[]>(item.participantIds);
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
      toast.error(error instanceof ApiError ? error.message : "Erro."),
  });

  function toggleParticipant(memberId: string) {
    setSelected((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecionar participantes</DialogTitle>
        </DialogHeader>
        {item.game.maxPlayers && (
          <p className="text-xs text-muted-foreground">
            Máximo: {item.game.maxPlayers} jogadores (selecionados:{" "}
            {selected.length}
            ).
          </p>
        )}
        {membersQuery.isLoading && <p className="text-sm">Carregando...</p>}
        <div className="space-y-2">
          {membersQuery.data?.members.map((member) => (
            <label
              key={member.id}
              className="flex items-center gap-3 rounded p-2 hover:bg-accent"
            >
              <Checkbox
                checked={selected.includes(member.id)}
                onCheckedChange={() => toggleParticipant(member.id)}
              />
              <Avatar className="h-8 w-8">
                <AvatarImage src={resolveApiAssetUrl(member.avatarUrl)} />
                <AvatarFallback>
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{member.name}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button
            disabled={updateParticipants.isPending || selected.length === 0}
            onClick={() => updateParticipants.mutate()}
          >
            {updateParticipants.isPending
              ? "Salvando..."
              : "Salvar participantes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
