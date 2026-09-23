import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function LoginPage({ inviteCode }: { inviteCode?: string }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success("Bem-vindo de volta!");
      if (inviteCode) {
        navigate({ to: "/invite/$code", params: { code: inviteCode }, replace: true });
      } else {
        navigate({ to: "/groups" });
      }
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao entrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      title="Entre na sua conta"
      description="Acesse seus grupos, acompanhe os votos e encontre a galera pronta para jogar."
      mobileEyebrow="Bem-vindo de volta"
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link
            to="/register"
            search={{ invite: inviteCode }}
            className="font-semibold text-[#23B5D3] transition-colors hover:text-[#72D5E8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#23B5D3]"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthFormField
          id="email"
          label="E-mail"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <AuthFormField
          id="password"
          label="Senha"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
        <Button
          type="submit"
          className="w-full bg-[#23B5D3] text-[#0F1C21] hover:bg-[#72D5E8]"
          disabled={!isHydrated || isSubmitting}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthPageLayout>
  );
}
