import { Crown, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GroupRole } from "@/lib/api-types";

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
