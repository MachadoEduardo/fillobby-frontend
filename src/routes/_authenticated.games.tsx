import { createFileRoute } from "@tanstack/react-router";
import { GamesPage } from "@/features/games/games-page";

export const Route = createFileRoute("/_authenticated/games")({
  head: () => ({ meta: [{ title: "Jogos | Fillobby" }] }),
  component: GamesPage,
});
