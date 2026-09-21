import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GamesCatalog } from "@/features/games/components/games-catalog";
import { GamesFilters } from "@/features/games/components/games-filters";
import { GamesPageHeader } from "@/features/games/components/games-page-header";
import { gamesListQuery } from "@/features/games/queries";
import type { GamesPlatformFilter } from "@/features/games/types";

export function GamesPage() {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<GamesPlatformFilter>("ALL");
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search.trim());
  const gamesQuery = useQuery(gamesListQuery({ search: deferredSearch, platform, page }));
  const hasActiveFilters = Boolean(search.trim()) || platform !== "ALL";

  function clearFilters() {
    setSearch("");
    setPlatform("ALL");
    setPage(1);
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <GamesPageHeader />
      <GamesFilters
        search={search}
        platform={platform}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPlatformChange={(value) => {
          setPlatform(value);
          setPage(1);
        }}
        onClear={clearFilters}
      />
      <GamesCatalog
        query={gamesQuery}
        page={page}
        hasActiveFilters={hasActiveFilters}
        onPageChange={setPage}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
