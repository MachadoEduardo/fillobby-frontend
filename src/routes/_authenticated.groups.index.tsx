import { createFileRoute } from "@tanstack/react-router";
import { GroupsPage } from "@/features/groups/groups-page";

export const Route = createFileRoute("/_authenticated/groups/")({
  head: () => ({ meta: [{ title: "Grupos | Fillobby" }] }),
  component: GroupsPage,
});
