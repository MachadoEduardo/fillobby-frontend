import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError, resolveApiAssetUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Meu perfil — Fillobby" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  function synchronizeUser(nextUser: NonNullable<typeof user>) {
    updateUser(nextUser);
    void queryClient.invalidateQueries();
  }

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await api.profile.update({ name });
      synchronizeUser(updatedUser);
      setName(updatedUser.name);
      toast.success("Perfil atualizado.");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível atualizar o perfil.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Selecione uma imagem JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("A imagem deve ter no máximo 2 MB.");
      return;
    }

    setUploading(true);
    try {
      const updatedUser = await api.profile.uploadAvatar(file);
      synchronizeUser(updatedUser);
      toast.success("Foto de perfil atualizada.");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleAvatarRemoval() {
    setRemoving(true);
    try {
      const updatedUser = await api.profile.removeAvatar();
      synchronizeUser(updatedUser);
      toast.success("Foto de perfil removida.");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível remover a imagem.",
      );
    } finally {
      setRemoving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="page-heading">Meu perfil</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Atualize como você aparece para os outros membros dos seus grupos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foto de perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={resolveApiAssetUrl(user.avatarUrl)}
              alt={user.name}
            />
            <AvatarFallback>
              <UserRound className="h-7 w-7 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-semibold">Escolha uma imagem</p>
            <p className="mt-1 text-sm text-muted-foreground">
              JPEG, PNG ou WebP, com no máximo 2 MB.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_AVATAR_TYPES.join(",")}
                className="sr-only"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading || removing}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera />
                {uploading
                  ? "Enviando..."
                  : user.avatarUrl
                    ? "Trocar foto"
                    : "Enviar foto"}
              </Button>
              {user.avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={uploading || removing}
                  onClick={handleAvatarRemoval}
                >
                  <Trash2 />
                  {removing ? "Removendo..." : "Remover"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nome</Label>
              <Input
                id="profile-name"
                required
                minLength={2}
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">E-mail</Label>
              <Input id="profile-email" value={user.email} disabled />
              <p className="text-xs text-muted-foreground">
                A alteração de e-mail ainda não está disponível.
              </p>
            </div>
            <Button
              type="submit"
              disabled={saving || name.trim() === user.name}
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
