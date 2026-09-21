import { useState } from "react";
import type { Group } from "@/lib/api-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoryTab } from "@/features/groups/components/history/history-tab";
import { MembersTab } from "@/features/groups/components/members/members-tab";
import { QueueTab } from "@/features/groups/components/queue/queue-tab";
import { SettingsTab } from "@/features/groups/components/settings/settings-tab";

const TAB_TRIGGER_CLASS =
  "shrink-0 rounded-none border-b-2 border-transparent px-1 py-3 data-[state=active]:border-signal data-[state=active]:bg-transparent data-[state=active]:shadow-none";

type GroupTab = "queue" | "members" | "history" | "settings";

export function GroupDetailTabs({ group }: { group: Group }) {
  const canManageGroup = group.role === "OWNER" || group.role === "ADMIN";
  const [activeTab, setActiveTab] = useState<GroupTab>("queue");
  const visibleActiveTab = !canManageGroup && activeTab === "settings" ? "queue" : activeTab;

  return (
    <Tabs value={visibleActiveTab} onValueChange={(value) => setActiveTab(value as GroupTab)}>
      <TabsList
        aria-label="Seções do grupo"
        className="sticky top-0 z-10 h-auto w-full justify-start gap-5 overflow-x-auto rounded-none border-b bg-background/95 p-0 backdrop-blur"
      >
        <TabsTrigger value="queue" className={TAB_TRIGGER_CLASS}>
          Fila
        </TabsTrigger>
        <TabsTrigger value="members" className={TAB_TRIGGER_CLASS}>
          Membros
        </TabsTrigger>
        <TabsTrigger value="history" className={TAB_TRIGGER_CLASS}>
          Histórico
        </TabsTrigger>
        {canManageGroup && (
          <TabsTrigger value="settings" className={TAB_TRIGGER_CLASS}>
            Configurações
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="queue" className="mt-6">
        <QueueTab group={group} />
      </TabsContent>
      <TabsContent value="members" className="mt-6">
        <MembersTab group={group} />
      </TabsContent>
      <TabsContent value="history" className="mt-6">
        <HistoryTab group={group} />
      </TabsContent>
      {canManageGroup && (
        <TabsContent value="settings" className="mt-6">
          <SettingsTab group={group} />
        </TabsContent>
      )}
    </Tabs>
  );
}
