// Pedir day+month juntos em pt-PT dá "13/08", que se confunde com o formato
// americano num relance. Compostos à mão, dão "13 ago", que não se confunde.
const monthFormatter = new Intl.DateTimeFormat("pt-PT", { month: "short" });

// O servidor corre em UTC e os Açores estão uma hora atrás. Usar a data UTC
// faria a app mudar de dia às 23h locais, no meio da última noite de festa.
const azoresDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Atlantic/Azores" });

/** Data de hoje nos Açores, em "YYYY-MM-DD". */
export function todayInAzores(): string {
  return azoresDate.format(new Date());
}

/** "2026-05-12" → "12 mai" */
export function formatDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return `${d.getDate()} ${monthFormatter.format(d).replace(".", "")}`;
}

/** Junta início e fim; omite o fim quando é igual ao início ou não existe. */
export function formatDateRange(startsOn: string, endsOn: string | null | undefined): string {
  if (!endsOn || endsOn === startsOn) return formatDate(startsOn);
  return `${formatDate(startsOn)} – ${formatDate(endsOn)}`;
}
