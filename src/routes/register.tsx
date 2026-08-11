import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/features/auth/register-page";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Criar conta | Fillobby" }] }),
  component: RegisterPage,
});
