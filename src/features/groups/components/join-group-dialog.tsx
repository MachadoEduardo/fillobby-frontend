import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, KeyRound, LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function JoinGroupDialog() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [formError, setFormError] = useState("");
  const queryClient = useQueryClient();

  const joinGroup = useMutation({
    mutationFn: () => api.groups.join({ inviteCode: code.trim() }),
    onSuccess: () => {
      toast.success("Você entrou no grupo!");
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
      setOpen(false);
      resetForm();
    },
    onError: (error) => setFormError(getJoinGroupErrorMessage(error)),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!code.trim()) {
      setCodeError("Informe o código que você recebeu.");
      return;
    }

    joinGroup.mutate();
  }

  function resetForm() {
    setCode("");
    setCodeError("");
    setFormError("");
    joinGroup.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-transparent sm:w-auto">
          <KeyRound /> Entrar por código
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md gap-0 bg-card p-0">
        <DialogHeader className="border-b px-6 py-5 pr-12 text-left">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border bg-muted text-foreground">
            <KeyRound className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl">Entrar em um grupo</DialogTitle>
          <DialogDescription className="pt-1 leading-relaxed">
            Cole o código enviado por alguém do grupo para acessar o lobby.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="j-code">Código de convite</Label>
              <Input
                id="j-code"
                required
                maxLength={32}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="Cole o código aqui"
                value={code}
                aria-invalid={Boolean(codeError)}
                aria-describedby={codeError ? "j-code-error" : "j-code-help"}
                className="bg-background font-mono"
                onChange={(event) => {
                  setCode(event.target.value);
                  setCodeError("");
                  setFormError("");
                }}
              />
              {codeError ? (
                <p id="j-code-error" className="text-sm text-destructive">
                  {codeError}
                </p>
              ) : (
                <p id="j-code-help" className="text-xs text-muted-foreground">
                  O código identifica o grupo e pode deixar de funcionar se for renovado pelo
                  administrador.
                </p>
              )}
            </div>

            {formError && (
              <div
                role="alert"
                className="flex gap-3 rounded-lg border border-destructive/35 bg-destructive/10 px-3 py-3 text-sm text-foreground"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p>{formError}</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 border-t bg-muted/35 px-6 py-4 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={joinGroup.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={joinGroup.isPending}>
              {joinGroup.isPending && <LoaderCircle className="animate-spin" aria-hidden />}
              {joinGroup.isPending ? "Entrando no grupo..." : "Entrar no grupo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getJoinGroupErrorMessage(error: unknown) {
  if (!(error instanceof ApiError) || error.status === 0) {
    return "Não foi possível entrar no grupo. Verifique sua conexão e tente novamente.";
  }

  if (error.status === 404 || error.status === 400) {
    return "Esse código não foi encontrado ou não está mais válido. Confira o convite e tente novamente.";
  }

  if (error.status === 409) {
    return "Você já participa deste grupo. Atualize a lista para encontrá-lo.";
  }

  return "Não foi possível entrar no grupo agora. Aguarde um momento e tente novamente.";
}
