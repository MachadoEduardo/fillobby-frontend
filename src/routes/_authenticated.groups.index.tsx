import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
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
import { ArrowUpRight, Crown, KeyRound, Plus, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/groups/")({
  head: () => ({ meta: [{ title: "Grupos — Fillobby" }] }),
  component: GroupsPage,
});

function GroupsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["groups"],
    queryFn: () => api.groups.list({ limit: 50 }),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Seus lobbies</p>
          <h1 className="page-heading mt-2">Onde a galera se encontra</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Retome uma decisão em andamento ou abra espaço para a próxima
            partida.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <JoinGroupDialog />
          <CreateGroupDialog />
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando grupos...</p>
      )}
      {error && (
        <p className="text-sm text-destructive">
          {(error as ApiError).message}
        </p>
      )}

      {data && data.groups.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand/20 bg-card px-6 py-14 text-center">
          <span className="mono-data text-4xl font-semibold text-signal/55">
            00
          </span>
          <h3 className="mt-3 text-lg font-semibold">Nenhum lobby aberto</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Crie um grupo para reunir seus amigos ou use o código de um convite
            que você recebeu.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {data?.groups.map((group, index) => (
          <Link
            key={group.id}
            to="/groups/$groupId"
            params={{ groupId: group.id }}
            className="group"
          >
            <Card className="h-full overflow-hidden border-brand/12 shadow-[0_14px_40px_-34px_#17313a] transition-all group-hover:-translate-y-0.5 group-hover:border-brand/30">
              <CardContent className="flex min-h-52 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand font-mono text-sm font-semibold text-brand-foreground">
                    {group.name.slice(0, 2).toLocaleUpperCase("pt-BR")}
                  </div>
                  <span className="mono-data text-xs text-muted-foreground/65">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-bold tracking-[-0.025em]">
                      {group.name}
                    </h2>
                    <RoleBadge role={group.role} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {group.description ||
                      "Um espaço para o grupo escolher e organizar a próxima partida."}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm font-semibold">
                  <span>Abrir lobby</span>
                  <ArrowUpRight className="h-4 w-4 text-signal transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
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

function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      api.groups.create({ name, description: description || null }),
    onSuccess: () => {
      toast.success("Grupo criado!");
      qc.invalidateQueries({ queryKey: ["groups"] });
      setOpen(false);
      setName("");
      setDescription("");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Erro ao criar grupo."),
  });
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-signal text-signal-foreground hover:bg-signal/90">
          <Plus className="mr-2 h-4 w-4" /> Novo grupo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar novo grupo</DialogTitle>
          <DialogDescription>
            Você será o dono do grupo criado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="g-name">Nome</Label>
            <Input
              id="g-name"
              required
              minLength={3}
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="g-desc">Descrição (opcional)</Label>
            <Textarea
              id="g-desc"
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Criando..." : "Criar grupo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function JoinGroupDialog() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => api.groups.join({ inviteCode: code }),
    onSuccess: () => {
      toast.success("Você entrou no grupo!");
      qc.invalidateQueries({ queryKey: ["groups"] });
      setOpen(false);
      setCode("");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Erro ao entrar."),
  });
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <KeyRound className="mr-2 h-4 w-4" /> Entrar por código
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entrar em um grupo</DialogTitle>
          <DialogDescription>
            Informe o código de convite recebido.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="j-code">Código de convite</Label>
            <Input
              id="j-code"
              required
              maxLength={32}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
