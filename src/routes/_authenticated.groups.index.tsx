import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, KeyRound, Users, Crown, Shield } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Meus grupos</h1>
          <p className="text-sm text-muted-foreground">
            Crie um novo grupo ou entre em um existente com um código de convite.
          </p>
        </div>
        <div className="flex gap-2">
          <JoinGroupDialog />
          <CreateGroupDialog />
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando grupos...</p>}
      {error && <p className="text-sm text-destructive">{(error as ApiError).message}</p>}

      {data && data.groups.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 text-lg font-medium">Nenhum grupo ainda</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie um novo grupo ou entre com um código de convite.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.groups.map((g) => (
          <Link key={g.id} to="/groups/$groupId" params={{ groupId: g.id }}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1">{g.name}</CardTitle>
                  <RoleBadge role={g.role} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
                  {g.description || "Sem descrição."}
                </p>
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
    return <Badge className="gap-1"><Crown className="h-3 w-3" /> Dono</Badge>;
  if (role === "ADMIN")
    return <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> Admin</Badge>;
  return <Badge variant="outline">Membro</Badge>;
}

function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => api.groups.create({ name, description: description || null }),
    onSuccess: () => {
      toast.success("Grupo criado!");
      qc.invalidateQueries({ queryKey: ["groups"] });
      setOpen(false);
      setName(""); setDescription("");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro ao criar grupo."),
  });
  function onSubmit(e: FormEvent) { e.preventDefault(); mutation.mutate(); }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Novo grupo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar novo grupo</DialogTitle>
          <DialogDescription>Você será o dono do grupo criado.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="g-name">Nome</Label>
            <Input id="g-name" required minLength={3} maxLength={80}
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="g-desc">Descrição (opcional)</Label>
            <Textarea id="g-desc" maxLength={500} value={description}
              onChange={(e) => setDescription(e.target.value)} />
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
      setOpen(false); setCode("");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro ao entrar."),
  });
  function onSubmit(e: FormEvent) { e.preventDefault(); mutation.mutate(); }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><KeyRound className="mr-2 h-4 w-4" /> Entrar por código</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entrar em um grupo</DialogTitle>
          <DialogDescription>Informe o código de convite recebido.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="j-code">Código de convite</Label>
            <Input id="j-code" required maxLength={32} value={code}
              onChange={(e) => setCode(e.target.value)} />
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
