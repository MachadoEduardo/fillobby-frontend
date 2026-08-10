import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Copy, Crown, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { Group, GroupRole } from "@/lib/api-types";
import { queryKeys } from "@/lib/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function GroupHeader({ group }: { group: Group }) {
  const inviteCode = group.inviteCode;

  return (
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
          {inviteCode && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-brand-foreground/50">Convite</span>
              <code className="mono-data rounded-lg border border-white/12 bg-white/8 px-3 py-1.5 text-sm font-semibold tracking-[0.16em] text-brand-foreground">
                {inviteCode}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="text-brand-foreground/65 hover:bg-white/8 hover:text-brand-foreground"
                onClick={() => {
                  navigator.clipboard.writeText(inviteCode);
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
  );
}

export function RoleBadge({ role }: { role: GroupRole }) {
  if (role === "OWNER") {
    return (
      <Badge className="gap-1 border-transparent bg-signal text-signal-foreground shadow-none">
        <Crown className="h-3 w-3" /> Dono
      </Badge>
    );
  }
  if (role === "ADMIN") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Shield className="h-3 w-3" /> Admin
      </Badge>
    );
  }
  return <Badge variant="outline">Membro</Badge>;
}

function LeaveGroupButton({ group }: { group: Group }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const leaveGroup = useMutation({
    mutationFn: () => api.groups.leave(group.id),
    onSuccess: () => {
      toast.success("Você saiu do grupo.");
      queryClient.removeQueries({ queryKey: queryKeys.group.detail(group.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
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
      disabled={leaveGroup.isPending}
      onClick={() => {
        if (confirm(`Sair de "${group.name}"?`)) leaveGroup.mutate();
      }}
    >
      <LogOut className="mr-1 h-3 w-3" />
      {leaveGroup.isPending ? "Saindo..." : "Sair do grupo"}
    </Button>
  );
}
