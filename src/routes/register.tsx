import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Criar conta — Fillobby" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.register({ name, email, password });
      toast.success("Conta criada! Faça login para continuar.");
      navigate({ to: "/login" });
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error("Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Crie sua conta"
      description="Comece a organizar as partidas do seu grupo."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            required
            minLength={2}
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <p className="text-xs text-muted-foreground">
            Mínimo 8 caracteres, com letra maiúscula, minúscula e número.
          </p>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Cadastrando..." : "Criar conta"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          to="/login"
          className="font-semibold text-primary hover:underline"
        >
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
