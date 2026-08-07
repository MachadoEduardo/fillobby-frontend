import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Camera,
  Gamepad2,
  Palette,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError, resolveApiAssetUrl } from "@/lib/api";
import { PLATFORMS, type ErrorDetail, type Platform } from "@/lib/api-types";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme-context";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";
type PasswordErrors = Partial<Record<PasswordField, string>>;

function passwordErrorsFrom(details: ErrorDetail[]): PasswordErrors {
  return details.reduce<PasswordErrors>((errors, detail) => {
    const field = detail.field.replace("body.", "") as PasswordField;
    if (
      ["currentPassword", "newPassword", "confirmPassword"].includes(field) &&
      !errors[field]
    )
      errors[field] = detail.message;
    return errors;
  }, {});
}

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Meu perfil — Fillobby" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [preferredPlatforms, setPreferredPlatforms] = useState<Platform[]>(
    user?.preferredPlatforms ?? [],
  );

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

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    const clientErrors: PasswordErrors = {};
    if (newPassword === currentPassword)
      clientErrors.newPassword =
        "A nova senha deve ser diferente da senha atual.";
    if (newPassword !== confirmPassword)
      clientErrors.confirmPassword = "A confirmação da senha não confere.";
    if (Object.keys(clientErrors).length > 0) {
      setPasswordErrors(clientErrors);
      return;
    }

    setPasswordErrors({});
    setPasswordSaving(true);
    try {
      await api.profile.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
      toast.success("Senha atualizada com sucesso.");
    } catch (error) {
      if (error instanceof ApiError && error.details.length > 0) {
        setPasswordErrors(passwordErrorsFrom(error.details));
        toast.error("Revise os campos destacados.");
      } else
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Não foi possível atualizar a senha.",
        );
    } finally {
      setPasswordSaving(false);
    }
  }

  function togglePlatform(platform: Platform) {
    setPreferredPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  }

  async function handlePreferencesSubmit(event: FormEvent) {
    event.preventDefault();
    setPreferencesSaving(true);
    try {
      const updatedUser =
        await api.profile.updatePreferences(preferredPlatforms);
      synchronizeUser(updatedUser);
      setPreferredPlatforms(updatedUser.preferredPlatforms);
      toast.success("Preferências atualizadas.");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Não foi possível atualizar as preferências.",
      );
    } finally {
      setPreferencesSaving(false);
    }
  }

  function updatePasswordField(
    field: PasswordField,
    value: string,
    setter: (nextValue: string) => void,
  ) {
    setter(value);
    setPasswordErrors((current) => ({ ...current, [field]: undefined }));
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
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="eyebrow">Sua presença no lobby</p>
        <h1 className="page-heading mt-2">Meu perfil</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Atualize como você aparece para os outros membros dos seus grupos.
        </p>
        {(user.preferredPlatforms ?? []).length > 0 && (
          <div
            className="mt-4 flex flex-wrap gap-2"
            aria-label="Plataformas preferidas"
          >
            {(user.preferredPlatforms ?? []).map((platform) => (
              <Badge key={platform} variant="secondary">
                <Gamepad2 className="mr-1.5 h-3 w-3" />
                {platform}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-brand px-6 py-7 text-brand-foreground sm:px-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/8" />
        <div className="pointer-events-none absolute -right-3 -top-8 h-36 w-36 rounded-full border border-signal/45" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="h-24 w-24 border-4 border-white/10">
            <AvatarImage
              src={resolveApiAssetUrl(user.avatarUrl)}
              alt={user.name}
            />
            <AvatarFallback className="bg-white/8">
              <UserRound className="h-8 w-8 text-brand-foreground/45" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="eyebrow text-signal">Identidade pública</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">
              {user.name}
            </h2>
            <p className="mt-1 text-sm text-brand-foreground/55">
              {user.email}
            </p>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <Card className="border-brand/12 shadow-[0_14px_40px_-34px_#17313a]">
            <CardHeader>
              <CardTitle>Foto de perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use JPEG, PNG ou WebP, com no máximo 2 MB.
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
            </CardContent>
          </Card>

          <Card className="border-brand/12 shadow-[0_14px_40px_-34px_#17313a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-signal" /> Aparência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tema {theme === "dark" ? "escuro" : "claro"} em uso neste
                dispositivo.
              </p>
              <ThemeToggle className="mt-4 border border-input" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-brand/12 shadow-[0_14px_40px_-34px_#17313a]">
          <CardHeader>
            <CardTitle>Informações pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-7">
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
                className="bg-signal text-signal-foreground hover:bg-signal/90"
                disabled={saving || name.trim() === user.name}
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border-brand/12 shadow-[0_14px_40px_-34px_#17313a]">
        <CardHeader>
          <CardTitle>Plataformas preferidas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Escolha onde você costuma jogar. Essas preferências aparecem como
            badges no seu perfil.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePreferencesSubmit} className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {PLATFORMS.map((platform) => {
                const selected = preferredPlatforms.includes(platform);
                return (
                  <Label
                    key={platform}
                    htmlFor={`platform-${platform}`}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-signal/45 has-[[data-state=checked]]:bg-signal/8"
                  >
                    <Checkbox
                      id={`platform-${platform}`}
                      checked={selected}
                      onCheckedChange={() => togglePlatform(platform)}
                    />
                    <span className="flex-1 font-medium">{platform}</span>
                    {selected && <Badge variant="secondary">Preferida</Badge>}
                  </Label>
                );
              })}
            </div>
            <Button
              type="submit"
              className="bg-signal text-signal-foreground hover:bg-signal/90"
              disabled={
                preferencesSaving ||
                (preferredPlatforms.length ===
                  (user.preferredPlatforms ?? []).length &&
                  preferredPlatforms.every((platform) =>
                    (user.preferredPlatforms ?? []).includes(platform),
                  ))
              }
            >
              {preferencesSaving ? "Salvando..." : "Salvar preferências"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-brand/12 shadow-[0_14px_40px_-34px_#17313a]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-signal/12 p-2 text-signal">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Segurança</CardTitle>
              <p className="mt-1 text-sm font-normal text-muted-foreground">
                Confirme sua senha atual antes de definir uma nova.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(event) =>
                  updatePasswordField(
                    "currentPassword",
                    event.target.value,
                    setCurrentPassword,
                  )
                }
                autoComplete="current-password"
                aria-invalid={Boolean(passwordErrors.currentPassword)}
                aria-describedby={
                  passwordErrors.currentPassword
                    ? "current-password-error"
                    : undefined
                }
              />
              {passwordErrors.currentPassword && (
                <p
                  id="current-password-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={8}
                maxLength={72}
                value={newPassword}
                onChange={(event) =>
                  updatePasswordField(
                    "newPassword",
                    event.target.value,
                    setNewPassword,
                  )
                }
                autoComplete="new-password"
                aria-invalid={Boolean(passwordErrors.newPassword)}
                aria-describedby="new-password-help new-password-error"
              />
              <p
                id="new-password-help"
                className="text-xs text-muted-foreground"
              >
                Use de 8 a 72 caracteres, com letra maiúscula, minúscula e
                número.
              </p>
              {passwordErrors.newPassword && (
                <p
                  id="new-password-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                maxLength={72}
                value={confirmPassword}
                onChange={(event) =>
                  updatePasswordField(
                    "confirmPassword",
                    event.target.value,
                    setConfirmPassword,
                  )
                }
                autoComplete="new-password"
                aria-invalid={Boolean(passwordErrors.confirmPassword)}
                aria-describedby={
                  passwordErrors.confirmPassword
                    ? "confirm-password-error"
                    : undefined
                }
              />
              {passwordErrors.confirmPassword && (
                <p
                  id="confirm-password-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="bg-signal text-signal-foreground hover:bg-signal/90"
              disabled={passwordSaving}
            >
              {passwordSaving ? "Atualizando..." : "Atualizar senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
