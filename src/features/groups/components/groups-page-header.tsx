import { CreateGroupDialog } from "@/features/groups/components/create-group-dialog";
import { JoinGroupDialog } from "@/features/groups/components/join-group-dialog";

export function GroupsPageHeader() {
  return (
    <header className="flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-muted-foreground">
          Seus lobbies
        </p>
        <h1 className="page-heading mt-2">Seus grupos</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Continue uma decisão em andamento ou reúna a galera para a próxima
          partida.
        </p>
      </div>
      <div className="grid gap-2 sm:flex sm:shrink-0">
        <JoinGroupDialog />
        <CreateGroupDialog />
      </div>
    </header>
  );
}
