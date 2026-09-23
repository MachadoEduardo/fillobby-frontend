import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../src/lib/api";

describe("groups API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("window", { localStorage: { getItem: () => null } });
  });

  it("lists groups with pagination parameters", async () => {
    const response = {
      groups: [],
      meta: { page: 2, limit: 10, total: 0, totalPages: 0 },
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: response }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.groups.list({ page: 2, limit: 10 })).resolves.toEqual(response);
    const sent = fetchMock.mock.calls[0][0] as Request;
    expect(sent.url).toContain("page=2&limit=10");
    expect(sent.method).toBe("GET");
  });

  it("creates a group with its name and description", async () => {
    const group = { id: "group-1", name: "Sexta", description: "Jogos" };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: group }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.groups.create(group)).resolves.toEqual(group);
    const sent = fetchMock.mock.calls[0][0] as Request;
    expect(sent.url).toContain("/api/v1/groups");
    expect(sent.method).toBe("POST");
    expect(await sent.clone().json()).toEqual(group);
  });
});
