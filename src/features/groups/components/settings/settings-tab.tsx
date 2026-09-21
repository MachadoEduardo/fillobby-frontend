import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, LoaderCircle, RotateCw, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmGroupActionDialog } from "@/features/groups/components/confirm-group-action-dialog";
import { getGroupActionErrorMessage } from "@/features/groups/group-errors";
import { api } from "@/lib/api";
import type { Group } from "@/lib/api-types";
import { queryKeys } from "@/lib/query-keys";

export function SettingsTab({ group }: { group: Group }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [nameError, setNameError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [deactivateError, setDeactivateError] = useState("");
  const isOwner = group.role === "OWNER";
  const canManageInvite = isOwner || group.role === "ADMIN";
  const normalizedName = name.trim();
  const normalizedDescription = description.trim();
  const hasChanges =
    normalizedName !== group.name || normalizedDescription !== (group.description ?? "");

  useEffect(() => {
    setName(group.name);
    setDescription(group.description ?? "");
  }, [group.description, group.name]);

  const updateGroup = useMutation({
    mutationFn: () =>
      api.groups.update(group.id, {
        name: normalizedName,
        description: normalizedDescription || null,
      }),
    onSuccess: () => {
      toast.success("Alterações salvas.");
      setUpdateError("");
      invalidateGroupQueries();
    },
    onError: (error) =>
      setUpdateError(
        getGroupActionErrorMessage(
          error,
          "Não foi possível salvar as alterações agora. Tente novamente em alguns instantes.",
        ),
      ),
  });
  const deactivateGroup = useMutation({
    mutationFn: () => api.groups.deactivate(group.id),
    onSuccess: () => {
      toast.success("Grupo encerrado.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
      void navigate({ to: "/groups" });
    },
    onError: (error) =>
      setDeactivateError(
        getGroupActionErrorMessage(
          error,
          "Não foi possível encerrar o grupo agora. Tente novamente em alguns instantes.",
        ),
      ),
  });
  const regenerateInvite = useMutation({
    mutationFn: () => api.groups.regenerateInvite(group.id),
    onSuccess: () => {
      toast.success("Novo código de convite criado.");
      setInviteError("");
      invalidateGroupQueries();
    },
    onError: (error) =>
      setInviteError(
        getGroupActionErrorMessage(
          error,
          "Não foi possível criar um novo código agora. Tente novamente em alguns instantes.",
        ),
      ),
  });

  function invalidateGroupQueries() {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.group.detail(group.id),
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUpdateError("");

    if (normalizedName.length < 3) {
      setNameError("Informe um nome com pelo menos 3 caracteres.");
      return;
    }

    updateGroup.mutate();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Configurações do grupo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize as informações e controle o acesso ao lobby.
        </p>
      </div>

      <Card className="bg-card/70 shadow-none">
        <CardHeader>
          <CardTitle>Informações do grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-settings-name">Nome</Label>
              <Input
                id="group-settings-name"
                required
                minLength={3}
                maxLength={80}
                value={name}
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? "group-settings-name-error" : undefined}
                disabled={updateGroup.isPending}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError("");
                  setUpdateError("");
                }}
              />
              {nameError && (
                <p id="group-settings-name-error" className="text-sm text-destructive">
                  {nameError}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="group-settings-description">Descrição</Label>
                <span className="text-xs text-muted-foreground">
                  Opcional · {description.length}/500
                </span>
              </div>
              <Textarea
                id="group-settings-description"
                maxLength={500}
                value={description}
                className="min-h-24 resize-none"
                disabled={updateGroup.isPending}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setUpdateError("");
                }}
              />
            </div>
            {updateError && <InlineError message={updateError} />}
            <Button type="submit" disabled={updateGroup.isPending || !hasChanges}>
              {updateGroup.isPending && <LoaderCircle className="animate-spin" aria-hidden />}
              {updateGroup.isPending ? "Salvando alterações..." : "Salvar alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {canManageInvite && (
        <Card className="bg-card/70 shadow-none">
          <CardHeader>
            <CardTitle>Código de convite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Crie um novo código se o convite atual foi compartilhado com quem não deveria ter
              acesso. O código anterior deixará de funcionar.
            </p>
            <ConfirmGroupActionDialog
              trigger={
                <Button type="button" variant="outline" className="bg-transparent">
                  <RotateCw /> Criar novo código
                </Button>
              }
              title="Criar um novo código?"
              description="O convite atual será invalidado imediatamente. Compartilhe o novo código com quem ainda precisa entrar no grupo."
              confirmLabel="Criar novo código"
              pendingLabel="Criando código..."
              pending={regenerateInvite.isPending}
              errorMessage={inviteError}
              onOpenChange={(open) => {
                if (!open) setInviteError("");
              }}
              onConfirm={() => regenerateInvite.mutateAsync()}
            />
          </CardContent>
        </Card>
      )}

      {isOwner && (
        <Card className="border-destructive/50 bg-card/70 shadow-none">
          <CardHeader>
            <CardTitle>Encerrar grupo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              O lobby deixará de ficar disponível para todos os membros. Esta ação não pode ser
              desfeita pela interface.
            </p>
            <ConfirmGroupActionDialog
              trigger={
                <Button type="button" variant="destructive">
                  <Trash2 /> Encerrar grupo
                </Button>
              }
              title={`Encerrar ${group.name}?`}
              description="Todos os membros perderão o acesso ao lobby e às ações em andamento. Esta decisão não poderá ser revertida pela interface."
              confirmLabel="Encerrar grupo"
              pendingLabel="Encerrando grupo..."
              pending={deactivateGroup.isPending}
              errorMessage={deactivateError}
              confirmVariant="destructive"
              onOpenChange={(open) => {
                if (!open) setDeactivateError("");
              }}
              onConfirm={() => deactivateGroup.mutateAsync()}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-lg border border-destructive/35 bg-destructive/10 px-3 py-3 text-sm text-foreground"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      <p>{message}</p>
    </div>
  );
}
