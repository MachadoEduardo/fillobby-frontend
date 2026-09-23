import { activeQueueStatusValues, platformValues } from "./generated/openapi";
import type { components } from "./generated/openapi";

type Schemas = components["schemas"];

export type Platform = Schemas["Platform"];
export const PLATFORMS: readonly Platform[] = platformValues;
export type GroupRole = Schemas["GroupRole"];
export type MemberStatus = Schemas["MemberStatus"];
export type QueueStatus = Schemas["QueueStatus"];
export const ACTIVE_QUEUE_STATUSES: readonly QueueStatus[] = activeQueueStatusValues;
export type QueueSort = Schemas["QueueSort"];
export type PublicUser = Schemas["PublicUser"];
export type UserSummary = Schemas["UserSummary"];
export type Group = Schemas["Group"];
export type Member = Schemas["Member"];
export type Game = Schemas["Game"];
export type CreateGameResult = Schemas["CreateGameSuccess"]["data"];
export type QueueGame = Schemas["QueueGame"];
export type QueueItem = Schemas["QueueItem"];
export type Vote = Schemas["Vote"];
export type PaginationMeta = Schemas["PaginationMeta"];
export type ErrorDetail = Schemas["ErrorDetail"];
export type ApiErrorPayload = Schemas["Error"];
