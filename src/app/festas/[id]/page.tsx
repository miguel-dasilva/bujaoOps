import { and, asc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { RevenueEntryForm } from "@/components/revenue-entry-form";
import { ButtonLink } from "@/components/button-link";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { assets, revenueEntries, revenueEvents } from "@/db/schema";
import { formatDate, formatDateRange, todayInAzores } from "@/lib/date";
import { EVENT_STATUS_BADGE, EVENT_STATUS_LABELS, toEventStatus } from "@/lib/event-status";
import { formatCents } from "@/lib/money";
import { requireOrg } from "@/lib/tenant";
import { createRevenueEntry } from "./apuros/actions";

export default async function RevenueEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { orgId } = await requireOrg();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const rows = await db
    .select({
      id: revenueEvents.id,
      title: revenueEvents.title,
      status: revenueEvents.status,
      island: revenueEvents.island,
      venueName: revenueEvents.venueName,
      startsOn: revenueEvents.startsOn,
      endsOn: revenueEvents.endsOn,
      platformFeeCents: revenueEvents.platformFeeCents,
      contactName: revenueEvents.contactName,
      contactInfo: revenueEvents.contactInfo,
      conditions: revenueEvents.conditions,
      notes: revenueEvents.notes,
      assetId: revenueEvents.assetId,
      assetCode: assets.code,
      assetName: assets.name,
    })
    .from(revenueEvents)
    .leftJoin(assets, eq(revenueEvents.assetId, assets.id))
    .where(
      and(eq(revenueEvents.id, id), eq(revenueEvents.orgId, orgId), isNull(revenueEvents.archivedAt)),
    );
  const event = rows[0];
  if (!event) notFound();

  const entries = await db
    .select()
    .from(revenueEntries)
    .where(and(eq(revenueEntries.revenueEventId, event.id), isNull(revenueEntries.archivedAt)))
    .orderBy(asc(revenueEntries.occurredOn));
  const totalGrossCents = entries.reduce((sum, entry) => sum + entry.grossCents, 0);
  const today = todayInAzores();
  const status = toEventStatus(event.status);

  const where = [event.venueName, event.island].filter(Boolean).join(", ");

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <Badge variant="outline" className={EVENT_STATUS_BADGE[status]}>
              {EVENT_STATUS_LABELS[status]}
            </Badge>
          </div>
          <p className="text-rocha">
            {formatDateRange(event.startsOn, event.endsOn)}
            {where ? ` · ${where}` : ""}
          </p>
        </div>
        <ButtonLink href={`/festas/${event.id}/editar`} variant="outline">
          Editar
        </ButtonLink>
      </div>

      <dl className="grid gap-4 rounded-md border border-linha bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <dt className="font-bold">Máquina</dt>
          <dd className={event.assetCode ? "" : "text-rocha"}>
            {event.assetCode ? `${event.assetCode} — ${event.assetName}` : "ainda nenhuma"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="font-bold">Comissão do recinto</dt>
          <dd className="num">{formatCents(event.platformFeeCents)}</dd>
        </div>
        {(event.contactName || event.contactInfo) && (
          <div className="flex items-center justify-between gap-4">
            <dt className="font-bold">Quem organiza</dt>
            <dd className="text-right">
              {event.contactName}
              {event.contactName && event.contactInfo ? " · " : ""}
              {event.contactInfo}
            </dd>
          </div>
        )}
        {event.conditions && (
          <div>
            <dt className="mb-1 font-bold">Condições</dt>
            <dd className="whitespace-pre-line text-rocha">{event.conditions}</dd>
          </div>
        )}
        {event.notes && (
          <div>
            <dt className="mb-1 font-bold">Notas</dt>
            <dd className="whitespace-pre-line text-rocha">{event.notes}</dd>
          </div>
        )}
      </dl>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Apuros</h2>
          <span className="num text-lg font-bold text-ganho">{formatCents(totalGrossCents)}</span>
        </div>

        {entries.length > 0 && (
          <ul className="mb-6 divide-y divide-linha overflow-hidden rounded-md border border-linha bg-card">
            {entries.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/festas/${event.id}/apuros/${entry.id}/editar`}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-nevoa"
                >
                  <span className="num min-w-20 text-rocha">{formatDate(entry.occurredOn)}</span>
                  <span className="flex-1">{entry.label || "—"}</span>
                  <span className="num font-bold">{formatCents(entry.grossCents)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {event.assetId ? (
          <div className="rounded-md border border-linha bg-card p-4">
            <h3 className="mb-4 font-bold">Registar apuro</h3>
            <RevenueEntryForm
              action={createRevenueEntry.bind(null, event.id)}
              defaults={{ occurredOn: today }}
              submitLabel="Registar apuro"
              resetOnSuccess
            />
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-linha bg-card p-4 text-rocha">
            Esta festa ainda não tem máquina alocada. Um apuro sem máquina não entraria no payback
            de nenhuma — aloca a máquina primeiro, no botão Editar.
          </p>
        )}
      </div>
    </AppShell>
  );
}
