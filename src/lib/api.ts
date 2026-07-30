import type {
  ApiErrorPayload,
  CreateGameResult,
  Game,
  Group,
  Member,
  PaginationMeta,
  Platform,
  PublicUser,
  QueueItem,
  QueueSort,
  QueueStatus,
  Vote,
} from "./api-types";

const RAW_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3000";
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

export function resolveApiAssetUrl(
  value: string | null | undefined,
): string | undefined {
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
  const {
    method = "GET",
    body,
    rawBody,
    contentType,
    query,
    auth = true,
  } = opts;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (rawBody !== undefined && contentType)
    headers["Content-Type"] = contentType;
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
      message: "Não foi possível conectar à API. Verifique sua conexão.",
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
      payload.code === "AUTH_TOKEN_REQUIRED" ||
      payload.code === "AUTH_TOKEN_INVALID";
    if (response.status === 401 && auth && isInvalidSession) {
      setStoredToken(null);
      setStoredUser(null);
      unauthorizedListeners.forEach((cb) => cb());
    }
    throw new ApiError(response.status, payload);
  }

  return (json?.data ?? json) as T;
}

// ============ AUTH ============
export const api = {
  auth: {
    register: (input: { name: string; email: string; password: string }) =>
      request<PublicUser>("/api/v1/auth/register", {
        method: "POST",
        body: input,
        auth: false,
      }),
    login: (input: { email: string; password: string }) =>
      request<{ token: string; user: PublicUser }>("/api/v1/auth/login", {
        method: "POST",
        body: input,
        auth: false,
      }),
    me: () => request<{ user: PublicUser }>("/api/v1/auth/me"),
  },

  // ============ PROFILE ============
  profile: {
    update: (input: { name: string }) =>
      request<PublicUser>("/api/v1/profile", { method: "PATCH", body: input }),
    changePassword: (input: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) =>
      request<PublicUser>("/api/v1/profile/password", {
        method: "PATCH",
        body: input,
      }),
    updatePreferences: (preferredPlatforms: Platform[]) =>
      request<PublicUser>("/api/v1/profile/preferences", {
        method: "PATCH",
        body: { preferredPlatforms },
      }),
    uploadAvatar: (file: File) =>
      request<PublicUser>("/api/v1/profile/avatar", {
        method: "PUT",
        rawBody: file,
        contentType: file.type,
      }),
    removeAvatar: () =>
      request<PublicUser>("/api/v1/profile/avatar", { method: "DELETE" }),
  },

  // ============ GROUPS ============
  groups: {
    list: (query?: { page?: number; limit?: number }) =>
      request<{ groups: Group[]; meta: PaginationMeta }>("/api/v1/groups", {
        query,
      }),
    create: (input: { name: string; description?: string | null }) =>
      request<Group>("/api/v1/groups", { method: "POST", body: input }),
    join: (input: { inviteCode: string }) =>
      request<Group>("/api/v1/groups/join", { method: "POST", body: input }),
    get: (groupId: string) => request<Group>(`/api/v1/groups/${groupId}`),
    update: (
      groupId: string,
      input: { name?: string; description?: string | null },
    ) =>
      request<Group>(`/api/v1/groups/${groupId}`, {
        method: "PATCH",
        body: input,
      }),
    deactivate: (groupId: string) =>
      request<{ id: string; isActive: false }>(`/api/v1/groups/${groupId}`, {
        method: "DELETE",
      }),
    listMembers: (
      groupId: string,
      query?: { page?: number; limit?: number; status?: "ACTIVE" | "REMOVED" },
    ) =>
      request<{ members: Member[]; meta: PaginationMeta }>(
        `/api/v1/groups/${groupId}/members`,
        { query },
      ),
    changeRole: (groupId: string, userId: string, role: "ADMIN" | "MEMBER") =>
      request<Member>(`/api/v1/groups/${groupId}/members/${userId}/role`, {
        method: "PATCH",
        body: { role },
      }),
    removeMember: (groupId: string, userId: string) =>
      request<{ userId: string; status: "REMOVED" }>(
        `/api/v1/groups/${groupId}/members/${userId}`,
        { method: "DELETE" },
      ),
    leave: (groupId: string) =>
      request<{ userId: string; status: "INACTIVE" }>(
        `/api/v1/groups/${groupId}/leave`,
        { method: "POST" },
      ),
    restoreMember: (groupId: string, userId: string) =>
      request<Member>(`/api/v1/groups/${groupId}/members/${userId}/restore`, {
        method: "POST",
      }),
    transferOwner: (groupId: string, newOwnerId: string) =>
      request<Group>(`/api/v1/groups/${groupId}/transfer-owner`, {
        method: "POST",
        body: { newOwnerId },
      }),
    regenerateInvite: (groupId: string) =>
      request<Group>(`/api/v1/groups/${groupId}/regenerate-invite`, {
        method: "POST",
      }),
  },

  // ============ GAMES ============
  games: {
    list: (query?: {
      search?: string;
      platform?: Platform;
      page?: number;
      limit?: number;
    }) =>
      request<{ games: Game[]; meta: PaginationMeta }>("/api/v1/games", {
        query,
      }),
    create: (input: {
      title: string;
      platforms: Platform[];
      maxPlayers?: number | null;
      coverUrl?: string | null;
      description?: string | null;
    }) =>
      request<CreateGameResult>("/api/v1/games", {
        method: "POST",
        body: input,
      }),
    get: (gameId: string) => request<Game>(`/api/v1/games/${gameId}`),
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
      request<Game>(`/api/v1/games/${gameId}`, {
        method: "PATCH",
        body: input,
      }),
    deactivate: (gameId: string) =>
      request<{ id: string; isActive: false }>(`/api/v1/games/${gameId}`, {
        method: "DELETE",
      }),
  },

  // ============ QUEUE ============
  queue: {
    list: (
      groupId: string,
      query?: {
        status?: string;
        search?: string;
        platform?: Platform;
        page?: number;
        limit?: number;
        sort?: QueueSort;
      },
    ) =>
      request<{ queueItems: QueueItem[]; meta: PaginationMeta }>(
        `/api/v1/groups/${groupId}/queue`,
        { query },
      ),
    create: (groupId: string, gameId: string) =>
      request<QueueItem>(`/api/v1/groups/${groupId}/queue`, {
        method: "POST",
        body: { gameId },
      }),
    get: (groupId: string, itemId: string) =>
      request<QueueItem>(`/api/v1/groups/${groupId}/queue/${itemId}`),
    cancel: (groupId: string, itemId: string) =>
      request<QueueItem>(`/api/v1/groups/${groupId}/queue/${itemId}`, {
        method: "DELETE",
      }),
    transition: (
      groupId: string,
      itemId: string,
      status: "VOTING" | "PLAYING" | "COMPLETED",
    ) =>
      request<QueueItem>(`/api/v1/groups/${groupId}/queue/${itemId}/status`, {
        method: "PATCH",
        body: { status },
      }),
    setParticipants: (
      groupId: string,
      itemId: string,
      participantIds: string[],
    ) =>
      request<QueueItem>(
        `/api/v1/groups/${groupId}/queue/${itemId}/participants`,
        {
          method: "PUT",
          body: { participantIds },
        },
      ),
    markReady: (groupId: string, itemId: string) =>
      request<QueueItem>(`/api/v1/groups/${groupId}/queue/${itemId}/ready`, {
        method: "POST",
      }),
    unmarkReady: (groupId: string, itemId: string) =>
      request<QueueItem>(`/api/v1/groups/${groupId}/queue/${itemId}/ready`, {
        method: "DELETE",
      }),
  },

  // ============ VOTES ============
  votes: {
    create: (groupId: string, itemId: string) =>
      request<{ vote: Vote; voteCount: number }>(
        `/api/v1/groups/${groupId}/queue/${itemId}/votes`,
        { method: "POST" },
      ),
    removeOwn: (groupId: string, itemId: string) =>
      request<{ queueItemId: string; voteCount: number }>(
        `/api/v1/groups/${groupId}/queue/${itemId}/votes/me`,
        { method: "DELETE" },
      ),
    list: (
      groupId: string,
      itemId: string,
      query?: { page?: number; limit?: number },
    ) =>
      request<{ votes: Vote[]; meta: PaginationMeta }>(
        `/api/v1/groups/${groupId}/queue/${itemId}/votes`,
        { query },
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
      request<{ historyItems: QueueItem[]; meta: PaginationMeta }>(
        `/api/v1/groups/${groupId}/history`,
        { query },
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
