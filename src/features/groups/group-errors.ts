import { ApiError } from "@/lib/api";

export function getGroupLoadErrorMessage(
  error: unknown,
  subject: "fila" | "membros" | "histórico" | "votos" | "jogos",
) {
  const labels = {
    fila: {
      inline: "a fila",
      unavailable: "A fila não pôde ser carregada agora.",
    },
    membros: {
      inline: "os membros",
      unavailable: "Os membros não puderam ser carregados agora.",
    },
    histórico: {
      inline: "o histórico",
      unavailable: "O histórico não pôde ser carregado agora.",
    },
    votos: {
      inline: "os votos",
      unavailable: "Os votos não puderam ser carregados agora.",
    },
    jogos: {
      inline: "os jogos",
      unavailable: "Os jogos não puderam ser carregados agora.",
    },
  } as const;

  if (!(error instanceof ApiError) || error.status === 0) {
    return `Não foi possível carregar ${labels[subject].inline}. Verifique sua conexão e tente novamente.`;
  }

  return `${labels[subject].unavailable} Aguarde um momento e tente novamente.`;
}

export function getGroupActionErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiError) || error.status === 0) {
    return "Não foi possível concluir a ação. Verifique sua conexão e tente novamente.";
  }

  if (error.status === 403) {
    return "Você não tem permissão para realizar esta ação.";
  }

  if (error.status === 404) {
    return "Essa informação não está mais disponível. Atualize a página e tente novamente.";
  }

  if (error.status === 409) {
    return "O grupo foi atualizado por outra pessoa. Aguarde a atualização da tela e tente novamente.";
  }

  if (error.status === 400 || error.details.length > 0) {
    return "Não foi possível concluir com as informações atuais. Revise os dados e tente novamente.";
  }

  return fallback;
}
