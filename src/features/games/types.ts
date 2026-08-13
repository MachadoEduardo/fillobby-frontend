import type { Platform } from "@/lib/api-types";

export type GamesPlatformFilter = Platform | "ALL";

export type GameFormValues = {
  title: string;
  platforms: Platform[];
  maxPlayers: number | null;
  coverUrl: string | null;
  description: string | null;
};
