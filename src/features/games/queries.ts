import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Platform } from "@/lib/api-types";
import { queryKeys } from "@/lib/query-keys";

export function gamesListQuery(filters: {
  search: string;
  platform: Platform | "ALL";
  page: number;
}) {
  return queryOptions({
    queryKey: queryKeys.games.list(filters),
    queryFn: () =>
      api.games.list({
        search: filters.search || undefined,
        platform: filters.platform === "ALL" ? undefined : filters.platform,
        page: filters.page,
        limit: 20,
      }),
  });
}
