import { useQuery } from "@tanstack/react-query";
import { GroupsList } from "@/features/groups/components/groups-list";
import { GroupsPageHeader } from "@/features/groups/components/groups-page-header";
import { groupsListQuery } from "@/features/groups/queries";

export function GroupsPage() {
  const groupsQuery = useQuery(groupsListQuery());

  return (
    <div className="space-y-10">
      <GroupsPageHeader />
      <GroupsList query={groupsQuery} />
    </div>
  );
}
