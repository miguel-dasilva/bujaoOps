"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import type { CalendarEvent } from "@/db/calendar";
import { assignLanes, monthGrid, monthLabel, addMonths } from "@/lib/calendar-grid";
import { formatDateRange } from "@/lib/date";
import {
  EVENT_STATUSES,
  EVENT_STATUS_BAR,
  EVENT_STATUS_BADGE,
  EVENT_STATUS_DOT,
  EVENT_STATUS_LABELS,
} from "@/lib/event-status";
import { formatCents } from "@/lib/money";
import { ButtonLink } from "./button-link";
import { useDayRangeSelection } from "./use-day-range-selection";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function EventCalendar({
  month,
  events,
  today,
}: {
  month: string;
  events: CalendarEvent[];
  today: string;
}) {
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const pick = useDayRangeSelection();
  const weeks = monthGrid(month);
  const year = month.slice(0, 4);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <ButtonLink
            href={`/festas?mes=${addMonths(month, -1)}`}
            variant="outline"
            size="icon"
            aria-label="Mês anterior"
          >
            <ChevronLeftIcon />
          </ButtonLink>
          <ButtonLink
            href={`/festas?mes=${addMonths(month, 1)}`}
            variant="outline"
            size="icon"
            aria-label="Mês seguinte"
          >
            <ChevronRightIcon />
          </ButtonLink>
          <h2 className="ml-2 text-xl font-bold first-letter:uppercase">{monthLabel(month)}</h2>
        </div>
        <div className="flex items-center gap-1">
          {[-1, 0, 1].map((d) => {
            const y = String(Number(year) + d);
            return (
              <ButtonLink
                key={y}
                href={`/festas?mes=${y}-${month.slice(5, 7)}`}
                variant={d === 0 ? "secondary" : "ghost"}
                size="sm"
                className="num"
              >
                {y}
              </ButtonLink>
            );
          })}
        </div>
      </div>

      <div
        ref={pick.gridRef}
        {...pick.handlers}
        className={`overflow-hidden rounded-xl border border-linha bg-card select-none ${
          pick.dragging ? "touch-none" : ""
        }`}
      >
        <div className="grid grid-cols-7 border-b border-linha bg-nevoa">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-1 py-2 text-center text-sm font-bold text-rocha">
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden" aria-hidden>
                {d[0]}
              </span>
              <span className="sr-only sm:hidden">{d}</span>
            </div>
          ))}
        </div>

        {weeks.map((week) => {
          const spans = assignLanes(events, week);
          const lanes = spans.length === 0 ? 0 : Math.max(...spans.map((s) => s.lane)) + 1;
          return (
            <div key={week[0].iso} className="relative border-b border-linha last:border-b-0">
              <div className="absolute inset-0 grid grid-cols-7">
                {week.map((d) => (
                  <button
                    key={d.iso}
                    type="button"
                    data-day={d.iso}
                    // detail === 0 distingue o Enter do teclado de um clique
                    // de rato. O clique já foi tratado no pointerup, e deixá-lo
                    // passar aqui apagava a seleção feita a arrastar.
                    onClick={(e) => e.detail === 0 && pick.selectDay(d.iso)}
                    aria-label={`${d.day} — escolher dia para uma festa nova`}
                    className={`border-r border-linha last:border-r-0 ${
                      pick.isSelected(d.iso)
                        ? "bg-lava/15 inset-ring-2 inset-ring-lava"
                        : d.inMonth
                          ? "hover:bg-nevoa"
                          : "bg-nevoa/60"
                    }`}
                  />
                ))}
              </div>

              <div className="pointer-events-none relative grid grid-cols-7">
                {week.map((d) => (
                  <div key={d.iso} className="px-1.5 pt-1.5">
                    <span
                      className={`num inline-flex size-7 items-center justify-center rounded-full text-sm ${
                        d.iso === today
                          ? "bg-lava font-bold text-white"
                          : d.inMonth
                            ? "font-bold text-basalto"
                            : "text-rocha/50"
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="pointer-events-none relative grid grid-cols-7 gap-y-0.5 px-0.5 pt-1 pb-1.5"
                style={{ minHeight: `${Math.max(lanes, 1) * 1.75 + 0.5}rem` }}
              >
                {spans.map((s) => (
                  <button
                    key={s.event.id}
                    type="button"
                    onClick={() => setSelected(s.event)}
                    style={{
                      gridColumn: `${s.startCol + 1} / ${s.endCol + 2}`,
                      gridRow: s.lane + 1,
                    }}
                    className={`pointer-events-auto flex min-w-0 items-center gap-1 overflow-hidden px-1.5 py-0.5 text-left text-xs font-bold ${
                      EVENT_STATUS_BAR[s.event.status]
                    } ${s.continuesBefore ? "rounded-l-none" : "rounded-l-md"} ${
                      s.continuesAfter ? "rounded-r-none" : "rounded-r-md"
                    }`}
                    title={s.event.title}
                  >
                    {s.event.conflictsWith.length > 0 && (
                      <TriangleAlertIcon className="size-3 shrink-0" aria-hidden />
                    )}
                    <span className="truncate">
                      {s.continuesBefore ? "… " : ""}
                      {s.event.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {pick.range ? (
        <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-lava bg-card p-3 shadow-lg">
          <span className="flex-1 font-bold">
            {formatDateRange(pick.range.from, pick.range.to === pick.range.from ? null : pick.range.to)}
          </span>
          <ButtonLink
            href={`/festas/nova?de=${pick.range.from}&ate=${pick.range.to}`}
            size="sm"
          >
            <PlusIcon />
            Registar festa
          </ButtonLink>
          <Button variant="ghost" size="icon-sm" onClick={pick.clear} aria-label="Limpar seleção">
            <XIcon />
          </Button>
        </div>
      ) : (
        <p className="text-sm text-rocha">
          Arrasta por cima dos dias para marcar uma festa nova. No telemóvel,
          carrega e aguenta antes de arrastar.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-rocha">
        {EVENT_STATUSES.map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`size-3 rounded-full ${EVENT_STATUS_DOT[s]}`} aria-hidden />
            {EVENT_STATUS_LABELS[s]}
          </span>
        ))}
      </div>

      <EventDialog event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function EventDialog({ event, onClose }: { event: CalendarEvent | null; onClose: () => void }) {
  return (
    <Dialog open={event !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        {event && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>
              <DialogDescription>
                {formatDateRange(event.startsOn, event.endsOn)}
                {[event.venueName, event.island].filter(Boolean).length > 0
                  ? ` · ${[event.venueName, event.island].filter(Boolean).join(", ")}`
                  : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={EVENT_STATUS_BADGE[event.status]}>
                  {EVENT_STATUS_LABELS[event.status]}
                </Badge>
                {event.assetCode ? (
                  <Badge variant="outline">{event.assetCode}</Badge>
                ) : (
                  <span className="text-sm text-rocha">sem máquina alocada</span>
                )}
              </div>

              {event.conflictsWith.length > 0 && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-perda bg-card p-3 text-perda"
                >
                  <TriangleAlertIcon className="mt-0.5 size-5 shrink-0" aria-hidden />
                  <span>
                    A mesma máquina está prometida a {event.conflictsWith.join(", ")} nestas datas.
                    Não pode estar nos dois sítios.
                  </span>
                </p>
              )}

              <Detail label="Quem organiza" value={event.contactName} />
              <Detail label="Contacto" value={event.contactInfo} />
              <Detail label="Condições" value={event.conditions} />
              <Detail label="Notas" value={event.notes} />
              {event.platformFeeCents > 0 && (
                <Detail
                  label="Comissão do recinto"
                  value={formatCents(event.platformFeeCents)}
                />
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <ButtonLink href={`/festas/${event.id}`}>Abrir festa</ButtonLink>
                <ButtonLink href={`/festas/${event.id}/editar`} variant="outline">
                  Editar
                </ButtonLink>
                <Button variant="ghost" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <h3 className="font-bold">{label}</h3>
      <p className="whitespace-pre-line text-rocha">{value}</p>
    </div>
  );
}
