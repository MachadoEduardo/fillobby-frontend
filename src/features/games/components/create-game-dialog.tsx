import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Gamepad2 } from "lucide-react";
import { useState, type ReactNode } from "react";
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
import { queryKeys } from "@/lib/query-keys";

type CreateGameDialogProps = {
  children: ReactNode;
};

export function CreateGameDialog({ children }: CreateGameDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const queryClient = useQueryClient();
  const createGame = useMutation({
    mutationFn: (values: GameFormValues) => api.games.create(values),
    onSuccess: ({ reactivated }) => {
      toast.success(
        reactivated
          ? "O jogo voltou ao catálogo."
          : "Jogo adicionado ao catálogo!",
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.games.root() });
      setOpen(false);
      resetMutation();
    },
    onError: (error) => setFormError(getSaveGameErrorMessage(error)),
  });

  function resetMutation() {
    setFormError("");
    createGame.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetMutation();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">{children}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-2xl gap-0 overflow-y-auto bg-card p-0">
        <DialogHeader className="border-b px-6 py-5 pr-12 text-left">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border bg-muted text-foreground">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl">Adicionar jogo</DialogTitle>
          <DialogDescription className="pt-1 leading-relaxed">
            Cadastre uma opção para que ela possa ser sugerida nas filas dos
            grupos.
          </DialogDescription>
        </DialogHeader>
        <GameForm
          submitting={createGame.isPending}
          submitLabel="Adicionar jogo"
          pendingLabel="Adicionando jogo..."
          operationError={formError}
          onChange={resetMutation}
          onSubmit={(values) => createGame.mutate(values)}
        />
      </DialogContent>
    </Dialog>
  );
}
