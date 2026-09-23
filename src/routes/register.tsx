import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/features/auth/register-page";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Criar conta | Fillobby" }] }),
  validateSearch: (search: Record<string, unknown>): { invite?: string } => ({
    invite: typeof search.invite === "string" ? search.invite : undefined,
  }),
  component: RegisterRoute,
});

function RegisterRoute() {
  const { invite } = Route.useSearch();
  return <RegisterPage inviteCode={invite} />;
}
