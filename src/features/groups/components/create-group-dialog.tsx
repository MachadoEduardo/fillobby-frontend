import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, Plus, UsersRound } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [formError, setFormError] = useState("");
  const queryClient = useQueryClient();

  const createGroup = useMutation({
    mutationFn: () =>
      api.groups.create({
        name: name.trim(),
        description: description.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Grupo criado!");
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
      setOpen(false);
      resetForm();
    },
    onError: (error) => setFormError(getCreateGroupErrorMessage(error)),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (name.trim().length < 3) {
      setNameError("Informe um nome com pelo menos 3 caracteres.");
      return;
    }

    createGroup.mutate();
  }

  function resetForm() {
    setName("");
    setDescription("");
    setNameError("");
    setFormError("");
    createGroup.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus /> Novo grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md gap-0 bg-card p-0">
        <DialogHeader className="border-b px-6 py-5 pr-12 text-left">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border bg-muted text-foreground">
            <UsersRound className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl">Criar um grupo</DialogTitle>
          <DialogDescription className="pt-1 leading-relaxed">
            Dê um nome ao lobby. Você poderá convidar a galera assim que ele estiver pronto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="g-name">Nome do grupo</Label>
              <Input
                id="g-name"
                required
                minLength={3}
                maxLength={80}
                autoComplete="off"
                placeholder="Ex.: Noite da galera"
                value={name}
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? "g-name-error" : "g-name-help"}
                className="bg-background"
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError("");
                  setFormError("");
                }}
              />
              {nameError ? (
                <p id="g-name-error" className="text-sm text-destructive">
                  {nameError}
                </p>
              ) : (
                <p id="g-name-help" className="text-xs text-muted-foreground">
                  Use um nome fácil de reconhecer pelos seus amigos.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="g-desc">Descrição</Label>
                <span className="text-xs text-muted-foreground">
                  Opcional · {description.length}/500
                </span>
              </div>
              <Textarea
                id="g-desc"
                maxLength={500}
                placeholder="Conte brevemente o que a galera costuma jogar."
                value={description}
                className="min-h-24 resize-none bg-background"
                onChange={(event) => {
                  setDescription(event.target.value);
                  setFormError("");
                }}
              />
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
              <Button type="button" variant="ghost" disabled={createGroup.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createGroup.isPending}>
              {createGroup.isPending && <LoaderCircle className="animate-spin" aria-hidden />}
              {createGroup.isPending ? "Criando grupo..." : "Criar grupo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getCreateGroupErrorMessage(error: unknown) {
  if (!(error instanceof ApiError) || error.status === 0) {
    return "Não foi possível criar o grupo. Verifique sua conexão e tente novamente.";
  }

  if (error.status === 409) {
    return "Já existe um grupo com essas informações. Escolha outro nome e tente novamente.";
  }

  if (error.status === 400 || error.details.length > 0) {
    return "Não foi possível criar o grupo com esses dados. Revise os campos e tente novamente.";
  }

  return "O grupo não pôde ser criado agora. Aguarde um momento e tente novamente.";
}
