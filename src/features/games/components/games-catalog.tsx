import type { UseQueryResult } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CircleAlert, Gamepad2, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import FadeContent from "@/components/fade-content";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GameCard } from "@/features/games/components/game-card";
import { getGamesListErrorMessage } from "@/features/games/game-errors";
import type { Game, PaginationMeta } from "@/lib/api-types";

type GamesResponse = {
  games: Game[];
  meta: PaginationMeta;
};

type GamesCatalogProps = {
  query: UseQueryResult<GamesResponse, Error>;
  page: number;
  hasActiveFilters: boolean;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
};

export function GamesCatalog({
  query,
  page,
  hasActiveFilters,
  onPageChange,
  onClearFilters,
}: GamesCatalogProps) {
  if (query.isLoading) return <GamesCatalogSkeleton />;

  if (query.error) {
    return (
      <CatalogFade>
        <div className="rounded-xl border bg-card/70 px-5 py-10 text-center">
          <CircleAlert className="mx-auto h-6 w-6 text-destructive" />
          <h2 className="mt-3 font-semibold">Não foi possível carregar os jogos</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {getGamesListErrorMessage(query.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-5 bg-transparent"
            onClick={() => void query.refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      </CatalogFade>
    );
  }

  if (!query.data) return null;

  if (query.data.games.length === 0) {
    return (
      <CatalogFade>
        <EmptyCatalog hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />
      </CatalogFade>
    );
  }

  const { games, meta } = query.data;

  return (
    <CatalogFade>
      <section aria-labelledby="games-catalog-heading">
        <div className="mb-4 flex min-h-8 items-center justify-between gap-4">
          <div>
            <h2 id="games-catalog-heading" className="text-sm font-semibold">
              Jogos disponíveis
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {meta.total} {meta.total === 1 ? "jogo encontrado" : "jogos encontrados"}
            </p>
          </div>
          {query.isFetching && (
            <span role="status" className="flex items-center gap-2 text-xs text-muted-foreground">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Atualizando catálogo...
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {meta.totalPages > 1 && (
          <nav
            aria-label="Paginação do catálogo"
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full bg-transparent sm:w-auto"
              disabled={page <= 1 || query.isFetching}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft /> Anterior
            </Button>
            <span className="text-sm text-muted-foreground" aria-live="polite">
              Página {meta.page} de {meta.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full bg-transparent sm:w-auto"
              disabled={page >= meta.totalPages || query.isFetching}
              onClick={() => onPageChange(page + 1)}
            >
              Próxima <ChevronRight />
            </Button>
          </nav>
        )}
      </section>
    </CatalogFade>
  );
}

function CatalogFade({ children }: { children: ReactNode }) {
  return (
    <FadeContent duration={470} initialOpacity={0} threshold={0.05} respectReducedMotion>
      {children}
    </FadeContent>
  );
}

function EmptyCatalog({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="rounded-xl border bg-card/70 px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border bg-muted text-foreground">
        <Gamepad2 className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">
        {hasActiveFilters ? "Nenhum jogo corresponde aos filtros" : "O catálogo ainda está vazio"}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {hasActiveFilters
          ? "Tente outro título, escolha uma plataforma diferente ou limpe os filtros."
          : "Cadastre o primeiro jogo para que ele possa entrar nas filas dos grupos."}
      </p>
      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-5 bg-transparent"
          onClick={onClearFilters}
        >
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

function GamesCatalogSkeleton() {
  return (
    <div aria-label="Carregando catálogo de jogos" aria-busy="true">
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="overflow-hidden rounded-xl border bg-card/70">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
