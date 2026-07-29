import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Search,
  ThumbsUp,
  UserRound,
  Users,
} from "lucide-react";
import { api, ApiError, resolveApiAssetUrl } from "@/lib/api";
import type { UserSummary } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

type PersonState = "ready" | "waiting" | "voted" | "played";

interface RosterPerson {
  user: UserSummary;
  state: PersonState;
}

interface PeopleRosterProps {
  title: string;
  summary: string;
  people: RosterPerson[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  errorMessage?: string;
  emptyMessage: string;
}

const STATE_CONTENT: Record<
  PersonState,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  ready: {
    label: "Pronto",
    icon: CheckCircle2,
    className: "text-emerald-600 dark:text-emerald-400",
  },
  waiting: {
    label: "Aguardando",
    icon: Clock3,
    className: "text-muted-foreground",
  },
  voted: {
    label: "Votou",
    icon: ThumbsUp,
    className: "text-primary",
  },
  played: {
    label: "Participou",
    icon: CheckCircle2,
    className: "text-muted-foreground",
  },
};

function PersonAvatar({
  user,
  className,
}: {
  user: UserSummary;
  className?: string;
}) {
  return (
    <Avatar className={cn("h-8 w-8", className)}>
      <AvatarImage src={resolveApiAssetUrl(user.avatarUrl)} alt={user.name} />
      <AvatarFallback>
        <UserRound className="h-4 w-4 text-muted-foreground" />
      </AvatarFallback>
    </Avatar>
  );
}

function AvatarStack({ people }: { people: RosterPerson[] }) {
  const visible = people.slice(0, 5);
  const remaining = people.length - visible.length;

  if (!visible.length) return null;

  return (
    <div className="flex shrink-0 items-center" aria-label="Pessoas na lista">
      {visible.map(({ user }, index) => (
        <PersonAvatar
          key={user.id}
          user={user}
          className={cn(
            "h-7 w-7 border-2 border-background",
            index > 0 && "-ml-2",
          )}
        />
      ))}
      {remaining > 0 && (
        <span className="-ml-2 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-background bg-muted px-1.5 text-[11px] text-muted-foreground">
          +{remaining}
        </span>
      )}
    </div>
  );
}

function RosterRows({
  people,
  loading,
  errorMessage,
  emptyMessage,
}: Pick<
  PeopleRosterProps,
  "people" | "loading" | "errorMessage" | "emptyMessage"
>) {
  if (loading) {
    return (
      <div className="space-y-3 p-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (errorMessage) {
    return <p className="p-3 text-sm text-destructive">{errorMessage}</p>;
  }

  if (!people.length) {
    return <p className="p-3 text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="divide-y">
      {people.map(({ user, state }) => {
        const content = STATE_CONTENT[state];
        const StateIcon = content.icon;

        return (
          <div key={user.id} className="flex items-center gap-3 px-3 py-2.5">
            <PersonAvatar user={user} />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {user.name}
            </span>
            <span
              className={cn(
                "flex shrink-0 items-center gap-1.5 text-xs",
                content.className,
              )}
            >
              <StateIcon className="h-3.5 w-3.5" />
              {content.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PeopleRoster({
  title,
  summary,
  people,
  open,
  onOpenChange,
  loading,
  errorMessage,
  emptyMessage,
}: PeopleRosterProps) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const filteredPeople = normalizedSearch
    ? people.filter(({ user }) =>
        user.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
      )
    : people;

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="overflow-hidden rounded-lg border bg-muted/20">
        <CollapsibleTrigger className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Users className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">{title}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {summary}
            </span>
          </span>
          <AvatarStack people={people} />
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t">
          {!loading && people.length >= 5 && (
            <div className="border-b p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar pessoa..."
                  aria-label={`Buscar em ${title.toLocaleLowerCase("pt-BR")}`}
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>
          )}
          <RosterRows
            people={filteredPeople}
            loading={loading}
            errorMessage={errorMessage}
            emptyMessage={
              normalizedSearch ? "Nenhuma pessoa encontrada." : emptyMessage
            }
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function QueueParticipants({
  participants,
  readyUserIds,
}: {
  participants: UserSummary[];
  readyUserIds: string[];
}) {
  const [open, setOpen] = useState(true);
  const readyIds = new Set(readyUserIds);
  const people = participants.map<RosterPerson>((user) => ({
    user,
    state: readyIds.has(user.id) ? "ready" : "waiting",
  }));

  return (
    <PeopleRoster
      title="Participantes"
      summary={`${readyUserIds.length} de ${participants.length} prontos`}
      people={people}
      open={open}
      onOpenChange={setOpen}
      emptyMessage="Nenhum participante selecionado."
    />
  );
}

export function HistoryParticipants({
  participants,
}: {
  participants: UserSummary[];
}) {
  const [open, setOpen] = useState(true);
  const people = participants.map<RosterPerson>((user) => ({
    user,
    state: "played",
  }));

  return (
    <PeopleRoster
      title="Participantes da partida"
      summary={`${participants.length} ${
        participants.length === 1 ? "jogador" : "jogadores"
      }`}
      people={people}
      open={open}
      onOpenChange={setOpen}
      emptyMessage="Nenhum participante registrado."
    />
  );
}

export function VotersRoster({
  groupId,
  itemId,
  voteCount,
}: {
  groupId: string;
  itemId: string;
  voteCount: number;
}) {
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ["votes", groupId, itemId],
    queryFn: () => api.votes.list(groupId, itemId, { limit: 100 }),
    enabled: open,
  });
  const people =
    query.data?.votes.map<RosterPerson>((vote) => ({
      user: vote.user,
      state: "voted",
    })) ?? [];
  const errorMessage = query.error
    ? query.error instanceof ApiError
      ? query.error.message
      : "Não foi possível carregar os votos."
    : undefined;

  return (
    <PeopleRoster
      title="Votos"
      summary={`${voteCount} ${voteCount === 1 ? "voto registrado" : "votos registrados"}`}
      people={people}
      open={open}
      onOpenChange={setOpen}
      loading={query.isLoading}
      errorMessage={errorMessage}
      emptyMessage="Ninguém votou neste jogo ainda."
    />
  );
}
