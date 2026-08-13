import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function SuggestGameDialog({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const gamesQuery = useQuery({
    queryKey: queryKeys.games.list({ search, page: 1 }),
    queryFn: () => api.games.list({ search: search || undefined, limit: 30 }),
    enabled: open,
  });
  const suggestGame = useMutation({
    mutationFn: (gameId: string) => api.queue.create(groupId, gameId),
    onSuccess: () => {
      toast.success("Jogo adicionado à fila!");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.queue.list(groupId),
      });
      setOpen(false);
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Erro."),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-3 w-3" /> Sugerir jogo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sugerir um jogo</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Buscar no catálogo..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {gamesQuery.isLoading && <p className="text-sm">Carregando...</p>}
        <div className="space-y-1">
          {gamesQuery.data?.games.map((game) => (
            <button
              key={game.id}
              type="button"
              disabled={suggestGame.isPending}
              onClick={() => suggestGame.mutate(game.id)}
              className="flex w-full items-center gap-3 rounded p-2 text-left hover:bg-accent"
            >
              {game.coverUrl ? (
                <img
                  src={game.coverUrl}
                  alt=""
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-muted" />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{game.title}</div>
                <div className="text-xs text-muted-foreground">
                  {game.platforms.join(", ")}
                </div>
              </div>
            </button>
          ))}
          {gamesQuery.data?.games.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Nenhum jogo encontrado. Cadastre no catálogo primeiro.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
