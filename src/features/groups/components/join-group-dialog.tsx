import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
  const queryClient = useQueryClient();

  const joinGroup = useMutation({
    mutationFn: () => api.groups.join({ inviteCode: code }),
    onSuccess: () => {
      toast.success("Você entrou no grupo!");
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
      setOpen(false);
      setCode("");
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError ? error.message : "Erro ao entrar.",
      ),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    joinGroup.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <KeyRound className="mr-2 h-4 w-4" /> Entrar por código
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entrar em um grupo</DialogTitle>
          <DialogDescription>
            Informe o código de convite recebido.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="j-code">Código de convite</Label>
            <Input
              id="j-code"
              required
              maxLength={32}
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={joinGroup.isPending}>
              {joinGroup.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
