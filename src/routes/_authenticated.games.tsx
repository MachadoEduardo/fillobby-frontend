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
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-heading">Catálogo de jogos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre jogos para usar na fila dos grupos.
          </p>
        </div>
        <CreateGameDialog />
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border bg-card p-3">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {query.data?.games.map((g) => (
          <GameCard key={g.id} game={g} />
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

function GameCard({ game }: { game: Game }) {
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
    <Card className="group overflow-hidden transition-colors hover:border-primary/40">
      {game.coverUrl && (
        <img
          src={game.coverUrl}
          alt={game.title}
          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}
      <CardContent className="p-4">
        <h3 className="line-clamp-1 font-bold tracking-tight transition-colors group-hover:text-primary">
          {game.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1">
          {game.platforms.map((p) => (
            <Badge key={p} variant="secondary">
              {p}
            </Badge>
          ))}
          {game.maxPlayers && (
            <Badge variant="outline">até {game.maxPlayers} jogadores</Badge>
          )}
        </div>
        {game.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {game.description}
          </p>
        )}
        {isAuthor && (
          <div className="mt-3 flex gap-2">
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
    onSuccess: () => {
      toast.success("Jogo cadastrado!");
      qc.invalidateQueries({ queryKey: ["games"] });
      setOpen(false);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro."),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Novo jogo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar jogo</DialogTitle>
          <DialogDescription>
            O título é normalizado e deve ser único.
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
