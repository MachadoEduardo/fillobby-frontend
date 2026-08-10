import { createFileRoute } from "@tanstack/react-router";
import { GroupDetailPage } from "@/features/groups/group-detail-page";

export const Route = createFileRoute("/_authenticated/groups/$groupId")({
  head: () => ({ meta: [{ title: "Grupo | Fillobby" }] }),
  component: GroupDetailRoute,
});

function GroupDetailRoute() {
  const { groupId } = Route.useParams();
  return <GroupDetailPage groupId={groupId} />;
}
