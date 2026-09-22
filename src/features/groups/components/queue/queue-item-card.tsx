import { Clock3, Gamepad2, ThumbsUp, Users } from "lucide-react";
import { useState } from "react";
import { QueueParticipants, VotersRoster } from "@/features/groups/components/people-roster";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ParticipantsDialog } from "@/features/groups/components/queue/participants-dialog";
import { QueueItemActions } from "@/features/groups/components/queue/queue-item-actions";
import { QueueProgress } from "@/features/groups/components/queue/queue-progress";
import { QUEUE_STATUS_MESSAGE, QUEUE_STATUS_VARIANT } from "@/features/groups/constants/queue";
import { QUEUE_STATUS_LABEL } from "@/lib/api";
import type { Group, QueueItem } from "@/lib/api-types";
import { useAuth } from "@/lib/auth";

type QueueItemCardProps = {
  item: QueueItem;
  group: Group;
  position: number;
};

export function QueueItemCard({ item, group, position }: QueueItemCardProps) {
  const { user } = useAuth();
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  const isAdmin = group.role === "OWNER" || group.role === "ADMIN";
  const isParticipant = user ? item.participantIds.includes(user.id) : false;
  const isReady = user ? item.readyUserIds.includes(user.id) : false;
  const canVote = item.status === "VOTING";
  const canSelectParticipants =
    isAdmin && (item.status === "VOTING" || item.status === "WAITING_PLAYERS");
  const canReady = isParticipant && (item.status === "WAITING_PLAYERS" || item.status === "READY");

  return (
    <Card
      role="article"
      aria-label={`Jogo na fila: ${item.game.title}`}
      className="overflow-hidden border-brand/12 shadow-[0_14px_40px_-34px_#17313a] transition-colors hover:border-brand/25"
    >
      <div className="border-b bg-muted/25 px-4 py-3 sm:px-5">
        <QueueProgress status={item.status} />
      </div>
      <CardContent className="p-0">
        <div className="grid grid-cols-[5.25rem_1fr] sm:grid-cols-[8rem_1fr]">
          <div className="border-r bg-muted/35 p-3 sm:p-4">
            <span className="mono-data block text-xs font-semibold text-muted-foreground">
              {String(position).padStart(2, "0")}
            </span>
            {item.game.coverUrl ? (
              <img
                src={item.game.coverUrl}
                alt={item.game.title}
                className="mt-3 aspect-4/5 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="mt-3 flex aspect-4/5 w-full items-center justify-center rounded-lg bg-brand/8 text-muted-foreground">
                <Gamepad2 className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="min-w-0 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-bold tracking-tight">{item.game.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sugerido por {item.suggestedBy.name}
                </p>
              </div>
              <Badge className={QUEUE_STATUS_VARIANT[item.status]}>
                {QUEUE_STATUS_LABEL[item.status]}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.game.platforms.map((platform) => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  {platform}
                </Badge>
              ))}
              {item.game.maxPlayers && (
                <Badge variant="outline" className="text-xs">
                  até {item.game.maxPlayers} jogadores
                </Badge>
              )}
            </div>

            <div className="mt-4 flex items-start gap-2 border-l-2 border-signal/55 pl-3 text-sm text-muted-foreground">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <span>{QUEUE_STATUS_MESSAGE[item.status]}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-muted/55 px-3 py-2">
                <ThumbsUp className="h-4 w-4 text-status-voting" />
                <span className="mono-data text-sm font-semibold">{item.voteCount}</span>
                <span className="text-xs text-muted-foreground">
                  {item.voteCount === 1 ? "voto" : "votos"}
                </span>
              </div>
              {item.participants.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-muted/55 px-3 py-2">
                  <Users className="h-4 w-4 text-status-ready" />
                  <span className="mono-data text-sm font-semibold">
                    {item.readyUserIds.length}/{item.participants.length}
                  </span>
                  <span className="text-xs text-muted-foreground">prontos</span>
                </div>
              )}
            </div>

            {(item.participants.length > 0 || canVote || item.voteCount > 0) && (
              <div className="mt-4 grid gap-2 lg:grid-cols-2">
                {item.participants.length > 0 && (
                  <QueueParticipants
                    participants={item.participants}
                    readyUserIds={item.readyUserIds}
                  />
                )}
                {(canVote || item.voteCount > 0) && (
                  <VotersRoster groupId={group.id} itemId={item.id} voteCount={item.voteCount} />
                )}
              </div>
            )}

            <QueueItemActions
              group={group}
              item={item}
              isReady={isReady}
              canVote={canVote}
              canReady={canReady}
              canSelectParticipants={canSelectParticipants}
              onSelectParticipants={() => setParticipantsDialogOpen(true)}
            />
          </div>
        </div>
      </CardContent>
      {participantsDialogOpen && (
        <ParticipantsDialog
          group={group}
          item={item}
          open={participantsDialogOpen}
          onOpenChange={setParticipantsDialogOpen}
        />
      )}
    </Card>
  );
}
