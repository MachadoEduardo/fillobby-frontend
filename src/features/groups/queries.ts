import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GROUP_LIVE_REFRESH_MS } from "@/lib/query-config";
import { queryKeys } from "@/lib/query-keys";

export function groupsListQuery() {
  return queryOptions({
    queryKey: queryKeys.groups.all(),
    queryFn: () => api.groups.list({ limit: 50 }),
  });
}

export function groupDetailQuery(groupId: string) {
  return queryOptions({
    queryKey: queryKeys.group.detail(groupId),
    queryFn: () => api.groups.get(groupId),
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });
}
