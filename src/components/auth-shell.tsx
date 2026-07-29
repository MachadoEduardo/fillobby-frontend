import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Gamepad2 } from "lucide-react";

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
      <aside className="hidden bg-foreground p-10 text-background lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-foreground">
            <Gamepad2 className="h-5 w-5" />
          </span>
          Fillobby
        </Link>

        <div className="my-auto max-w-sm">
          <h2 className="text-3xl font-semibold leading-tight">
            A decisão do próximo jogo fica com o grupo.
          </h2>
          <ul className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-3 text-sm text-background/75"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background/10">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-background/50">
          Fillobby · Organize, vote e jogue.
        </p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="page-enter w-full max-w-sm">
          <Link
            to="/"
            className="mb-10 flex items-center gap-3 text-lg font-semibold lg:hidden"
          >
            <span className="brand-mark">
              <Gamepad2 className="h-5 w-5" />
            </span>
            Fillobby
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
