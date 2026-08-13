import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import DarkVeil from "@/features/auth/components/dark-veil";
import FadeContent from "@/components/fade-content";

type AuthPageLayoutProps = {
  title: string;
  description: string;
  mobileEyebrow: string;
  children: ReactNode;
  footer: ReactNode;
};

const lobbyBenefits = [
  "Organize a fila do seu grupo",
  "Reúna os votos em um só lugar",
  "Descubra quem está pronto para jogar",
];

export function AuthPageLayout({
  title,
  description,
  mobileEyebrow,
  children,
  footer,
}: AuthPageLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0F1C21] text-[#F5F1E8]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <DarkVeil
          hueShift={0}
          noiseIntensity={0.015}
          scanlineIntensity={0.02}
          scanlineFrequency={0.004}
          speed={0.64}
          warpAmount={0.28}
          resolutionScale={0.9}
          respectReducedMotion
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,#241B3D73_0%,transparent_34%),radial-gradient(circle_at_88%_82%,#23B5D31A_0%,transparent_28%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          to="/"
          className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#23B5D3]"
        >
          <span className="brand-wordmark text-white">Fillobby</span>
        </Link>
      </header>

      <FadeContent
        blur
        duration={1000}
        ease="power2.out"
        initialOpacity={0}
        respectReducedMotion
        className="relative z-10"
      >
        <main className="mx-auto grid min-h-[calc(100svh-4.75rem)] max-w-6xl items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] lg:gap-24 lg:py-16">
          <section
            className="hidden max-w-md lg:block"
            aria-labelledby="auth-intro-title"
          >
            <h2
              id="auth-intro-title"
              className="mt-5 text-6xl font-bold leading-[0.98] tracking-tighter text-balance"
            >
              Menos tempo decidindo. Mais tempo jogando.
            </h2>
            <ul className="mt-10 space-y-4">
              {lobbyBenefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 text-sm text-[#AAB7B5]"
                >
                  <Check
                    className="h-4 w-4 shrink-0 text-[#23B5D3]"
                    aria-hidden
                  />
                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          <section
            className="w-full max-w-md justify-self-center lg:justify-self-end"
            aria-labelledby="auth-title"
          >
            <header>
              <p className="eyebrow text-[#23B5D3] lg:hidden">
                {mobileEyebrow}
              </p>
              <h1
                id="auth-title"
                className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:mt-0"
              >
                {title}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#AAB7B5]">
                {description}
              </p>
            </header>

            <div className="mt-8">{children}</div>
            <div className="mt-6 text-center text-sm text-[#AAB7B5]">
              {footer}
            </div>
          </section>
        </main>
      </FadeContent>
    </div>
  );
}
