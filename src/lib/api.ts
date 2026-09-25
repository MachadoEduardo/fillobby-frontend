import createClient from "openapi-fetch";
import type { paths } from "./generated/openapi";
import type { ApiErrorPayload, Platform, PublicUser, QueueStatus } from "./api-types";

const RAW_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

export function resolveApiAssetUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value, `${API_BASE_URL}/`).toString();
  } catch {
    return value;
  }
}

const TOKEN_KEY = "fillobby.token";
const USER_KEY = "fillobby.user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}
export function getStoredUser(): PublicUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PublicUser;
  } catch {
    return null;
  }
}
export function setStoredUser(user: PublicUser | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  code: string;
  status: number;
  details: { field: string; message: string }[];
  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message || "Erro na requisição.");
    this.status = status;
    this.code = payload.code || "UNKNOWN_ERROR";
    this.details = payload.details || [];
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

function buildUrl(path: string, query?: Query): string {
  const url = new URL(API_BASE_URL + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

// Listeners for unauthorized (401)
const unauthorizedListeners = new Set<() => void>();
export function onUnauthorized(cb: () => void): () => void {
  unauthorizedListeners.add(cb);
  return () => unauthorizedListeners.delete(cb);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  rawBody?: BodyInit;
  contentType?: string;
  query?: Query;
  auth?: boolean;
}

interface ApiResponseEnvelope {
  data?: unknown;
  error?: ApiErrorPayload;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, rawBody, contentType, query, auth = true } = opts;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (rawBody !== undefined && contentType) headers["Content-Type"] = contentType;
  if (auth) {
    const token = getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch (err) {
    throw new ApiError(0, {
      code: "NETWORK_ERROR",
      message: "Não foi possível conectar. Verifique sua conexão.",
      details: [],
    });
  }

  let json: ApiResponseEnvelope | null = null;
  const text = await response.text();
  if (text) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed === "object" && parsed !== null) {
        json = parsed as ApiResponseEnvelope;
      }
    } catch {
      // ignore
    }
  }

  if (!response.ok) {
    const payload: ApiErrorPayload = json?.error || {
      code: "UNKNOWN_ERROR",
      message: `Erro ${response.status}.`,
      details: [],
    };
    const isInvalidSession =
      payload.code === "AUTH_TOKEN_REQUIRED" || payload.code === "AUTH_TOKEN_INVALID";
    if (response.status === 401 && auth && isInvalidSession) {
      setStoredToken(null);
      setStoredUser(null);
      unauthorizedListeners.forEach((cb) => cb());
    }
    throw new ApiError(response.status, payload);
  }

  return (json?.data ?? json) as T;
}

const client = createClient<paths>({
  baseUrl: API_BASE_URL,
  fetch: (input) => fetch(input),
});

client.use({
  onRequest({ request }) {
    const token = getStoredToken();
    if (token && !/\/api\/v1\/auth\/(login|register)$/.test(new URL(request.url).pathname)) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
});

async function unwrap<T extends { success: true; data: unknown }>(
  result: Promise<{ data?: T; error?: unknown; response: Response }>,
  auth = true,
): Promise<T extends { success: true; data: infer D } ? D : never> {
  let resolved: Awaited<typeof result>;
  try {
    resolved = await result;
  } catch {
    throw new ApiError(0, {
      code: "NETWORK_ERROR",
      message: "Não foi possível conectar. Verifique sua conexão.",
      details: [],
    });
  }
  if (resolved.response.ok && resolved.data) {
    return resolved.data.data as T extends { success: true; data: infer D } ? D : never;
  }
  const envelope = resolved.error as { error?: ApiErrorPayload } | undefined;
  const payload = envelope?.error ?? {
    code: "UNKNOWN_ERROR",
    message: `Erro ${resolved.response.status}.`,
    details: [],
  };
  if (
    auth &&
    resolved.response.status === 401 &&
    (payload.code === "AUTH_TOKEN_REQUIRED" || payload.code === "AUTH_TOKEN_INVALID")
  ) {
    setStoredToken(null);
    setStoredUser(null);
    unauthorizedListeners.forEach((cb) => cb());
  }
  throw new ApiError(resolved.response.status, payload);
}

// ============ AUTH ============
export const api = {
  auth: {
    register: (
      input: paths["/api/v1/auth/register"]["post"]["requestBody"]["content"]["application/json"],
    ) => unwrap(client.POST("/api/v1/auth/register", { body: input }), false),
    login: (
      input: paths["/api/v1/auth/login"]["post"]["requestBody"]["content"]["application/json"],
    ) => unwrap(client.POST("/api/v1/auth/login", { body: input }), false),
    me: () => unwrap(client.GET("/api/v1/auth/me")),
  },

  // ============ PROFILE ============
  profile: {
    update: (input: { name: string }) => unwrap(client.PATCH("/api/v1/profile", { body: input })),
    changePassword: (input: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => unwrap(client.PATCH("/api/v1/profile/password", { body: input })),
    updatePreferences: (preferredPlatforms: Platform[]) =>
      unwrap(client.PATCH("/api/v1/profile/preferences", { body: { preferredPlatforms } })),
    uploadAvatar: (file: File) =>
      request<PublicUser>("/api/v1/profile/avatar", {
        method: "PUT",
        rawBody: file,
        contentType: file.type,
      }),
    removeAvatar: () => unwrap(client.DELETE("/api/v1/profile/avatar")),
  },

  // ============ GROUPS ============
  groups: {
    list: (query?: { page?: number; limit?: number }) =>
      unwrap(client.GET("/api/v1/groups", { params: { query } })),
    create: (input: { name: string; description?: string | null }) =>
      unwrap(client.POST("/api/v1/groups", { body: input })),
    join: (input: { inviteCode: string }) =>
      unwrap(client.POST("/api/v1/groups/join", { body: input })),
    get: (groupId: string) =>
      unwrap(client.GET("/api/v1/groups/{groupId}", { params: { path: { groupId } } })),
    update: (groupId: string, input: { name?: string; description?: string | null }) =>
      unwrap(
        client.PATCH("/api/v1/groups/{groupId}", { params: { path: { groupId } }, body: input }),
      ),
    deactivate: (groupId: string) =>
      unwrap(client.DELETE("/api/v1/groups/{groupId}", { params: { path: { groupId } } })),
    listMembers: (
      groupId: string,
      query?: { page?: number; limit?: number; status?: "ACTIVE" | "REMOVED" },
    ) =>
      unwrap(
        client.GET("/api/v1/groups/{groupId}/members", { params: { path: { groupId }, query } }),
      ),
    changeRole: (groupId: string, userId: string, role: "ADMIN" | "MEMBER") =>
      unwrap(
        client.PATCH("/api/v1/groups/{groupId}/members/{userId}/role", {
          params: { path: { groupId, userId } },
          body: { role },
        }),
      ),
    removeMember: (groupId: string, userId: string) =>
      unwrap(
        client.DELETE("/api/v1/groups/{groupId}/members/{userId}", {
          params: { path: { groupId, userId } },
        }),
      ),
    leave: (groupId: string) =>
      unwrap(client.POST("/api/v1/groups/{groupId}/leave", { params: { path: { groupId } } })),
    restoreMember: (groupId: string, userId: string) =>
      unwrap(
        client.POST("/api/v1/groups/{groupId}/members/{userId}/restore", {
          params: { path: { groupId, userId } },
        }),
      ),
    transferOwner: (groupId: string, newOwnerId: string) =>
      unwrap(
        client.POST("/api/v1/groups/{groupId}/transfer-owner", {
          params: { path: { groupId } },
          body: { newOwnerId },
        }),
      ),
    regenerateInvite: (groupId: string) =>
      unwrap(
        client.POST("/api/v1/groups/{groupId}/regenerate-invite", {
          params: { path: { groupId } },
        }),
      ),
  },

  // ============ GAMES ============
  games: {
    list: (query?: { search?: string; platform?: Platform; page?: number; limit?: number }) =>
      unwrap(client.GET("/api/v1/games", { params: { query } })),
    create: (input: {
      title: string;
      platforms: Platform[];
      maxPlayers?: number | null;
      coverUrl?: string | null;
      description?: string | null;
    }) => unwrap(client.POST("/api/v1/games", { body: input })),
    get: (gameId: string) =>
      unwrap(client.GET("/api/v1/games/{gameId}", { params: { path: { gameId } } })),
    update: (
      gameId: string,
      input: Partial<{
        title: string;
        platforms: Platform[];
        maxPlayers: number | null;
        coverUrl: string | null;
        description: string | null;
      }>,
    ) =>
      unwrap(
        client.PATCH("/api/v1/games/{gameId}", {
          params: { path: { gameId } },
          body: input,
        }),
      ),
    deactivate: (gameId: string) =>
      unwrap(client.DELETE("/api/v1/games/{gameId}", { params: { path: { gameId } } })),
  },

  // ============ QUEUE ============
  queue: {
    list: (
      groupId: string,
      query?: {
        status?: QueueStatus;
        search?: string;
        platform?: Platform;
        page?: number;
        limit?: number;
        sort?: import("./api-types").QueueSort;
      },
    ) =>
      unwrap(
        client.GET("/api/v1/groups/{groupId}/queue", {
          params: { path: { groupId }, query },
        }),
      ),
    create: (groupId: string, gameId: string) =>
      unwrap(
        client.POST("/api/v1/groups/{groupId}/queue", {
          params: { path: { groupId } },
          body: { gameId },
        }),
      ),
    get: (groupId: string, itemId: string) =>
      unwrap(
        client.GET("/api/v1/groups/{groupId}/queue/{itemId}", {
          params: { path: { groupId, itemId } },
        }),
      ),
    cancel: (groupId: string, itemId: string) =>
      unwrap(
        client.DELETE("/api/v1/groups/{groupId}/queue/{itemId}", {
          params: { path: { groupId, itemId } },
        }),
      ),
    transition: (groupId: string, itemId: string, status: "VOTING" | "PLAYING" | "COMPLETED") =>
      unwrap(
        client.PATCH("/api/v1/groups/{groupId}/queue/{itemId}/status", {
          params: { path: { groupId, itemId } },
          body: { status },
        }),
      ),
    setParticipants: (groupId: string, itemId: string, participantIds: string[]) =>
      unwrap(
        client.PUT("/api/v1/groups/{groupId}/queue/{itemId}/participants", {
          params: { path: { groupId, itemId } },
          body: { participantIds },
        }),
      ),
    markReady: (groupId: string, itemId: string) =>
      unwrap(
        client.POST("/api/v1/groups/{groupId}/queue/{itemId}/ready", {
          params: { path: { groupId, itemId } },
        }),
      ),
    unmarkReady: (groupId: string, itemId: string) =>
      unwrap(
        client.DELETE("/api/v1/groups/{groupId}/queue/{itemId}/ready", {
          params: { path: { groupId, itemId } },
        }),
      ),
  },

  // ============ VOTING ROUNDS ============
  votingRounds: {
    list: (groupId: string, page = 1) =>
      unwrap(
        client.GET("/api/v1/groups/{groupId}/voting-rounds", {
          params: { path: { groupId }, query: { page, limit: 5 } },
        }),
      ),
    start: (groupId: string, candidateIds: string[]) =>
      unwrap(
        client.POST("/api/v1/groups/{groupId}/voting-rounds", {
          params: { path: { groupId } },
          body: { candidateIds },
        }),
      ),
    close: (groupId: string, roundId: string, winnerItemId?: string) =>
      unwrap(
        client.POST("/api/v1/groups/{groupId}/voting-rounds/{roundId}/close", {
          params: { path: { groupId, roundId } },
          body: winnerItemId ? { winnerItemId } : {},
        }),
      ),
    cancel: (groupId: string, roundId: string) =>
      unwrap(
        client.POST("/api/v1/groups/{groupId}/voting-rounds/{roundId}/cancel", {
          params: { path: { groupId, roundId } },
        }),
      ),
  },

  // ============ VOTES ============
  votes: {
    create: (groupId: string, itemId: string) =>
      unwrap(
        client.POST("/api/v1/groups/{groupId}/queue/{itemId}/votes", {
          params: { path: { groupId, itemId } },
        }),
      ),
    removeOwn: (groupId: string, itemId: string) =>
      unwrap(
        client.DELETE("/api/v1/groups/{groupId}/queue/{itemId}/votes/me", {
          params: { path: { groupId, itemId } },
        }),
      ),
    list: (groupId: string, itemId: string, query?: { page?: number; limit?: number }) =>
      unwrap(
        client.GET("/api/v1/groups/{groupId}/queue/{itemId}/votes", {
          params: { path: { groupId, itemId }, query },
        }),
      ),
  },

  // ============ HISTORY ============
  history: {
    list: (
      groupId: string,
      query?: {
        from?: string;
        to?: string;
        gameId?: string;
        participantId?: string;
        page?: number;
        limit?: number;
      },
    ) =>
      unwrap(
        client.GET("/api/v1/groups/{groupId}/history", {
          params: { path: { groupId }, query },
        }),
      ),
  },
};

export type QueueStatusLabelMap = Record<QueueStatus, string>;
export const QUEUE_STATUS_LABEL: QueueStatusLabelMap = {
  SUGGESTED: "Sugerido",
  VOTING: "Em votação",
  WAITING_PLAYERS: "Aguardando jogadores",
  READY: "Pronto",
  PLAYING: "Em partida",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};
