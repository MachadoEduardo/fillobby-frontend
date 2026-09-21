export const queryKeys = {
  groups: {
    all: () => ["groups"] as const,
  },
  group: {
    detail: (groupId: string) => ["group", groupId] as const,
  },
  queue: {
    list: (groupId: string) => ["queue", groupId] as const,
  },
  members: {
    list: (groupId: string) => ["members", groupId] as const,
    removed: (groupId: string) => ["members", groupId, "removed"] as const,
  },
  games: {
    root: () => ["games"] as const,
    all: () => ["games-all"] as const,
    list: (filters: { search?: string; platform?: string; page?: number }) =>
      ["games", filters] as const,
  },
  votes: {
    list: (groupId: string, itemId: string) => ["votes", groupId, itemId] as const,
  },
  history: {
    root: (groupId: string) => ["history", groupId] as const,
    list: (
      groupId: string,
      filters: {
        from?: string;
        to?: string;
        gameId?: string;
        participantId?: string;
        page?: number;
      },
    ) => ["history", groupId, filters] as const,
  },
} as const;
