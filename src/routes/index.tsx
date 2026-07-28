import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Gamepad2, Users, Trophy, Vote } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/groups" />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-lg font-bold">
          <Gamepad2 className="h-6 w-6 text-primary" />
          Fillobby
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Cadastrar</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            A fila compartilhada de jogos do seu grupo
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Sugira jogos, vote nos favoritos, escolha quem joga e coordene as partidas com seus
            amigos — tudo em um só lugar.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/register">Criar conta grátis</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Já tenho conta</Link>
            </Button>
          </div>
        </section>

        <section className="mt-24 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Users, title: "Grupos", desc: "Crie ou entre em grupos por código de convite." },
            { icon: Vote, title: "Votação", desc: "Escolha os próximos jogos junto com a galera." },
            { icon: Trophy, title: "Histórico", desc: "Acompanhe todas as partidas concluídas." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border bg-card p-6 shadow-sm">
              <Icon className="mb-3 h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
