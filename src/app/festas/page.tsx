import Link from "next/link";
import { TriangleAlertIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ButtonLink } from "@/components/button-link";
import { EventCalendar } from "@/components/event-calendar";
import { Badge } from "@/components/ui/badge";
import { getCalendarEvents, type CalendarEvent } from "@/db/calendar";
import { monthLabel, monthOf } from "@/lib/calendar-grid";
import { formatDateRange, todayInAzores } from "@/lib/date";
import { EVENT_STATUS_BADGE, EVENT_STATUS_LABELS } from "@/lib/event-status";
import { requireOrg } from "@/lib/tenant";

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export default async function RevenueEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; vista?: string }>;
}) {
  const { orgId } = await requireOrg();
  const { mes, vista } = await searchParams;
  const today = todayInAzores();
  const month = mes && MONTH.test(mes) ? mes : monthOf(today);
  const asList = vista === "lista";

  const events = await getCalendarEvents(orgId);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Festas</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-linha p-0.5">
            <ButtonLink
              href={`/festas?mes=${month}`}
              variant={asList ? "ghost" : "secondary"}
              size="sm"
            >
              Calendário
            </ButtonLink>
            <ButtonLink
              href={`/festas?mes=${month}&vista=lista`}
              variant={asList ? "secondary" : "ghost"}
              size="sm"
            >
              Lista
            </ButtonLink>
          </div>
          <ButtonLink href="/festas/nova">Registar festa</ButtonLink>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="rounded-md border border-dashed border-linha bg-card p-6 text-rocha">
          Ainda não tens festas registadas. Regista a primeira, mesmo que seja só uma ideia que
          viste num cartaz — a máquina só é precisa quando estiver confirmada.
        </p>
      ) : asList ? (
        <EventList events={events} />
      ) : (
        <EventCalendar month={month} events={events} today={today} />
      )}
    </AppShell>
  );
}

function EventList({ events }: { events: CalendarEvent[] }) {
  const byMonth = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const key = monthOf(e.startsOn);
    byMonth.set(key, [...(byMonth.get(key) ?? []), e]);
  }

  return (
    <div className="grid gap-6">
      {[...byMonth.entries()].map(([month, list]) => (
        <section key={month}>
          <h2 className="mb-2 font-bold text-rocha first-letter:uppercase">{monthLabel(month)}</h2>
          <ul className="divide-y divide-linha overflow-hidden rounded-xl border border-linha bg-card">
            {list.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/festas/${e.id}`}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-4 hover:bg-nevoa"
                >
                  <Badge variant="outline" className={EVENT_STATUS_BADGE[e.status]}>
                    {EVENT_STATUS_LABELS[e.status]}
                  </Badge>
                  <span className="flex-1 font-bold">
                    {e.title}
                    {e.island || e.venueName ? (
                      <span className="font-normal text-rocha">
                        {" · "}
                        {[e.venueName, e.island].filter(Boolean).join(", ")}
                      </span>
                    ) : null}
                  </span>
                  {e.conflictsWith.length > 0 && (
                    <TriangleAlertIcon className="size-5 text-perda" aria-label="Conflito de máquina" />
                  )}
                  {e.assetCode && <span className="num text-rocha">{e.assetCode}</span>}
                  <span className="num text-rocha">{formatDateRange(e.startsOn, e.endsOn)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
