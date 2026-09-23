import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { queryKeys } from "@/lib/query-keys";

function invitationError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "INVITE_NOT_FOUND")
      return "Este convite não existe ou não está mais válido.";
    if (error.code === "MEMBERSHIP_REMOVED")
      return "Seu acesso a este grupo foi removido. Peça ajuda a um administrador.";
  }
  return "Não foi possível entrar no grupo. Tente novamente.";
}

export function InvitePage({ code }: { code: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const joinGroup = useMutation({
    mutationFn: () => api.groups.join({ inviteCode: code }),
    onSuccess: (group) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() });
      void navigate({ to: "/groups/$groupId", params: { groupId: group.id }, replace: true });
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Convite para um grupo</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Entre no grupo para ver a fila de jogos e sugerir o próximo. Sua participação só será
          confirmada quando você escolher entrar.
        </p>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Carregando...</p>
        ) : isAuthenticated ? (
          <div className="mt-6 space-y-4">
            {joinGroup.isError && (
              <p role="alert" className="text-sm text-destructive">
                {invitationError(joinGroup.error)}
              </p>
            )}
            <Button
              className="w-full"
              disabled={joinGroup.isPending}
              onClick={() => joinGroup.mutate()}
            >
              {joinGroup.isPending ? "Entrando no grupo..." : "Entrar no grupo"}
            </Button>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/login" search={{ invite: code }}>
                Entrar na conta
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register" search={{ invite: code }}>
                Criar conta
              </Link>
            </Button>
          </div>
        )}
        <Link
          to="/"
          className="mt-6 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Voltar ao início
        </Link>
      </section>
    </main>
  );
}
