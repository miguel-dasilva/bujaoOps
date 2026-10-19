// Matemática da grelha mensal, sem React à mistura para poder ser testada.
// Tudo em UTC: as datas são "YYYY-MM-DD" sem hora, e usar hora local faria
// o dia saltar para trás nos Açores, que estão atrás de UTC.

export type GridDay = {
  iso: string;
  day: number;
  inMonth: boolean;
  weekday: number; // 0 = segunda
};

function utc(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + n);
  return copy;
}

/** "2027-06" → primeiro dia do mês. */
function firstOfMonth(ym: string): Date {
  return utc(`${ym}-01`);
}

/** Desloca um mês: ("2027-06", 1) → "2027-07". */
export function addMonths(ym: string, delta: number): string {
  const d = firstOfMonth(ym);
  d.setUTCMonth(d.getUTCMonth() + delta);
  return iso(d).slice(0, 7);
}

/** "2027-06" → "junho de 2027" */
export function monthLabel(ym: string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(firstOfMonth(ym));
}

/** O mês a que uma data pertence. */
export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/**
 * Semanas que cobrem o mês, de segunda a domingo, incluindo os dias
 * encostados dos meses vizinhos para a grelha ficar completa.
 */
export function monthGrid(ym: string): GridDay[][] {
  const first = firstOfMonth(ym);
  // getUTCDay(): 0 = domingo. Queremos segunda como primeira coluna.
  const lead = (first.getUTCDay() + 6) % 7;
  const start = addDays(first, -lead);

  const last = new Date(first);
  last.setUTCMonth(last.getUTCMonth() + 1);
  last.setUTCDate(0);
  const trail = 6 - ((last.getUTCDay() + 6) % 7);
  const end = addDays(last, trail);

  const weeks: GridDay[][] = [];
  let cursor = start;
  while (cursor <= end) {
    const week: GridDay[] = [];
    for (let i = 0; i < 7; i++) {
      const isoDay = iso(cursor);
      week.push({
        iso: isoDay,
        day: cursor.getUTCDate(),
        inMonth: isoDay.slice(0, 7) === ym,
        weekday: i,
      });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export type Span<T> = {
  event: T;
  startCol: number; // 0-6
  endCol: number; // 0-6, inclusivo
  continuesBefore: boolean;
  continuesAfter: boolean;
  lane: number;
};

type Dated = { startsOn: string; endsOn: string | null };

/**
 * Coloca as festas de uma semana em faixas horizontais, de modo a que duas
 * festas sobrepostas nunca caiam na mesma faixa. É o que faz as coincidências
 * aparecerem umas por baixo das outras em vez de se taparem.
 */
export function assignLanes<T extends Dated>(events: T[], week: GridDay[]): Span<T>[] {
  const weekStart = week[0].iso;
  const weekEnd = week[6].iso;

  const visible = events
    .map((event) => {
      const start = event.startsOn;
      const end = event.endsOn ?? event.startsOn;
      if (end < weekStart || start > weekEnd) return null;
      const startCol = week.findIndex((d) => d.iso >= start);
      const endIdx = [...week].reverse().findIndex((d) => d.iso <= end);
      return {
        event,
        startCol: startCol === -1 ? 0 : startCol,
        endCol: endIdx === -1 ? 6 : 6 - endIdx,
        continuesBefore: start < weekStart,
        continuesAfter: end > weekEnd,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
    // Primeiro as que começam mais cedo; entre iguais, as mais longas acima.
    .sort(
      (a, b) =>
        a.startCol - b.startCol ||
        b.endCol - b.startCol - (a.endCol - a.startCol) ||
        a.event.startsOn.localeCompare(b.event.startsOn),
    );

  const laneEnds: number[] = [];
  return visible.map((s) => {
    let lane = laneEnds.findIndex((end) => end < s.startCol);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = s.endCol;
    return { ...s, lane };
  });
}

/** Duas festas cruzam-se no tempo? */
export function overlaps(a: Dated, b: Dated): boolean {
  return (a.endsOn ?? a.startsOn) >= b.startsOn && (b.endsOn ?? b.startsOn) >= a.startsOn;
}
