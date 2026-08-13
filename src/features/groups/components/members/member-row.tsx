import { Crown, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmGroupActionDialog } from "@/features/groups/components/confirm-group-action-dialog";
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
            disabled={actions.changeRole.isPending}
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
          <ConfirmGroupActionDialog
            trigger={
              <Button size="sm" variant="outline">
                <Crown /> Tornar dono
              </Button>
            }
            title={`Transferir o grupo para ${member.name}?`}
            description="Essa pessoa passará a controlar o grupo e você deixará de ser o proprietário. A transferência exige uma nova ação dela para ser desfeita."
            confirmLabel="Transferir grupo"
            pendingLabel="Transferindo grupo..."
            pending={actions.transferOwnership.isPending}
            onConfirm={() => actions.transferOwnership.mutateAsync()}
          />
        )}
        {canRemove && (
          <ConfirmGroupActionDialog
            trigger={
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Remover ${member.name}`}
              >
                <Trash2 />
              </Button>
            }
            title={`Remover ${member.name}?`}
            description="A pessoa perderá o acesso ao grupo e às ações do lobby. Um administrador poderá restaurar o acesso depois."
            confirmLabel="Remover membro"
            pendingLabel="Removendo membro..."
            pending={actions.remove.isPending}
            confirmVariant="destructive"
            onConfirm={() => actions.remove.mutateAsync()}
          />
        )}
      </CardContent>
    </Card>
  );
}
