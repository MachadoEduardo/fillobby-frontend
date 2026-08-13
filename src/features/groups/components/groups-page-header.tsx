import { CreateGroupDialog } from "@/features/groups/components/create-group-dialog";
import { JoinGroupDialog } from "@/features/groups/components/join-group-dialog";

export function GroupsPageHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">Seus lobbies</p>
        <h1 className="page-heading mt-2">Onde a galera se encontra</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Retome uma decisão em andamento ou abra espaço para a próxima partida.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <JoinGroupDialog />
        <CreateGroupDialog />
      </div>
    </div>
  );
}
