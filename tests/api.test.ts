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

    await expect(api.auth.login({ email: user.email, password: "Password123" })).resolves.toEqual({
      token: "token-123",
      user,
    });

    const sent = fetchMock.mock.calls[0][0] as Request;
    expect(sent.url).toContain("/api/v1/auth/login");
    expect(sent.method).toBe("POST");
    expect(await sent.clone().json()).toEqual({ email: user.email, password: "Password123" });
  });

  it("sends the password confirmation when registering", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: user }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await api.auth.register({
      name: user.name,
      email: user.email,
      password: "Password123",
      confirmPassword: "Password123",
    });

    const sent = fetchMock.mock.calls[0][0] as Request;
    expect(sent.url).toContain("/api/v1/auth/register");
    expect(sent.method).toBe("POST");
    expect(await sent.clone().json()).toEqual({
      name: user.name,
      email: user.email,
      password: "Password123",
      confirmPassword: "Password123",
    });
  });

  it("maps network failures to the existing API error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(api.auth.me()).rejects.toMatchObject({ code: "NETWORK_ERROR", status: 0 });
  });

  it("uploads avatar bytes with the original media type and authorization", async () => {
    setStoredToken("token-123");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: user }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["image-bytes"], "avatar.png", { type: "image/png" });

    await expect(api.profile.uploadAvatar(file)).resolves.toEqual(user);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/v1/profile/avatar");
    expect(options.method).toBe("PUT");
    expect(options.body).toBe(file);
    expect(options.headers).toMatchObject({
      "Content-Type": "image/png",
      Authorization: "Bearer token-123",
    });
  });
});
