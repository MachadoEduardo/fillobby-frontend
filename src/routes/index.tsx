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
      <header className="border-b border-brand/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <span className="brand-wordmark">Fillobby</span>
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
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_0.92fr] lg:py-28">
          <div className="page-enter">
            <p className="eyebrow">O lobby antes da partida</p>
            <h1 className="mt-5 max-w-2xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
              Menos tempo decidindo.{" "}
              <span className="text-signal">Mais tempo jogando.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Uma fila compartilhada para seu grupo sugerir jogos, votar e
              reunir quem está pronto para a próxima partida.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-signal text-signal-foreground hover:bg-signal/90"
              >
                <Link to="/register">
                  Criar grupo <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Entrar na minha conta</Link>
              </Button>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-signal" />
              Crie o grupo e convide a galera por código
            </p>
          </div>

          <div
            className="relative overflow-hidden rounded-3xl bg-brand p-2 text-brand-foreground shadow-[0_24px_70px_-35px_#17313a]"
            aria-label="Prévia de uma fila"
          >
            <div className="flex items-center justify-between px-5 py-5">
              <div>
                <p className="eyebrow text-signal">Lobby aberto</p>
                <p className="mt-2 text-xl font-bold tracking-tight">
                  Sexta à noite
                </p>
                <p className="mt-0.5 text-xs text-brand-foreground/65">
                  Todo mundo no mesmo jogo
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/8 px-3 py-2 text-sm text-brand-foreground/75">
                <Users className="h-4 w-4" />6 membros
              </div>
            </div>
            <div className="rounded-[1.15rem] bg-card px-4 py-2 text-card-foreground">
              {queuePreview.map((game, index) => (
                <div
                  key={game.title}
                  className="relative flex items-center gap-3 border-b py-4 pl-9 last:border-b-0"
                >
                  <span className="mono-data absolute left-0 text-xs font-semibold text-muted-foreground">
                    0{index + 1}
                  </span>
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
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-signal">
                    <ThumbsUp className="h-4 w-4" />
                    {game.votes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand text-brand-foreground">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
            <div className="max-w-xl">
              <p className="eyebrow text-signal">Um caminho simples</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Da sugestão à partida
              </h2>
              <p className="mt-2 text-brand-foreground/65">
                O grupo inteiro acompanha a mesma decisão, sem planilhas ou
                mensagens perdidas.
              </p>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
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
              ].map(({ icon: Icon, title, desc }, index) => (
                <div key={title} className="bg-brand p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/8 text-signal">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="mono-data text-xs text-brand-foreground/40">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-foreground/60">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-5 py-8 text-sm text-muted-foreground sm:px-6">
        <span className="brand-wordmark">Fillobby</span>
        <span>Jogue mais. Decida junto.</span>
      </footer>
    </div>
  );
}
