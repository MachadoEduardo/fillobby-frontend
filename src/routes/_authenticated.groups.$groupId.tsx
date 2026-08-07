import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  api,
  ApiError,
  QUEUE_STATUS_LABEL,
  resolveApiAssetUrl,
} from "@/lib/api";
import type { Group, Member, QueueItem, QueueStatus } from "@/lib/api-types";
import { useAuth } from "@/lib/auth";
import { GROUP_LIVE_REFRESH_MS } from "@/lib/query-config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HistoryParticipants,
  QueueParticipants,
  VotersRoster,
} from "@/components/groups/people-roster";
import {
  ArrowLeft,
  Gamepad2,
  Copy,
  Crown,
  Shield,
  Users,
  ThumbsUp,
  ThumbsDown,
  Play,
  Check,
  X,
  Plus,
  Trash2,
  LogOut,
  RotateCw,
  Clock3,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/groups/$groupId")({
  head: ({ params }) => ({ meta: [{ title: `Grupo — Fillobby` }] }),
  component: GroupDetailPage,
});

function GroupDetailPage() {
  const { groupId } = Route.useParams();
  const groupQ = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => api.groups.get(groupId),
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  if (groupQ.isLoading)
    return <p className="text-sm text-muted-foreground">Carregando grupo...</p>;
  if (groupQ.error)
    return (
      <p className="text-sm text-destructive">
        {(groupQ.error as ApiError).message}
      </p>
    );
  if (!groupQ.data) return null;

  const group = groupQ.data;
  const isAdmin = group.role === "OWNER" || group.role === "ADMIN";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-brand px-5 py-6 text-brand-foreground sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-white/8" />
        <div className="pointer-events-none absolute -right-6 -top-10 h-40 w-40 rounded-full border border-signal/45" />
        <div className="relative flex flex-wrap items-start gap-4">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="shrink-0 text-brand-foreground/65 hover:bg-white/8 hover:text-brand-foreground"
          >
            <Link to="/groups" aria-label="Voltar para grupos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/8 font-mono text-lg font-semibold tracking-tight text-signal">
            {group.name.slice(0, 2).toLocaleUpperCase("pt-BR")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-signal">Lobby do grupo</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
                {group.name}
              </h1>
              <RoleBadge role={group.role} />
            </div>
            {group.description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-foreground/65">
                {group.description}
              </p>
            )}
            {group.inviteCode && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-brand-foreground/50">
                  Convite
                </span>
                <code className="mono-data rounded-lg border border-white/12 bg-white/8 px-3 py-1.5 text-sm font-semibold tracking-[0.16em] text-brand-foreground">
                  {group.inviteCode}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand-foreground/65 hover:bg-white/8 hover:text-brand-foreground"
                  onClick={() => {
                    navigator.clipboard.writeText(group.inviteCode!);
                    toast.success("Código copiado!");
                  }}
                >
                  <Copy className="h-3 w-3" /> Copiar
                </Button>
              </div>
            )}
          </div>
          {group.role !== "OWNER" && <LeaveGroupButton group={group} />}
        </div>
      </section>

      <Tabs defaultValue="queue">
        <TabsList className="h-auto w-full justify-start gap-5 overflow-x-auto rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="queue"
            className="rounded-none border-b-2 border-transparent px-1 py-3 data-[state=active]:border-signal data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Fila
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="rounded-none border-b-2 border-transparent px-1 py-3 data-[state=active]:border-signal data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Membros
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-none border-b-2 border-transparent px-1 py-3 data-[state=active]:border-signal data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Histórico
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="settings"
              className="rounded-none border-b-2 border-transparent px-1 py-3 data-[state=active]:border-signal data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
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
        {isAdmin && (
          <TabsContent value="settings" className="mt-6">
            <SettingsTab group={group} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function LeaveGroupButton({ group }: { group: Group }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => api.groups.leave(group.id),
    onSuccess: () => {
      toast.success("Você saiu do grupo.");
      qc.removeQueries({ queryKey: ["group", group.id] });
      qc.invalidateQueries({ queryKey: ["groups"] });
      navigate({ to: "/groups" });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Erro ao sair."),
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-brand-foreground/55 hover:bg-white/8 hover:text-brand-foreground"
      disabled={mutation.isPending}
      onClick={() => {
        if (confirm(`Sair de "${group.name}"?`)) mutation.mutate();
      }}
    >
      <LogOut className="mr-1 h-3 w-3" />
      {mutation.isPending ? "Saindo..." : "Sair do grupo"}
    </Button>
  );
}

function RoleBadge({ role }: { role: "OWNER" | "ADMIN" | "MEMBER" }) {
  if (role === "OWNER")
    return (
      <Badge className="gap-1 border-transparent bg-signal text-signal-foreground shadow-none">
        <Crown className="h-3 w-3" /> Dono
      </Badge>
    );
  if (role === "ADMIN")
    return (
      <Badge variant="secondary" className="gap-1">
        <Shield className="h-3 w-3" /> Admin
      </Badge>
    );
  return <Badge variant="outline">Membro</Badge>;
}

/* ============ QUEUE TAB ============ */

const QUEUE_STATUS_VARIANT: Record<QueueStatus, string> = {
  SUGGESTED: "bg-status-suggested/12 text-status-suggested",
  VOTING: "bg-status-voting/12 text-status-voting",
  WAITING_PLAYERS: "bg-status-waiting/12 text-status-waiting",
  READY: "bg-status-ready/12 text-status-ready",
  PLAYING: "bg-status-playing/12 text-status-playing",
  COMPLETED: "bg-status-completed/12 text-status-completed",
  CANCELLED: "bg-status-cancelled/12 text-status-cancelled",
};

const QUEUE_FLOW: Array<{ status: QueueStatus; label: string }> = [
  { status: "SUGGESTED", label: "Sugestão" },
  { status: "VOTING", label: "Votação" },
  { status: "WAITING_PLAYERS", label: "Jogadores" },
  { status: "READY", label: "Pronto" },
  { status: "PLAYING", label: "Jogando" },
];

const QUEUE_STATUS_MESSAGE: Record<QueueStatus, string> = {
  SUGGESTED: "Aguardando o grupo abrir a votação.",
  VOTING: "A escolha está com o grupo. Registre seu voto.",
  WAITING_PLAYERS: "Participantes selecionados estão confirmando prontidão.",
  READY: "A galera está pronta para começar.",
  PLAYING: "Partida em andamento.",
  COMPLETED: "Partida concluída e registrada no histórico.",
  CANCELLED: "Este item foi cancelado.",
};

function QueueProgress({ status }: { status: QueueStatus }) {
  const currentIndex = QUEUE_FLOW.findIndex((step) => step.status === status);

  if (status === "COMPLETED" || status === "CANCELLED") return null;

  return (
    <div
      className="grid grid-cols-5"
      aria-label={`Etapa atual: ${QUEUE_STATUS_LABEL[status]}`}
    >
      {QUEUE_FLOW.map((step, index) => {
        const reached = index <= currentIndex;
        const current = index === currentIndex;

        return (
          <div key={step.status} className="relative pt-5 text-center">
            {index > 0 && (
              <span
                className={cn(
                  "absolute left-0 top-[0.45rem] h-px w-1/2",
                  reached ? "bg-brand/45" : "bg-border",
                )}
              />
            )}
            {index < QUEUE_FLOW.length - 1 && (
              <span
                className={cn(
                  "absolute right-0 top-[0.45rem] h-px w-1/2",
                  index < currentIndex ? "bg-brand/45" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "absolute left-1/2 top-0 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-card",
                current
                  ? "bg-signal ring-2 ring-signal/20"
                  : reached
                    ? "bg-brand"
                    : "bg-border",
              )}
            />
            <span
              className={cn(
                "hidden text-[0.65rem] font-medium sm:block",
                current ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function QueueTab({ group }: { group: Group }) {
  const listQ = useQuery({
    queryKey: ["queue", group.id],
    queryFn: () => api.queue.list(group.id, { limit: 50, sort: "votes_desc" }),
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Decisão em andamento</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em]">
            Próximos jogos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Vote, reúna os participantes e leve a escolha até a partida.
          </p>
        </div>
        <SuggestGameDialog groupId={group.id} />
      </div>

      {listQ.isLoading && (
        <p className="text-sm text-muted-foreground">Carregando fila...</p>
      )}
      {listQ.error && (
        <p className="text-sm text-destructive">
          {(listQ.error as ApiError).message}
        </p>
      )}
      {listQ.data?.queueItems.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand/20 bg-card px-6 py-14 text-center">
          <span className="mono-data text-4xl font-semibold text-signal/55">
            01
          </span>
          <h3 className="mt-3 text-lg font-semibold">A fila está livre</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Sugira o primeiro jogo e dê ao grupo um ponto de partida para a
            próxima sessão.
          </p>
        </div>
      )}
      <div className="space-y-3">
        {listQ.data?.queueItems.map((item, index) => (
          <QueueItemCard
            key={item.id}
            item={item}
            group={group}
            position={index + 1}
          />
        ))}
      </div>
    </div>
  );
}

function QueueItemCard({
  item,
  group,
  position,
}: {
  item: QueueItem;
  group: Group;
  position: number;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = group.role === "OWNER" || group.role === "ADMIN";
  const isParticipant = user ? item.participantIds.includes(user.id) : false;
  const isReady = user ? item.readyUserIds.includes(user.id) : false;
  const canVote = item.status === "VOTING";
  const canSelectParticipants =
    isAdmin && (item.status === "VOTING" || item.status === "WAITING_PLAYERS");
  const canReady =
    isParticipant &&
    (item.status === "WAITING_PLAYERS" || item.status === "READY");
  const [selectOpen, setSelectOpen] = useState(false);
  const [voted, setVoted] = useState<boolean | null>(null); // optimistic UI hint
  const hasVoted = voted ?? item.viewerHasVoted;

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["queue", group.id] });
    qc.invalidateQueries({ queryKey: ["history", group.id] });
    qc.invalidateQueries({ queryKey: ["votes", group.id, item.id] });
  }

  const voteMut = useMutation({
    mutationFn: () => api.votes.create(group.id, item.id),
    onSuccess: () => {
      setVoted(true);
      invalidate();
    },
    onError: (e) => {
      if (e instanceof ApiError && e.code === "VOTE_ALREADY_EXISTS")
        setVoted(true);
      else toast.error(e instanceof ApiError ? e.message : "Erro ao votar.");
    },
  });
  const unvoteMut = useMutation({
    mutationFn: () => api.votes.removeOwn(group.id, item.id),
    onSuccess: () => {
      setVoted(false);
      invalidate();
    },
    onError: (e) => {
      if (e instanceof ApiError && e.code === "VOTE_NOT_FOUND") setVoted(false);
      else toast.error(e instanceof ApiError ? e.message : "Erro.");
    },
  });
  const readyMut = useMutation({
    mutationFn: () => api.queue.markReady(group.id, item.id),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });
  const unreadyMut = useMutation({
    mutationFn: () => api.queue.unmarkReady(group.id, item.id),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });
  const transMut = useMutation({
    mutationFn: (status: "VOTING" | "PLAYING" | "COMPLETED") =>
      api.queue.transition(group.id, item.id, status),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });
  const cancelMut = useMutation({
    mutationFn: () => api.queue.cancel(group.id, item.id),
    onSuccess: () => {
      toast.success("Item cancelado.");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });

  return (
    <Card className="overflow-hidden border-brand/12 shadow-[0_14px_40px_-34px_#17313a] transition-colors hover:border-brand/25">
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
                className="mt-3 aspect-[4/5] w-full rounded-lg object-cover"
              />
            ) : (
              <div className="mt-3 flex aspect-[4/5] w-full items-center justify-center rounded-lg bg-brand/8 text-muted-foreground">
                <Gamepad2 className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="min-w-0 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-bold tracking-[-0.025em]">
                  {item.game.title}
                </h3>
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
                <span className="mono-data text-sm font-semibold">
                  {item.voteCount}
                </span>
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

            {(item.participants.length > 0 ||
              canVote ||
              item.voteCount > 0) && (
              <div className="mt-4 grid gap-2 lg:grid-cols-2">
                {item.participants.length > 0 && (
                  <QueueParticipants
                    participants={item.participants}
                    readyUserIds={item.readyUserIds}
                  />
                )}
                {(canVote || item.voteCount > 0) && (
                  <VotersRoster
                    groupId={group.id}
                    itemId={item.id}
                    voteCount={item.voteCount}
                  />
                )}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
              {canVote &&
                (hasVoted ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={unvoteMut.isPending}
                    onClick={() => unvoteMut.mutate()}
                  >
                    <ThumbsDown className="mr-1 h-3 w-3" /> Remover voto
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-signal text-signal-foreground hover:bg-signal/90"
                    disabled={voteMut.isPending}
                    onClick={() => voteMut.mutate()}
                  >
                    <ThumbsUp className="mr-1 h-3 w-3" /> Votar neste jogo
                  </Button>
                ))}

              {canReady &&
                (isReady ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={unreadyMut.isPending}
                    onClick={() => unreadyMut.mutate()}
                  >
                    <X className="mr-1 h-3 w-3" /> Não estou pronto
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-status-ready text-white hover:bg-status-ready/90"
                    disabled={readyMut.isPending}
                    onClick={() => readyMut.mutate()}
                  >
                    <Check className="mr-1 h-3 w-3" /> Estou pronto
                  </Button>
                ))}

              {canSelectParticipants && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectOpen(true)}
                >
                  <Users className="mr-1 h-3 w-3" /> Selecionar participantes
                </Button>
              )}

              {isAdmin && item.status === "SUGGESTED" && (
                <Button
                  size="sm"
                  disabled={transMut.isPending}
                  onClick={() => transMut.mutate("VOTING")}
                >
                  <ThumbsUp className="mr-1 h-3 w-3" /> Iniciar votação
                </Button>
              )}
              {isAdmin && item.status === "READY" && (
                <Button
                  size="sm"
                  className="bg-signal text-signal-foreground hover:bg-signal/90"
                  disabled={transMut.isPending}
                  onClick={() => transMut.mutate("PLAYING")}
                >
                  <Play className="mr-1 h-3 w-3" /> Iniciar partida
                </Button>
              )}
              {isAdmin && item.status === "PLAYING" && (
                <Button
                  size="sm"
                  disabled={transMut.isPending}
                  onClick={() => transMut.mutate("COMPLETED")}
                >
                  <Check className="mr-1 h-3 w-3" /> Concluir partida
                </Button>
              )}
              {isAdmin &&
                item.status !== "COMPLETED" &&
                item.status !== "CANCELLED" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="sm:ml-auto"
                    disabled={cancelMut.isPending}
                    onClick={() => {
                      if (confirm("Cancelar este item?")) cancelMut.mutate();
                    }}
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Cancelar
                  </Button>
                )}
            </div>
          </div>
        </div>
      </CardContent>
      {selectOpen && (
        <ParticipantsDialog
          group={group}
          item={item}
          open={selectOpen}
          onOpenChange={setSelectOpen}
        />
      )}
    </Card>
  );
}

function ParticipantsDialog({
  group,
  item,
  open,
  onOpenChange,
}: {
  group: Group;
  item: QueueItem;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const membersQ = useQuery({
    queryKey: ["members", group.id],
    queryFn: () => api.groups.listMembers(group.id, { limit: 100 }),
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
    enabled: open,
  });
  const [selected, setSelected] = useState<string[]>(item.participantIds);
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () => api.queue.setParticipants(group.id, item.id, selected),
    onSuccess: () => {
      toast.success("Participantes atualizados.");
      qc.invalidateQueries({ queryKey: ["queue", group.id] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecionar participantes</DialogTitle>
        </DialogHeader>
        {item.game.maxPlayers && (
          <p className="text-xs text-muted-foreground">
            Máximo: {item.game.maxPlayers} jogadores (selecionados:{" "}
            {selected.length}).
          </p>
        )}
        {membersQ.isLoading && <p className="text-sm">Carregando...</p>}
        <div className="space-y-2">
          {membersQ.data?.members.map((m) => (
            <label
              key={m.id}
              className="flex items-center gap-3 rounded p-2 hover:bg-accent"
            >
              <Checkbox
                checked={selected.includes(m.id)}
                onCheckedChange={() => toggle(m.id)}
              />
              <Avatar className="h-8 w-8">
                <AvatarImage src={resolveApiAssetUrl(m.avatarUrl)} />
                <AvatarFallback>
                  {m.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{m.name}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button
            disabled={mut.isPending || selected.length === 0}
            onClick={() => mut.mutate()}
          >
            {mut.isPending ? "Salvando..." : "Salvar participantes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SuggestGameDialog({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const gamesQ = useQuery({
    queryKey: ["games", { search, page: 1 }],
    queryFn: () => api.games.list({ search: search || undefined, limit: 30 }),
    enabled: open,
  });
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (gameId: string) => api.queue.create(groupId, gameId),
    onSuccess: () => {
      toast.success("Jogo adicionado à fila!");
      qc.invalidateQueries({ queryKey: ["queue", groupId] });
      setOpen(false);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-3 w-3" /> Sugerir jogo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sugerir um jogo</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Buscar no catálogo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {gamesQ.isLoading && <p className="text-sm">Carregando...</p>}
        <div className="space-y-1">
          {gamesQ.data?.games.map((g) => (
            <button
              key={g.id}
              type="button"
              disabled={mut.isPending}
              onClick={() => mut.mutate(g.id)}
              className="flex w-full items-center gap-3 rounded p-2 text-left hover:bg-accent"
            >
              {g.coverUrl ? (
                <img
                  src={g.coverUrl}
                  alt=""
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-muted" />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{g.title}</div>
                <div className="text-xs text-muted-foreground">
                  {g.platforms.join(", ")}
                </div>
              </div>
            </button>
          ))}
          {gamesQ.data?.games.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Nenhum jogo encontrado. Cadastre no catálogo primeiro.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============ MEMBERS TAB ============ */

function MembersTab({ group }: { group: Group }) {
  const membersQ = useQuery({
    queryKey: ["members", group.id],
    queryFn: () => api.groups.listMembers(group.id, { limit: 100 }),
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });
  const isAdmin = group.role === "OWNER" || group.role === "ADMIN";
  const removedQ = useQuery({
    queryKey: ["members", group.id, "removed"],
    queryFn: () =>
      api.groups.listMembers(group.id, { limit: 100, status: "REMOVED" }),
    enabled: isAdmin,
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {membersQ.isLoading && (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        )}
        {membersQ.data?.members.map((m) => (
          <MemberRow key={m.id} member={m} group={group} />
        ))}
      </div>
      {isAdmin && removedQ.data?.members.length ? (
        <div className="space-y-3 border-t pt-6">
          <div>
            <h3 className="font-semibold">Membros removidos</h3>
            <p className="text-sm text-muted-foreground">
              Restaure o acesso de quem foi removido anteriormente.
            </p>
          </div>
          {removedQ.data.members.map((member) => (
            <RemovedMemberRow key={member.id} member={member} group={group} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RemovedMemberRow({ member, group }: { member: Member; group: Group }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => api.groups.restoreMember(group.id, member.id),
    onSuccess: () => {
      toast.success("Membro restaurado.");
      qc.invalidateQueries({ queryKey: ["members", group.id] });
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível restaurar.",
      ),
  });

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-wrap items-center gap-3 p-3">
        <Avatar>
          <AvatarImage src={resolveApiAssetUrl(member.avatarUrl)} />
          <AvatarFallback>
            {member.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium">{member.name}</div>
          <div className="text-xs text-muted-foreground">{member.email}</div>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Restaurando..." : "Restaurar acesso"}
        </Button>
      </CardContent>
    </Card>
  );
}

function MemberRow({ member, group }: { member: Member; group: Group }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isSelf = user?.id === member.id;
  const isOwner = group.role === "OWNER";
  const isAdmin = isOwner || group.role === "ADMIN";
  const canChangeRole = isOwner && member.role !== "OWNER" && !isSelf;
  const canRemove =
    !isSelf &&
    member.role !== "OWNER" &&
    (isOwner || (group.role === "ADMIN" && member.role === "MEMBER"));
  const canTransfer = isOwner && !isSelf && member.role !== "OWNER";

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["members", group.id] });
    qc.invalidateQueries({ queryKey: ["group", group.id] });
    qc.invalidateQueries({ queryKey: ["groups"] });
  }

  const roleMut = useMutation({
    mutationFn: (role: "ADMIN" | "MEMBER") =>
      api.groups.changeRole(group.id, member.id, role),
    onSuccess: () => {
      toast.success("Papel alterado.");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });
  const removeMut = useMutation({
    mutationFn: () => api.groups.removeMember(group.id, member.id),
    onSuccess: () => {
      toast.success("Membro removido.");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });
  const transferMut = useMutation({
    mutationFn: () => api.groups.transferOwner(group.id, member.id),
    onSuccess: () => {
      toast.success("Propriedade transferida.");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-3 p-3">
        <Avatar>
          <AvatarImage src={resolveApiAssetUrl(member.avatarUrl)} />
          <AvatarFallback>
            {member.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium">
            {member.name}{" "}
            {isSelf && (
              <span className="text-xs text-muted-foreground">(você)</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{member.email}</div>
        </div>
        <RoleBadge role={member.role} />
        {canChangeRole && (
          <Select
            value={member.role === "ADMIN" ? "ADMIN" : "MEMBER"}
            onValueChange={(v) => roleMut.mutate(v as "ADMIN" | "MEMBER")}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="MEMBER">Membro</SelectItem>
            </SelectContent>
          </Select>
        )}
        {canTransfer && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (confirm(`Transferir propriedade para ${member.name}?`))
                transferMut.mutate();
            }}
          >
            <Crown className="mr-1 h-3 w-3" /> Tornar dono
          </Button>
        )}
        {canRemove && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm(`Remover ${member.name} do grupo?`))
                removeMut.mutate();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/* ============ HISTORY TAB ============ */

function HistoryTab({ group }: { group: Group }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [gameId, setGameId] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [page, setPage] = useState(1);

  const gamesQ = useQuery({
    queryKey: ["games-all"],
    queryFn: () => api.games.list({ limit: 100 }),
  });
  const membersQ = useQuery({
    queryKey: ["members", group.id],
    queryFn: () => api.groups.listMembers(group.id, { limit: 100 }),
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  const historyQ = useQuery({
    queryKey: ["history", group.id, { from, to, gameId, participantId, page }],
    queryFn: () =>
      api.history.list(group.id, {
        from: from || undefined,
        to: to || undefined,
        gameId: gameId || undefined,
        participantId: participantId || undefined,
        page,
        limit: 20,
      }),
    refetchInterval: GROUP_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs">De</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Até</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Jogo</Label>
            <Select
              value={gameId || "ALL"}
              onValueChange={(v) => {
                setGameId(v === "ALL" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {gamesQ.data?.games.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Participante</Label>
            <Select
              value={participantId || "ALL"}
              onValueChange={(v) => {
                setParticipantId(v === "ALL" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {membersQ.data?.members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {historyQ.isLoading && (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      )}
      {historyQ.data?.historyItems.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma partida concluída ainda.
        </p>
      )}
      <div className="space-y-2">
        {historyQ.data?.historyItems.map((it) => (
          <Card key={it.id}>
            <CardContent className="space-y-3 p-3">
              <div className="flex items-center gap-3">
                {it.game.coverUrl ? (
                  <img
                    src={it.game.coverUrl}
                    alt=""
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-muted-foreground">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{it.game.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Concluído em{" "}
                    {it.completedAt
                      ? new Date(it.completedAt).toLocaleString("pt-BR")
                      : "-"}
                  </div>
                </div>
                <Badge variant="outline">{it.voteCount} voto(s)</Badge>
              </div>
              <HistoryParticipants participants={it.participants} />
            </CardContent>
          </Card>
        ))}
      </div>

      {historyQ.data && historyQ.data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            {historyQ.data.meta.page} / {historyQ.data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= historyQ.data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

/* ============ SETTINGS TAB ============ */

function SettingsTab({ group }: { group: Group }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");

  const updateMut = useMutation({
    mutationFn: () =>
      api.groups.update(group.id, { name, description: description || null }),
    onSuccess: () => {
      toast.success("Grupo atualizado.");
      qc.invalidateQueries({ queryKey: ["group", group.id] });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });
  const deleteMut = useMutation({
    mutationFn: () => api.groups.deactivate(group.id),
    onSuccess: () => {
      toast.success("Grupo inativado.");
      qc.invalidateQueries({ queryKey: ["groups"] });
      navigate({ to: "/groups" });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });
  const regenerateInviteMut = useMutation({
    mutationFn: () => api.groups.regenerateInvite(group.id),
    onSuccess: () => {
      toast.success("Código de convite renovado.");
      qc.invalidateQueries({ queryKey: ["group", group.id] });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível renovar o código.",
      ),
  });

  const isOwner = group.role === "OWNER";
  const isAdmin = isOwner || group.role === "ADMIN";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMut.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                required
                minLength={3}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={updateMut.isPending}>
              {updateMut.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Código de convite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Renovar o código invalida imediatamente o convite anterior.
            </p>
            <Button
              variant="outline"
              disabled={regenerateInviteMut.isPending}
              onClick={() => {
                if (confirm("Renovar o código de convite atual?"))
                  regenerateInviteMut.mutate();
              }}
            >
              <RotateCw className="mr-2 h-4 w-4" />
              {regenerateInviteMut.isPending
                ? "Renovando..."
                : "Renovar código"}
            </Button>
          </CardContent>
        </Card>
      )}
      {isOwner && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de perigo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Inativar o grupo remove todas as associações ativas. Esta ação não
              pode ser desfeita pela interface.
            </p>
            <Button
              variant="destructive"
              disabled={deleteMut.isPending}
              onClick={() => {
                if (confirm(`Inativar o grupo "${group.name}"?`))
                  deleteMut.mutate();
              }}
            >
              Inativar grupo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
