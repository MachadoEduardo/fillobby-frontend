import { AlertCircle, LoaderCircle } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GameFormValues } from "@/features/games/types";
import { PLATFORMS, type Game, type Platform } from "@/lib/api-types";

type GameFormProps = {
  initial?: Pick<Game, "title" | "platforms" | "maxPlayers" | "coverUrl" | "description">;
  submitting: boolean;
  submitLabel: string;
  pendingLabel: string;
  operationError: string;
  onChange: () => void;
  onSubmit: (values: GameFormValues) => void;
};

type FormErrors = Partial<Record<"title" | "platforms" | "maxPlayers" | "coverUrl", string>>;

export function GameForm({
  initial,
  submitting,
  submitLabel,
  pendingLabel,
  operationError,
  onChange,
  onSubmit,
}: GameFormProps) {
  const fieldId = useId();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [platforms, setPlatforms] = useState<Platform[]>(initial?.platforms ?? []);
  const [maxPlayers, setMaxPlayers] = useState(initial?.maxPlayers?.toString() ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  function updateField(callback: () => void, field: keyof FormErrors) {
    callback();
    setErrors((current) => ({ ...current, [field]: undefined }));
    onChange();
  }

  function togglePlatform(platform: Platform) {
    updateField(
      () =>
        setPlatforms((current) =>
          current.includes(platform)
            ? current.filter((item) => item !== platform)
            : [...current, platform],
        ),
      "platforms",
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm({
      title,
      platforms,
      maxPlayers,
      coverUrl,
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      title: title.trim(),
      platforms,
      maxPlayers: maxPlayers ? Number(maxPlayers) : null,
      coverUrl: coverUrl.trim() || null,
      description: description.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-5 px-6 py-5">
        <div className="space-y-2">
          <Label htmlFor={`${fieldId}-title`}>Título</Label>
          <Input
            id={`${fieldId}-title`}
            required
            maxLength={120}
            autoComplete="off"
            placeholder="Ex.: Stardew Valley"
            value={title}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? `${fieldId}-title-error` : undefined}
            className="bg-background"
            disabled={submitting}
            onChange={(event) => updateField(() => setTitle(event.target.value), "title")}
          />
          {errors.title && (
            <p id={`${fieldId}-title-error`} className="text-sm text-destructive">
              {errors.title}
            </p>
          )}
        </div>

        <fieldset
          className="space-y-2"
          disabled={submitting}
          aria-describedby={errors.platforms ? `${fieldId}-platforms-error` : undefined}
        >
          <legend className="text-sm font-medium">Plataformas</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PLATFORMS.map((platform) => (
              <label
                key={platform}
                className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 text-sm transition-colors hover:bg-accent"
              >
                <Checkbox
                  checked={platforms.includes(platform)}
                  aria-invalid={Boolean(errors.platforms)}
                  onCheckedChange={() => togglePlatform(platform)}
                />
                <span className="truncate">{platform}</span>
              </label>
            ))}
          </div>
          {errors.platforms ? (
            <p id={`${fieldId}-platforms-error`} className="text-sm text-destructive">
              {errors.platforms}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Selecione onde o jogo está disponível.</p>
          )}
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-players`}>Máximo de jogadores</Label>
            <Input
              id={`${fieldId}-players`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Opcional"
              value={maxPlayers}
              aria-invalid={Boolean(errors.maxPlayers)}
              aria-describedby={errors.maxPlayers ? `${fieldId}-players-error` : undefined}
              className="bg-background"
              disabled={submitting}
              onChange={(event) =>
                updateField(() => setMaxPlayers(event.target.value), "maxPlayers")
              }
              onBlur={() => {
                const maxPlayersError = validateMaxPlayers(maxPlayers);
                setErrors((current) => ({
                  ...current,
                  maxPlayers: maxPlayersError,
                }));
              }}
            />
            {errors.maxPlayers && (
              <p id={`${fieldId}-players-error`} className="text-sm text-destructive">
                {errors.maxPlayers}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-cover`}>Link da capa</Label>
            <Input
              id={`${fieldId}-cover`}
              type="url"
              inputMode="url"
              placeholder="https://..."
              value={coverUrl}
              aria-invalid={Boolean(errors.coverUrl)}
              aria-describedby={errors.coverUrl ? `${fieldId}-cover-error` : undefined}
              className="bg-background"
              disabled={submitting}
              onChange={(event) => updateField(() => setCoverUrl(event.target.value), "coverUrl")}
            />
            {errors.coverUrl && (
              <p id={`${fieldId}-cover-error`} className="text-sm text-destructive">
                {errors.coverUrl}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor={`${fieldId}-description`}>Descrição</Label>
            <span className="text-xs text-muted-foreground">
              Opcional · {description.length}/1000
            </span>
          </div>
          <Textarea
            id={`${fieldId}-description`}
            maxLength={1000}
            placeholder="Conte brevemente como é o jogo."
            value={description}
            className="min-h-24 resize-none bg-background"
            disabled={submitting}
            onChange={(event) => {
              setDescription(event.target.value);
              onChange();
            }}
          />
        </div>

        {operationError && (
          <div
            role="alert"
            className="flex gap-3 rounded-lg border border-destructive/35 bg-destructive/10 px-3 py-3 text-sm text-foreground"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p>{operationError}</p>
          </div>
        )}
      </div>

      <DialogFooter className="gap-2 border-t bg-muted/35 px-6 py-4 sm:space-x-0">
        <DialogClose asChild>
          <Button type="button" variant="ghost" disabled={submitting}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={submitting}>
          {submitting && <LoaderCircle className="animate-spin" aria-hidden />}
          {submitting ? pendingLabel : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

function validateForm({
  title,
  platforms,
  maxPlayers,
  coverUrl,
}: {
  title: string;
  platforms: Platform[];
  maxPlayers: string;
  coverUrl: string;
}) {
  const errors: FormErrors = {};

  if (!title.trim()) errors.title = "Informe o título do jogo.";
  if (platforms.length === 0) {
    errors.platforms = "Selecione pelo menos uma plataforma.";
  }

  const maxPlayersError = validateMaxPlayers(maxPlayers);
  if (maxPlayersError) errors.maxPlayers = maxPlayersError;

  if (coverUrl.trim() && !isValidWebUrl(coverUrl.trim())) {
    errors.coverUrl = "Informe um link completo, começando com http ou https.";
  }

  return errors;
}

function validateMaxPlayers(value: string) {
  if (!value) return undefined;

  const containsOnlyDigits = /^\d+$/.test(value);
  const parsedValue = Number(value);

  if (!containsOnlyDigits || !Number.isSafeInteger(parsedValue) || parsedValue < 1) {
    return "Use somente números inteiros maiores que zero.";
  }

  return undefined;
}

function isValidWebUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
