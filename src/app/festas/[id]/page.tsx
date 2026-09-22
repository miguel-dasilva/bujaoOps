import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { ButtonLink } from "@/components/ui";
import { db } from "@/db";
import { assets, revenueEvents } from "@/db/schema";
import { formatDateRange } from "@/lib/date";
import { formatCents } from "@/lib/money";
import { requireOrg } from "@/lib/tenant";

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
        <ButtonLink href={`/festas/${event.id}/editar`} variant="quiet">
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
    </AppShell>
  );
}
