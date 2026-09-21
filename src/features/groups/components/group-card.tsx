import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RoleBadge } from "@/features/groups/components/role-badge";
import type { Group } from "@/lib/api-types";

type GroupCardProps = {
  group: Group;
};

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link
      to="/groups/$groupId"
      params={{ groupId: group.id }}
      aria-label={`Abrir o grupo ${group.name}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="h-full border-border bg-card/70 shadow-none transition-colors group-hover:border-input group-hover:bg-card">
        <CardContent className="flex h-full min-h-48 flex-col p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-muted font-mono text-sm font-semibold text-foreground">
              {group.name.slice(0, 2).toLocaleUpperCase("pt-BR")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-semibold">{group.name}</h3>
                <RoleBadge role={group.role} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {group.description ||
                  "Um espaço para o grupo escolher e organizar a próxima partida."}
              </p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 border-t pt-4 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <Clock3 className="h-4 w-4 shrink-0" />
              <span className="truncate">{formatLastActivity(group.updatedAt)}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2 font-semibold text-foreground">
              Abrir lobby
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function formatLastActivity(updatedAt: string) {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) return "Atividade recente";

  return `Atualizado em ${new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date)}`;
}
