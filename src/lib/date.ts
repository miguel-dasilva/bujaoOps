const formatter = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "short" });

/** "2026-05-12" → "12 mai" */
export function formatDate(isoDate: string): string {
  return formatter.format(new Date(`${isoDate}T00:00:00`));
}

/** Junta início e fim; omite o fim quando é igual ao início ou não existe. */
export function formatDateRange(startsOn: string, endsOn: string | null | undefined): string {
  if (!endsOn || endsOn === startsOn) return formatDate(startsOn);
  return `${formatDate(startsOn)} – ${formatDate(endsOn)}`;
}
