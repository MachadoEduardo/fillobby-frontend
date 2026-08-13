import { ApiError } from "@/lib/api";

export function getGamesListErrorMessage(error: unknown) {
  if (!(error instanceof ApiError) || error.status === 0) {
    return "Não foi possível acessar o catálogo. Verifique sua conexão e tente novamente.";
  }

  return "O catálogo não pôde ser carregado agora. Aguarde um momento e tente novamente.";
}

export function getSaveGameErrorMessage(error: unknown) {
  if (!(error instanceof ApiError) || error.status === 0) {
    return "Não foi possível salvar o jogo. Verifique sua conexão e tente novamente.";
  }

  if (error.code === "GAME_ALREADY_EXISTS" || error.status === 409) {
    return "Já existe um jogo com esse título no catálogo.";
  }

  if (error.status === 400 || error.details.length > 0) {
    return "Algumas informações precisam ser revistas antes de salvar o jogo.";
  }

  return "O jogo não pôde ser salvo agora. Aguarde um momento e tente novamente.";
}

export function getDeactivateGameErrorMessage(error: unknown) {
  if (!(error instanceof ApiError) || error.status === 0) {
    return "Não foi possível remover o jogo do catálogo. Verifique sua conexão e tente novamente.";
  }

  return "O jogo não pôde ser removido agora. Aguarde um momento e tente novamente.";
}
