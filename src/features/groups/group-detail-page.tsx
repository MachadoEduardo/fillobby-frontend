import { useQuery } from "@tanstack/react-query";
import { GroupDetailTabs } from "@/features/groups/components/group-detail-tabs";
import { GroupHeader } from "@/features/groups/components/group-header";
import { groupDetailQuery } from "@/features/groups/queries";
import { ApiError } from "@/lib/api";

export function GroupDetailPage({ groupId }: { groupId: string }) {
  const groupQuery = useQuery(groupDetailQuery(groupId));

  if (groupQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando grupo...</p>;
  }

  if (groupQuery.error) {
    return (
      <p className="text-sm text-destructive">
        {groupQuery.error instanceof ApiError
          ? groupQuery.error.message
          : "Não foi possível carregar o grupo."}
      </p>
    );
  }

  if (!groupQuery.data) return null;

  return (
    <div className="space-y-8">
      <GroupHeader group={groupQuery.data} />
      <GroupDetailTabs group={groupQuery.data} />
    </div>
  );
}
