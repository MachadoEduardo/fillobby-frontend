import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GamesPlatformFilter } from "@/features/games/types";
import { PLATFORMS } from "@/lib/api-types";

type GamesFiltersProps = {
  search: string;
  platform: GamesPlatformFilter;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onPlatformChange: (value: GamesPlatformFilter) => void;
  onClear: () => void;
};

export function GamesFilters({
  search,
  platform,
  hasActiveFilters,
  onSearchChange,
  onPlatformChange,
  onClear,
}: GamesFiltersProps) {
  return (
    <section aria-label="Filtros do catálogo" className="border-b pb-6">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto]">
        <div className="relative">
          <label htmlFor="games-search" className="sr-only">
            Buscar por título
          </label>
          <Search
            aria-hidden
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="games-search"
            type="search"
            autoComplete="off"
            placeholder="Buscar por título"
            value={search}
            className="h-10 bg-card pl-9"
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <Select
          value={platform}
          onValueChange={(value) => onPlatformChange(value as GamesPlatformFilter)}
        >
          <SelectTrigger className="h-10 bg-card" aria-label="Filtrar por plataforma">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as plataformas</SelectItem>
            {PLATFORMS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            className="justify-self-start md:justify-self-auto"
            onClick={onClear}
          >
            <X /> Limpar filtros
          </Button>
        )}
      </div>
    </section>
  );
}
