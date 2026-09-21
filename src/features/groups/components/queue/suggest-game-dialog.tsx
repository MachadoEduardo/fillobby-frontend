import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Gamepad2, LoaderCircle, Plus, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getGroupActionErrorMessage,
  getGroupLoadErrorMessage,
} from "@/features/groups/group-errors";
import { api, resolveApiAssetUrl } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function SuggestGameDialog({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [operationError, setOperationError] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const queryClient = useQueryClient();
  const gamesQuery = useQuery({
    queryKey: queryKeys.games.list({ search: deferredSearch, page: 1 }),
    queryFn: () => api.games.list({ search: deferredSearch || undefined, limit: 30 }),
    enabled: open,
    placeholderData: (previousData) => previousData,
  });
  const suggestGame = useMutation({
    mutationFn: (gameId: string) => api.queue.create(groupId, gameId),
    onSuccess: () => {
      toast.success("Jogo adicionado à fila!");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.queue.list(groupId),
      });
      setOpen(false);
      resetDialog();
    },
    onError: (error) =>
      setOperationError(
        getGroupActionErrorMessage(
          error,
          "Não foi possível adicionar o jogo agora. Tente novamente em alguns instantes.",
        ),
      ),
  });

  function resetDialog() {
    setSearch("");
    setOperationError("");
    suggestGame.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetDialog();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Sugerir jogo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-lg gap-0 overflow-y-auto bg-card p-0">
        <DialogHeader className="border-b px-6 py-5 pr-12 text-left">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border bg-muted text-foreground">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl">Sugerir um jogo</DialogTitle>
          <DialogDescription className="pt-1 leading-relaxed">
            Escolha uma opção do catálogo para iniciar a decisão do grupo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="relative">
            <label htmlFor="suggest-game-search" className="sr-only">
              Buscar jogo por título
            </label>
            <Search
              aria-hidden
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="suggest-game-search"
              type="search"
              autoComplete="off"
              placeholder="Buscar por título"
              value={search}
              className="bg-background pl-9"
              disabled={suggestGame.isPending}
              onChange={(event) => {
                setSearch(event.target.value);
                setOperationError("");
              }}
            />
          </div>

          {gamesQuery.isLoading && (
            <div aria-label="Carregando jogos" aria-busy="true" className="space-y-2">
              {[0, 1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          )}
          {gamesQuery.error && !gamesQuery.data && (
            <div role="alert" className="space-y-3 rounded-lg border bg-muted/35 p-4 text-sm">
              <p className="text-muted-foreground">
                {getGroupLoadErrorMessage(gamesQuery.error, "jogos")}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void gamesQuery.refetch()}
              >
                Tentar novamente
              </Button>
            </div>
          )}
          <div className="space-y-1">
            {gamesQuery.data?.games.map((game) => {
              const coverUrl = resolveApiAssetUrl(game.coverUrl);
              return (
                <button
                  key={game.id}
                  type="button"
                  disabled={suggestGame.isPending}
                  onClick={() => {
                    setOperationError("");
                    suggestGame.mutate(game.id);
                  }}
                  className="flex min-h-14 w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={`Capa de ${game.title}`}
                      loading="lazy"
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Gamepad2 className="h-4 w-4" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{game.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {game.platforms.join(" · ")}
                    </span>
                  </span>
                  {suggestGame.isPending && suggestGame.variables === game.id && (
                    <LoaderCircle className="animate-spin" aria-label="Adicionando jogo" />
                  )}
                </button>
              );
            })}
            {gamesQuery.data?.games.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium">Nenhum jogo encontrado</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {search.trim()
                    ? "Tente buscar por outro título."
                    : "Adicione um jogo ao catálogo antes de sugeri-lo."}
                </p>
              </div>
            )}
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
      </DialogContent>
    </Dialog>
  );
}
