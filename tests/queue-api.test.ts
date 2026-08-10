import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../src/lib/api";

describe("queue API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("window", { localStorage: { getItem: () => null } });
  });

  it("lists a group's queue with sorting and pagination", async () => {
    const response = { queueItems: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: response }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      api.queue.list("group-1", { limit: 50, sort: "votes_desc" }),
    ).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/groups/group-1/queue?limit=50&sort=votes_desc"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("creates a queue item for a game", async () => {
    const item = { id: "queue-1", groupId: "group-1" };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: item }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.queue.create("group-1", "game-1")).resolves.toEqual(item);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/groups/group-1/queue"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ gameId: "game-1" }),
      }),
    );
  });

  it("transitions a queue item to playing", async () => {
    const item = { id: "queue-1", status: "PLAYING" };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: item }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.queue.transition("group-1", "queue-1", "PLAYING")).resolves.toEqual(item);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/groups/group-1/queue/queue-1/status"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "PLAYING" }),
      }),
    );
  });
});
