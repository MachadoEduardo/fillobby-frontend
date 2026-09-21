import { Crown, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GroupRole } from "@/lib/api-types";

export function RoleBadge({ role }: { role: GroupRole }) {
  if (role === "OWNER") {
    return (
      <Badge variant="outline" className="gap-1 bg-muted text-foreground shadow-none">
        <Crown className="h-3 w-3" /> Dono
      </Badge>
    );
  }

  if (role === "ADMIN") {
    return (
      <Badge variant="outline" className="gap-1 bg-muted text-foreground">
        <Shield className="h-3 w-3" /> Admin
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-muted-foreground">
      Membro
    </Badge>
  );
}
