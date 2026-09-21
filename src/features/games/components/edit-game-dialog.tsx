import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Gamepad2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GameForm } from "@/features/games/components/game-form";
import { getSaveGameErrorMessage } from "@/features/games/game-errors";
import type { GameFormValues } from "@/features/games/types";
import { api } from "@/lib/api";
import type { Game } from "@/lib/api-types";
import { queryKeys } from "@/lib/query-keys";

type EditGameDialogProps = {
  game: Game;
};

export function EditGameDialog({ game }: EditGameDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const queryClient = useQueryClient();
  const updateGame = useMutation({
    mutationFn: (values: GameFormValues) => api.games.update(game.id, values),
    onSuccess: () => {
      toast.success("Alterações salvas.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.games.root() });
      setOpen(false);
      resetMutation();
    },
    onError: (error) => setFormError(getSaveGameErrorMessage(error)),
  });

  function resetMutation() {
    setFormError("");
    updateGame.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetMutation();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="bg-transparent">
          <Pencil /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-2xl gap-0 overflow-y-auto bg-card p-0">
        <DialogHeader className="border-b px-6 py-5 pr-12 text-left">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border bg-muted text-foreground">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl">Editar jogo</DialogTitle>
          <DialogDescription className="pt-1 leading-relaxed">
            Atualize as informações de {game.title} exibidas no catálogo.
          </DialogDescription>
        </DialogHeader>
        <GameForm
          initial={game}
          submitting={updateGame.isPending}
          submitLabel="Salvar alterações"
          pendingLabel="Salvando alterações..."
          operationError={formError}
          onChange={resetMutation}
          onSubmit={(values) => updateGame.mutate(values)}
        />
      </DialogContent>
    </Dialog>
  );
}
