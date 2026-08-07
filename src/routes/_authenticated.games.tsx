import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { PLATFORMS, type Game, type Platform } from "@/lib/api-types";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Gamepad2, Pencil, Plus, Search, Trash2, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/games")({
  head: () => ({ meta: [{ title: "Jogos — Fillobby" }] }),
  component: GamesPage,
});

function GamesPage() {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<Platform | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["games", { search, platform, page }],
    queryFn: () =>
      api.games.list({
        search: search || undefined,
        platform: platform === "ALL" ? undefined : platform,
        page,
        limit: 20,
      }),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Biblioteca compartilhada</p>
          <h1 className="page-heading mt-2">Catálogo de jogos</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Descubra o que já está disponível ou adicione uma nova opção para as
            filas dos seus grupos.
          </p>
        </div>
        <CreateGameDialog />
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-brand/12 bg-card p-3 shadow-[0_14px_40px_-36px_#17313a]">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar jogos..."
            value={search}
            className="pl-9"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={platform}
          onValueChange={(v) => {
            setPlatform(v as Platform | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas plataformas</SelectItem>
            {PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.isLoading && (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      )}
      {query.error && (
        <p className="text-sm text-destructive">
          {(query.error as ApiError).message}
        </p>
      )}

      {query.data && (
        <div className="flex items-center justify-between gap-3">
          <p className="mono-data text-xs text-muted-foreground">
            {String(query.data.meta.total).padStart(2, "0")}{" "}
            {query.data.meta.total === 1
              ? "jogo encontrado"
              : "jogos encontrados"}
          </p>
          {(search || platform !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setPlatform("ALL");
                setPage(1);
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      )}

      {query.data?.games.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand/20 bg-card px-6 py-14 text-center">
          <span className="mono-data text-4xl font-semibold text-signal/55">
            00
          </span>
          <h3 className="mt-3 text-lg font-semibold">Nenhum jogo por aqui</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Ajuste os filtros ou cadastre uma opção para ampliar a biblioteca do
            grupo.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {query.data?.games.map((game, index) => (
          <GameCard key={game.id} game={game} position={index + 1} />
        ))}
      </div>

      {query.data && query.data.meta.totalPages > 1 && (
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
            Página {query.data.meta.page} de {query.data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= query.data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

function GameCard({ game, position }: { game: Game; position: number }) {
  const { user } = useAuth();
  const isAuthor = user?.id === game.createdById;
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const deactivate = useMutation({
    mutationFn: () => api.games.deactivate(game.id),
    onSuccess: () => {
      toast.success("Jogo inativado.");
      qc.invalidateQueries({ queryKey: ["games"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });

  return (
    <Card className="group overflow-hidden border-brand/12 shadow-[0_14px_40px_-34px_#17313a] transition-all hover:-translate-y-0.5 hover:border-brand/30">
      <div className="relative overflow-hidden bg-brand">
        {game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.title}
            className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex aspect-[16/10] w-full items-center justify-center bg-brand text-brand-foreground/35">
            <Gamepad2 className="h-9 w-9" />
          </div>
        )}
        <span className="mono-data absolute left-3 top-3 rounded-md bg-brand/85 px-2 py-1 text-[0.65rem] font-semibold text-brand-foreground backdrop-blur">
          {String(position).padStart(2, "0")}
        </span>
      </div>
      <CardContent className="flex min-h-48 flex-col p-4">
        <h3 className="line-clamp-1 text-lg font-bold tracking-[-0.025em] transition-colors group-hover:text-signal">
          {game.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1">
          {game.platforms.map((p) => (
            <Badge key={p} variant="secondary">
              {p}
            </Badge>
          ))}
          {game.maxPlayers && (
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" /> até {game.maxPlayers}
            </Badge>
          )}
        </div>
        {game.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {game.description}
          </p>
        )}
        {isAuthor && (
          <div className="mt-auto flex gap-2 border-t pt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
            >
              <Pencil className="mr-1 h-3 w-3" /> Editar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm(`Inativar "${game.title}"?`)) deactivate.mutate();
              }}
            >
              <Trash2 className="mr-1 h-3 w-3" /> Inativar
            </Button>
          </div>
        )}
      </CardContent>
      {editing && (
        <EditGameDialog game={game} open={editing} onOpenChange={setEditing} />
      )}
    </Card>
  );
}

function GameForm({
  initial,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial?: Partial<Game>;
  onSubmit: (data: {
    title: string;
    platforms: Platform[];
    maxPlayers: number | null;
    coverUrl: string | null;
    description: string | null;
  }) => void;
  submitting: boolean;
  submitLabel: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [platforms, setPlatforms] = useState<Platform[]>(
    initial?.platforms ?? [],
  );
  const [maxPlayers, setMaxPlayers] = useState<string>(
    initial?.maxPlayers?.toString() ?? "",
  );
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (platforms.length === 0) {
      toast.error("Selecione ao menos uma plataforma.");
      return;
    }
    onSubmit({
      title,
      platforms,
      maxPlayers: maxPlayers ? Number(maxPlayers) : null,
      coverUrl: coverUrl || null,
      description: description || null,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label>Título</Label>
        <Input
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Plataformas</Label>
        <div className="flex flex-wrap gap-3">
          {PLATFORMS.map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={platforms.includes(p)}
                onCheckedChange={() => togglePlatform(p)}
              />
              {p}
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Máx. jogadores</Label>
          <Input
            type="number"
            min={1}
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>URL da capa</Label>
          <Input
            type="url"
            value={coverUrl ?? ""}
            onChange={(e) => setCoverUrl(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea
          maxLength={1000}
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

function CreateGameDialog() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof api.games.create>[0]) =>
      api.games.create(data),
    onSuccess: ({ reactivated }) => {
      toast.success(
        reactivated ? "Jogo existente reativado!" : "Jogo cadastrado!",
      );
      qc.invalidateQueries({ queryKey: ["games"] });
      setOpen(false);
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError && e.code === "GAME_ALREADY_EXISTS"
          ? "Este jogo já está cadastrado no catálogo."
          : e instanceof ApiError
            ? e.message
            : "Erro ao cadastrar jogo.",
      ),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-signal text-signal-foreground hover:bg-signal/90">
          <Plus className="mr-2 h-4 w-4" /> Novo jogo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar jogo</DialogTitle>
          <DialogDescription>
            O título é normalizado e deve ser único. Se um jogo inativo já
            existir, ele será reativado.
          </DialogDescription>
        </DialogHeader>
        <GameForm
          submitting={mutation.isPending}
          submitLabel="Cadastrar"
          onSubmit={(data) => mutation.mutate(data)}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditGameDialog({
  game,
  open,
  onOpenChange,
}: {
  game: Game;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof api.games.update>[1]) =>
      api.games.update(game.id, data),
    onSuccess: () => {
      toast.success("Jogo atualizado.");
      qc.invalidateQueries({ queryKey: ["games"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar jogo</DialogTitle>
        </DialogHeader>
        <GameForm
          initial={game}
          submitting={mutation.isPending}
          submitLabel="Salvar"
          onSubmit={(data) => mutation.mutate(data)}
        />
      </DialogContent>
    </Dialog>
  );
}
