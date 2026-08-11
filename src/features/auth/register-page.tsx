import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";

type FieldErrors = Record<string, string[]>;

function getFieldErrors(error: ApiError) {
  return error.details.reduce<FieldErrors>((errors, detail) => {
    const field = detail.field.split(".").at(-1);
    if (!field) return errors;

    errors[field] = [...(errors[field] ?? []), detail.message];
    return errors;
  }, {});
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function clearFieldError(field: string) {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors;

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      await api.auth.register({ name, email, password });
      toast.success("Conta criada! Faça login para continuar.");
      navigate({ to: "/login" });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        toast.error("Erro ao cadastrar.");
        return;
      }

      const nextFieldErrors = getFieldErrors(error);
      if (Object.keys(nextFieldErrors).length === 0) {
        toast.error(error.message);
        return;
      }

      setFieldErrors(nextFieldErrors);
      toast.error("Revise os campos destacados.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      title="Crie sua conta"
      description="Comece a organizar as partidas, reunir votos e acompanhar quem está pronto para jogar."
      mobileEyebrow="Seu lobby começa aqui"
      footer={
        <>
          Já tem conta?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#23B5D3] transition-colors hover:text-[#72D5E8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#23B5D3]"
          >
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthFormField
          id="name"
          label="Nome"
          required
          minLength={2}
          maxLength={80}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            clearFieldError("name");
          }}
          autoComplete="name"
          errors={fieldErrors.name}
        />
        <AuthFormField
          id="email"
          label="E-mail"
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            clearFieldError("email");
          }}
          autoComplete="email"
          errors={fieldErrors.email}
        />
        <AuthFormField
          id="password"
          label="Senha"
          type="password"
          required
          minLength={8}
          maxLength={72}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearFieldError("password");
          }}
          autoComplete="new-password"
          helpText="Mínimo 8 caracteres, com letra maiúscula, minúscula e número."
          errors={fieldErrors.password}
        />
        <Button
          type="submit"
          className="w-full bg-[#23B5D3] text-[#0F1C21] hover:bg-[#72D5E8]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </AuthPageLayout>
  );
}
