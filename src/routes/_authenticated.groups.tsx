import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/groups")({
  component: GroupsLayout,
});

function GroupsLayout() {
  return <Outlet />;
}
