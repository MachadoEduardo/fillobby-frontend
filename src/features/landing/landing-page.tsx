import { Link, Navigate } from "@tanstack/react-router";
import { ArrowRight, Check, Gamepad2 } from "lucide-react";
import { FaPlaystation, FaSteam, FaWindows, FaXbox } from "react-icons/fa6";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import MoltenMetal from "@/components/backgrounds/molten-metal";
import { LogoLoop, type LogoItem } from "@/components/landing/logo-loop";

const platformLogos: LogoItem[] = [
  {
    node: <FaWindows />,
    title: "PC",
    ariaLabel: "PC",
  },
  {
    node: <FaXbox />,
    title: "Xbox",
    ariaLabel: "Xbox",
  },
  {
    node: <FaPlaystation />,
    title: "PlayStation",
    ariaLabel: "PlayStation",
  },
  {
    node: <Gamepad2 />,
    title: "Nintendo Switch",
    ariaLabel: "Nintendo Switch",
  },
  {
    node: <FaSteam />,
    title: "Steam",
    ariaLabel: "Steam",
  },
];

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/groups" />;

  return (
    <div className="app-page min-h-screen">
      <header className="border-b border-brand/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <span className="brand-wordmark">Fillobby</span>
          <div className="flex gap-2">
            <ThemeToggle compact />
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
        <section className="w-full">
          <div className="relative isolate flex min-h-[calc(100svh-4.3125rem)] items-center justify-center overflow-hidden bg-[#0F1C21] text-[#F5F1E8]">
            <MoltenMetal className="pointer-events-none absolute inset-0" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,#17313A1A_0%,#0F1C213D_42%,#0F1C217A_100%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(to_bottom,#0F1C2100,#0F1C2166_100%)]" />

            <div className="page-enter relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 py-12 text-center sm:px-8">
              <p className="eyebrow text-[#23B5D3]">O lobby antes da partida</p>
              <h1 className="mt-5 text-4xl font-bold leading-[0.96] tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
                Seus amigos. Seus jogos. Uma escolha simples.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#F5F1E8]/72 sm:text-lg">
                Organize a fila, reúna os votos e descubra quem está pronto para
                jogar, tudo no mesmo lobby.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#23B5D3] text-[#17313A] hover:bg-[#3B8AC9]"
                >
                  <Link to="/register">
                    Criar meu grupo <ArrowRight />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-[#F5F1E8]/28 bg-[#0F1C21]/35 text-[#F5F1E8] hover:bg-[#F5F1E8]/10 hover:text-[#F5F1E8]"
                >
                  <Link to="/login">Já tenho uma conta</Link>
                </Button>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm text-[#F5F1E8]/60">
                <Check className="h-4 w-4 text-[#23B5D3]" />
                Convide a galera por código
              </p>
              <LogoLoop
                logos={platformLogos}
                speed={52}
                logoHeight={28}
                gap={56}
                hoverSpeed={0}
                fadeOut
                fadeOutColor="#0F1C21"
                scaleOnHover
                ariaLabel="Plataformas em que o grupo pode jogar"
                className="mx-auto max-w-5xl px-5 sm:px-6 mt-12 sm:mt-16 lg:mt-20"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
