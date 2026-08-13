import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RoleBadge } from "@/features/groups/components/role-badge";
import type { Group } from "@/lib/api-types";

type GroupCardProps = {
  group: Group;
  position: number;
};

export function GroupCard({ group, position }: GroupCardProps) {
  return (
    <Link
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
              {String(position).padStart(2, "0")}
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
  );
}
