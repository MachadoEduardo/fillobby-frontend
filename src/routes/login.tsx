import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/features/auth/login-page";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar | Fillobby" }] }),
  validateSearch: (search: Record<string, unknown>): { invite?: string } => ({
    invite: typeof search.invite === "string" ? search.invite : undefined,
  }),
  component: LoginRoute,
});

function LoginRoute() {
  const { invite } = Route.useSearch();
  return <LoginPage inviteCode={invite} />;
}
