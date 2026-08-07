import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const benefits = [
  "Fila compartilhada por grupo",
  "Votação e prontidão em tempo real",
  "Histórico das partidas concluídas",
];

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-card lg:grid-cols-[minmax(320px,0.8fr)_1.2fr]">
      <aside className="relative hidden overflow-hidden bg-brand p-10 text-brand-foreground lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full border border-white/8" />
        <div className="pointer-events-none absolute -right-6 top-38 h-40 w-40 rounded-full border border-signal/50" />
        <Link to="/" className="relative">
          <span className="brand-wordmark text-brand-foreground">Fillobby</span>
        </Link>

        <div className="relative my-auto max-w-sm">
          <p className="eyebrow text-signal">Todo mundo no mesmo jogo</p>
          <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.045em]">
            A próxima partida começa aqui.
          </h2>
          <ul className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-3 text-sm text-brand-foreground/70"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal text-signal-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-foreground/45">
          Menos tempo decidindo. Mais tempo jogando.
        </p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="page-enter w-full max-w-sm">
          <Link to="/" className="mb-10 inline-flex lg:hidden">
            <span className="brand-wordmark">Fillobby</span>
          </Link>
          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
