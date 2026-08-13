import { Plus } from "lucide-react";
import { CreateGameDialog } from "@/features/games/components/create-game-dialog";

export function GamesPageHeader() {
  return (
    <header className="flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-muted-foreground">
          Biblioteca compartilhada
        </p>
        <h1 className="page-heading mt-2">Catálogo de jogos</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Encontre opções para a próxima partida ou amplie o catálogo da sua
          galera.
        </p>
      </div>
      <CreateGameDialog>
        <Plus /> Novo jogo
      </CreateGameDialog>
    </header>
  );
}
