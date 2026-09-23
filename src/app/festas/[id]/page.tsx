import { and, asc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { RevenueEntryForm } from "@/components/revenue-entry-form";
import { ButtonLink } from "@/components/button-link";
import { db } from "@/db";
import { assets, revenueEntries, revenueEvents } from "@/db/schema";
import { formatDate, formatDateRange } from "@/lib/date";
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
      venueName: revenueEvents.venueName,
      startsOn: revenueEvents.startsOn,
      endsOn: revenueEvents.endsOn,
      platformFeeCents: revenueEvents.platformFeeCents,
      notes: revenueEvents.notes,
      assetCode: assets.code,
      assetName: assets.name,
    })
    .from(revenueEvents)
    .innerJoin(assets, eq(revenueEvents.assetId, assets.id))
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
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-rocha">
            {event.assetCode} — {event.assetName} · {formatDateRange(event.startsOn, event.endsOn)}
            {event.venueName ? ` · ${event.venueName}` : ""}
          </p>
        </div>
        <ButtonLink href={`/festas/${event.id}/editar`} variant="outline">
          Editar
        </ButtonLink>
      </div>

      <dl className="grid gap-4 rounded-md border border-linha bg-white p-4">
        <div className="flex items-center justify-between">
          <dt className="font-bold">Comissão do recinto</dt>
          <dd className="num">{formatCents(event.platformFeeCents)}</dd>
        </div>
        {event.notes && (
          <div>
            <dt className="mb-1 font-bold">Notas</dt>
            <dd className="text-rocha">{event.notes}</dd>
          </div>
        )}
      </dl>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Apuros</h2>
          <span className="num text-lg font-bold text-ganho">{formatCents(totalGrossCents)}</span>
        </div>

        {entries.length > 0 && (
          <ul className="mb-6 divide-y divide-linha overflow-hidden rounded-md border border-linha bg-white">
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

        <div className="rounded-md border border-linha bg-white p-4">
          <h3 className="mb-4 font-bold">Registar apuro</h3>
          <RevenueEntryForm
            action={createRevenueEntry.bind(null, event.id)}
            defaults={{ occurredOn: today }}
            submitLabel="Registar apuro"
            resetOnSuccess
          />
        </div>
      </div>
    </AppShell>
  );
}
