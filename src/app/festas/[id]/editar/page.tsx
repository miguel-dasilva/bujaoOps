import { and, asc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { RevenueEventForm } from "@/components/revenue-event-form";
import { db } from "@/db";
import { assets, revenueEvents } from "@/db/schema";
import { centsToInput } from "@/lib/money";
import { requireOrg } from "@/lib/tenant";
import { updateRevenueEvent } from "../../actions";

export default async function EditRevenueEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { orgId } = await requireOrg();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const event = await db.query.revenueEvents.findFirst({
    where: and(
      eq(revenueEvents.id, id),
      eq(revenueEvents.orgId, orgId),
      isNull(revenueEvents.archivedAt),
    ),
  });
  if (!event) notFound();

  const machines = await db
    .select({ id: assets.id, code: assets.code, name: assets.name })
    .from(assets)
    .where(and(eq(assets.orgId, orgId), isNull(assets.archivedAt)))
    .orderBy(asc(assets.code));

  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-bold">
        Editar {event.title}
      </h1>
      <RevenueEventForm
        action={updateRevenueEvent.bind(null, event.id)}
        assets={machines}
        submitLabel="Guardar alterações"
        cancelHref={`/festas/${event.id}`}
        defaults={{
          assetId: event.assetId,
          title: event.title,
          venueName: event.venueName ?? "",
          startsOn: event.startsOn,
          endsOn: event.endsOn ?? "",
          platformFee: centsToInput(event.platformFeeCents),
          notes: event.notes ?? "",
        }}
      />
    </AppShell>
  );
}
