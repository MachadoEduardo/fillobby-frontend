import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/features/profile/profile-page";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Meu perfil | Fillobby" }] }),
  component: ProfilePage,
});
