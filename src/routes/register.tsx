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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function clearFieldErrors(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      await api.auth.register({ name, email, password });
      toast.success("Conta criada! Faça login para continuar.");
      navigate({ to: "/login" });
    } catch (err) {
      if (err instanceof ApiError) {
        const errors = err.details.reduce<Record<string, string[]>>(
          (accumulator, detail) => {
            const field = detail.field.split(".").at(-1);
            if (!field) return accumulator;
            accumulator[field] = [
              ...(accumulator[field] ?? []),
              detail.message,
            ];
            return accumulator;
          },
          {},
        );

        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          toast.error("Revise os campos destacados.");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Erro ao cadastrar.");
      }
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
            onChange={(e) => {
              setName(e.target.value);
              clearFieldErrors("name");
            }}
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-errors" : undefined}
          />
          <FieldErrors id="name-errors" messages={fieldErrors.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldErrors("email");
            }}
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-errors" : undefined}
          />
          <FieldErrors id="email-errors" messages={fieldErrors.email} />
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
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldErrors("password");
            }}
            autoComplete="new-password"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "password-errors" : "password-help"
            }
          />
          <p id="password-help" className="text-xs text-muted-foreground">
            Mínimo 8 caracteres, com letra maiúscula, minúscula e número.
          </p>
          <FieldErrors id="password-errors" messages={fieldErrors.password} />
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

function FieldErrors({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;

  return (
    <ul id={id} role="alert" className="space-y-1 text-xs text-destructive">
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}
