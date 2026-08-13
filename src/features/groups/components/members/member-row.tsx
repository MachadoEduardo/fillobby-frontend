import { Crown, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleBadge } from "@/features/groups/components/role-badge";
import { useMemberActions } from "@/features/groups/hooks/use-member-actions";
import { resolveApiAssetUrl } from "@/lib/api";
import type { Group, Member } from "@/lib/api-types";
import { useAuth } from "@/lib/auth";

export function MemberRow({ member, group }: { member: Member; group: Group }) {
  const { user } = useAuth();
  const actions = useMemberActions(group, member);
  const isSelf = user?.id === member.id;
  const isOwner = group.role === "OWNER";
  const canChangeRole = isOwner && member.role !== "OWNER" && !isSelf;
  const canRemove =
    !isSelf &&
    member.role !== "OWNER" &&
    (isOwner || (group.role === "ADMIN" && member.role === "MEMBER"));
  const canTransfer = isOwner && !isSelf && member.role !== "OWNER";

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
            onValueChange={(role) =>
              actions.changeRole.mutate(role as "ADMIN" | "MEMBER")
            }
          >
            <SelectTrigger className="w-32.5">
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
            disabled={actions.transferOwnership.isPending}
            onClick={() => {
              if (confirm(`Transferir propriedade para ${member.name}?`)) {
                actions.transferOwnership.mutate();
              }
            }}
          >
            <Crown className="mr-1 h-3 w-3" /> Tornar dono
          </Button>
        )}
        {canRemove && (
          <Button
            size="sm"
            variant="ghost"
            disabled={actions.remove.isPending}
            onClick={() => {
              if (confirm(`Remover ${member.name} do grupo?`)) {
                actions.remove.mutate();
              }
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
