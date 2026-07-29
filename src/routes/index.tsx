import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowRight, Check, Gamepad2, ThumbsUp, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
});

const queuePreview = [
  { title: "Deep Rock Galactic", platform: "PC · 4 jogadores", votes: 6 },
  {
    title: "Overcooked! 2",
    platform: "Multiplataforma · 4 jogadores",
    votes: 4,
  },
  { title: "Helldivers 2", platform: "PC / PS5 · 4 jogadores", votes: 3 },
];

function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/groups" />;

  return (
    <div className="app-page min-h-screen">
      <header className="border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3 text-lg font-semibold tracking-tight">
            <span className="brand-mark">
              <Gamepad2 className="h-5 w-5" />
            </span>
            <span>Fillobby</span>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_0.9fr]">
          <div className="page-enter">
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.03] tracking-tight sm:text-6xl">
              Escolha o próximo jogo.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Organize a fila do grupo, reúna os votos e saiba quem está pronto
              para jogar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register">
                  Criar grupo <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Entrar na minha conta</Link>
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary" />
              Cadastro gratuito
            </p>
          </div>

          <div
            className="rounded-xl border bg-card shadow-sm"
            aria-label="Prévia de uma fila"
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <p className="font-semibold">Sexta à noite</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  6 membros no grupo
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />6 membros
              </div>
            </div>
            <div className="px-5 py-2">
              {queuePreview.map((game, index) => (
                <div
                  key={game.title}
                  className="flex items-center gap-3 border-b py-4 last:border-b-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {game.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {game.platform}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <ThumbsUp className="h-4 w-4" />
                    {game.votes}
                  </div>
                  <span className="w-5 text-right text-xs text-muted-foreground">
                    {index + 1}º
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y bg-card">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold tracking-tight">
                Da sugestão à partida
              </h2>
              <p className="mt-2 text-muted-foreground">
                O grupo inteiro acompanha a mesma decisão, sem planilhas ou
                mensagens perdidas.
              </p>
            </div>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {[
                {
                  icon: Gamepad2,
                  title: "Monte a fila",
                  desc: "Adicione ao grupo os jogos que vocês realmente querem jogar.",
                },
                {
                  icon: ThumbsUp,
                  title: "Vote em conjunto",
                  desc: "Os votos deixam a preferência do grupo visível para todos.",
                },
                {
                  icon: Users,
                  title: "Confirme a galera",
                  desc: "Veja quem está pronto antes de iniciar e registre a partida.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-5 py-8 text-sm text-muted-foreground sm:px-6">
        <span>Fillobby</span>
        <span>Jogue mais. Decida junto.</span>
      </footer>
    </div>
  );
}
