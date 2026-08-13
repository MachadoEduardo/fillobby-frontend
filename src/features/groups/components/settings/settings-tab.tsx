import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { RotateCw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api";
import type { Group } from "@/lib/api-types";
import { queryKeys } from "@/lib/query-keys";

export function SettingsTab({ group }: { group: Group }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const isOwner = group.role === "OWNER";
  const canManageInvite = isOwner || group.role === "ADMIN";

  const updateGroup = useMutation({
    mutationFn: () =>
      api.groups.update(group.id, { name, description: description || null }),
    onSuccess: () => {
      toast.success("Grupo atualizado.");
      invalidateGroupQueries();
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Erro."),
  });
  const deactivateGroup = useMutation({
    mutationFn: () => api.groups.deactivate(group.id),
    onSuccess: () => {
      toast.success("Grupo inativado.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
      void navigate({ to: "/groups" });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "Erro."),
  });
  const regenerateInvite = useMutation({
    mutationFn: () => api.groups.regenerateInvite(group.id),
    onSuccess: () => {
      toast.success("Código de convite renovado.");
      invalidateGroupQueries();
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível renovar o código.",
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
    updateGroup.mutate();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                required
                minLength={3}
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                maxLength={500}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={updateGroup.isPending}>
              {updateGroup.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {canManageInvite && (
        <Card>
          <CardHeader>
            <CardTitle>Código de convite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Renovar o código invalida imediatamente o convite anterior.
            </p>
            <Button
              variant="outline"
              disabled={regenerateInvite.isPending}
              onClick={() => {
                if (confirm("Renovar o código de convite atual?")) {
                  regenerateInvite.mutate();
                }
              }}
            >
              <RotateCw className="mr-2 h-4 w-4" />
              {regenerateInvite.isPending ? "Renovando..." : "Renovar código"}
            </Button>
          </CardContent>
        </Card>
      )}

      {isOwner && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de perigo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Inativar o grupo remove todas as associações ativas. Esta ação não
              pode ser desfeita pela interface.
            </p>
            <Button
              variant="destructive"
              disabled={deactivateGroup.isPending}
              onClick={() => {
                if (confirm(`Inativar o grupo "${group.name}"?`)) {
                  deactivateGroup.mutate();
                }
              }}
            >
              Inativar grupo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
