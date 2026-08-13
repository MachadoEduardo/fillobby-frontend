import { AlertCircle, LoaderCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
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

type ConfirmGroupActionDialogProps = {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  pending: boolean;
  errorMessage?: string;
  confirmVariant?: ButtonProps["variant"];
  onConfirm: () => Promise<unknown>;
  onOpenChange?: (open: boolean) => void;
};

export function ConfirmGroupActionDialog({
  trigger,
  title,
  description,
  confirmLabel,
  pendingLabel,
  pending,
  errorMessage,
  confirmVariant = "default",
  onConfirm,
  onOpenChange,
}: ConfirmGroupActionDialogProps) {
  const [open, setOpen] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (pending) return;
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  async function handleConfirm() {
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // A mensagem contextual permanece no diálogo para nova tentativa.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md gap-0 bg-card p-0">
        <DialogHeader className="border-b px-6 py-5 pr-12 text-left">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="pt-1 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="px-6 py-5">
            <div
              role="alert"
              className="flex gap-3 rounded-lg border border-destructive/35 bg-destructive/10 px-3 py-3 text-sm text-foreground"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 border-t bg-muted/35 px-6 py-4 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={pending}>
              Voltar
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={pending}
            onClick={() => void handleConfirm()}
          >
            {pending && <LoaderCircle className="animate-spin" aria-hidden />}
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
