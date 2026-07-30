// Tipos derivados do openapi.yaml do Fillobby.

export type Platform = "PC" | "PlayStation" | "Xbox" | "Switch";
export const PLATFORMS: Platform[] = ["PC", "PlayStation", "Xbox", "Switch"];

export type GroupRole = "OWNER" | "ADMIN" | "MEMBER";
export type MemberStatus = "ACTIVE" | "REMOVED" | "INACTIVE";

export type QueueStatus =
  | "SUGGESTED"
  | "VOTING"
  | "WAITING_PLAYERS"
  | "READY"
  | "PLAYING"
  | "COMPLETED"
  | "CANCELLED";

export const ACTIVE_QUEUE_STATUSES: QueueStatus[] = [
  "SUGGESTED",
  "VOTING",
  "WAITING_PLAYERS",
  "READY",
  "PLAYING",
];

export type QueueSort = "votes_desc" | "created_asc" | "updated_desc";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  preferredPlatforms: Platform[];
}

export interface UserSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  isActive: boolean;
  role: GroupRole;
  inviteCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: GroupRole;
  status: MemberStatus;
  joinedAt: string;
}

export interface Game {
  id: string;
  title: string;
  platforms: Platform[];
  maxPlayers: number | null;
  coverUrl: string | null;
  description: string | null;
  createdById: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameResult {
  game: Game;
  reactivated: boolean;
}

export interface QueueGame {
  id: string;
  title: string;
  platforms: Platform[];
  maxPlayers: number | null;
  coverUrl: string | null;
}

export interface QueueItem {
  id: string;
  groupId: string;
  game: QueueGame;
  suggestedBy: UserSummary;
  status: QueueStatus;
  voteCount: number;
  viewerHasVoted: boolean;
  participantIds: string[];
  participants: UserSummary[];
  readyUserIds: string[];
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  user: UserSummary;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ErrorDetail {
  field: string;
  message: string;
}
export interface ApiErrorPayload {
  code: string;
  message: string;
  details: ErrorDetail[];
}
