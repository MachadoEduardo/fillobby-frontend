import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getDeactivateGameErrorMessage } from "@/features/games/game-errors";
import { api } from "@/lib/api";
import type { Game } from "@/lib/api-types";
import { queryKeys } from "@/lib/query-keys";

type DeactivateGameDialogProps = {
  game: Game;
};

export function DeactivateGameDialog({ game }: DeactivateGameDialogProps) {
  const [open, setOpen] = useState(false);
  const [operationError, setOperationError] = useState("");
  const queryClient = useQueryClient();
  const deactivateGame = useMutation({
    mutationFn: () => api.games.deactivate(game.id),
    onSuccess: () => {
      toast.success("Jogo removido do catálogo.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.games.root() });
      setOpen(false);
    },
    onError: (error) => setOperationError(getDeactivateGameErrorMessage(error)),
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setOperationError("");
      deactivateGame.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="ghost">
          <Trash2 /> Remover
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md gap-0 bg-card p-0">
        <DialogHeader className="border-b px-6 py-5 pr-12 text-left">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border bg-muted text-destructive">
            <Trash2 className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl">Remover do catálogo?</DialogTitle>
          <DialogDescription className="pt-1 leading-relaxed">
            {game.title} deixará de aparecer nas buscas e não poderá ser adicionado a novas filas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            As partidas e filas que já usam este jogo não serão alteradas.
          </p>
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
            <Button type="button" variant="ghost" disabled={deactivateGame.isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={deactivateGame.isPending}
            onClick={() => deactivateGame.mutate()}
          >
            {deactivateGame.isPending && <LoaderCircle className="animate-spin" aria-hidden />}
            {deactivateGame.isPending ? "Removendo jogo..." : "Remover jogo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
