import { createFileRoute } from "@tanstack/react-router";
import { InvitePage } from "@/features/groups/invite-page";

export const Route = createFileRoute("/invite/$code")({
  head: () => ({ meta: [{ title: "Convite para grupo | Fillobby" }] }),
  component: InviteRoute,
});

function InviteRoute() {
  const { code } = Route.useParams();
  return <InvitePage code={code} />;
}
