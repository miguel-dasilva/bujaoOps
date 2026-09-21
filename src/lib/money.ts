const eur = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });

export function formatCents(cents: number): string {
  return eur.format(cents / 100);
}

/** Para preencher inputs: 261500 → "2615,00" */
export function centsToInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

/**
 * Aceita "2615", "2615,5", "2.615,50", "2615.50", "2 615 €".
 * Devolve cêntimos inteiros, ou null se não for um valor válido.
 * Nunca passa por float para o resultado final.
 */
export function parseEurosToCents(input: string): number | null {
  let s = input.replace(/[\s€]/g, "");
  if (s === "") return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const m = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) return null;
  const [, sign, whole, frac = ""] = m;
  const cents = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  return sign ? -cents : cents;
}
