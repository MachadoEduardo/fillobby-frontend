import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  api,
  getStoredToken,
  getStoredUser,
  onUnauthorized,
  setStoredToken,
  setStoredUser,
} from "../src/lib/api";
import type { PublicUser } from "../src/lib/api-types";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

const user: PublicUser = {
  id: "user-1",
  name: "Eduardo",
  email: "eduardo@example.com",
  avatarUrl: null,
  preferredPlatforms: ["PC"],
};

describe("API client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("window", { localStorage: createStorage() });
    setStoredToken(null);
    setStoredUser(null);
  });

  it("stores and reads the authenticated session", () => {
    setStoredToken("token-123");
    setStoredUser(user);

    expect(getStoredToken()).toBe("token-123");
    expect(getStoredUser()).toEqual(user);
  });

  it("logs out listeners when an authenticated request receives an invalid token", async () => {
    setStoredToken("expired-token");
    const onSessionExpired = vi.fn();
    const unsubscribe = onUnauthorized(onSessionExpired);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "AUTH_TOKEN_INVALID",
              message: "Sessão expirada.",
              details: [],
            },
          }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(api.auth.me()).rejects.toMatchObject({
      code: "AUTH_TOKEN_INVALID",
      status: 401,
    });

    expect(onSessionExpired).toHaveBeenCalledOnce();
    expect(getStoredToken()).toBeNull();
    unsubscribe();
  });

  it("sends credentials for login and returns the API data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { token: "token-123", user } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      api.auth.login({ email: user.email, password: "Password123" }),
    ).resolves.toEqual({ token: "token-123", user });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: user.email, password: "Password123" }),
      }),
    );
  });
});
