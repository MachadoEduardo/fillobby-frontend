import type { QueueStatus } from "@/lib/api-types";

export const QUEUE_STATUS_VARIANT: Record<QueueStatus, string> = {
  SUGGESTED: "bg-status-suggested/12 text-status-suggested",
  VOTING: "bg-status-voting/12 text-status-voting",
  WAITING_PLAYERS: "bg-status-waiting/12 text-status-waiting",
  READY: "bg-status-ready/12 text-status-ready",
  PLAYING: "bg-status-playing/12 text-status-playing",
  COMPLETED: "bg-status-completed/12 text-status-completed",
  CANCELLED: "bg-status-cancelled/12 text-status-cancelled",
};

export const QUEUE_FLOW: Array<{ status: QueueStatus; label: string }> = [
  { status: "SUGGESTED", label: "Sugestão" },
  { status: "VOTING", label: "Votação" },
  { status: "WAITING_PLAYERS", label: "Jogadores" },
  { status: "READY", label: "Pronto" },
  { status: "PLAYING", label: "Jogando" },
];

export const QUEUE_STATUS_MESSAGE: Record<QueueStatus, string> = {
  SUGGESTED: "Aguardando o grupo abrir a votação.",
  VOTING: "A escolha está com o grupo. Registre seu voto.",
  WAITING_PLAYERS: "Participantes selecionados estão confirmando prontidão.",
  READY: "A galera está pronta para começar.",
  PLAYING: "Partida em andamento.",
  COMPLETED: "Partida concluída e registrada no histórico.",
  CANCELLED: "Este item foi cancelado.",
};
