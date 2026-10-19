// O processo de uma festa: descobre-se, contacta-se, fecha-se ou não.
// A cor indica o ESTADO, não a identidade da festa — o CLAUDE.md reserva
// verde e vermelho a ganho e perda e proíbe cor decorativa, por isso nenhum
// destes quatro os usa. A festa identifica-se pelo nome e pela barra contínua.
export const EVENT_STATUSES = ["idea", "contacted", "confirmed", "out"] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  idea: "Ideia",
  contacted: "Contactada",
  confirmed: "Confirmada",
  out: "Fora",
};

export const EVENT_STATUS_HINTS: Record<EventStatus, string> = {
  idea: "A festa existe e interessa-nos. Ainda não falámos com ninguém.",
  contacted: "Já falámos com a organização. À espera de resposta.",
  confirmed: "Está fechado. Vamos, e a máquina fica alocada.",
  out: "Não vamos. Fica no histórico para o ano que vem.",
};

/** Barra no calendário. */
export const EVENT_STATUS_BAR: Record<EventStatus, string> = {
  idea: "border border-dashed border-linha bg-card text-rocha",
  contacted: "bg-lava/15 text-lava border border-lava/40",
  confirmed: "bg-basalto text-white",
  out: "bg-nevoa text-rocha/70 line-through",
};

/** Ponto de cor, para legendas e listas. */
export const EVENT_STATUS_DOT: Record<EventStatus, string> = {
  idea: "border-2 border-linha bg-card",
  contacted: "bg-lava-vivo",
  confirmed: "bg-basalto",
  out: "bg-linha",
};

export const EVENT_STATUS_BADGE: Record<EventStatus, string> = {
  idea: "border-linha text-rocha",
  contacted: "border-lava/40 text-lava",
  confirmed: "border-basalto text-basalto",
  out: "border-linha text-rocha line-through",
};

const valid = new Set<string>(EVENT_STATUSES);

/** A coluna é texto livre; qualquer valor desconhecido lê-se como "ideia". */
export function toEventStatus(value: string | null | undefined): EventStatus {
  return value && valid.has(value) ? (value as EventStatus) : "idea";
}
