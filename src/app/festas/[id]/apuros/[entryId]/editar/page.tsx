import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { RevenueEntryForm } from "@/components/revenue-entry-form";
import { db } from "@/db";
import { revenueEntries } from "@/db/schema";
import { centsToInput } from "@/lib/money";
import { requireOrg } from "@/lib/tenant";
import { updateRevenueEntry } from "../../actions";

export default async function EditRevenueEntryPage({
  params,
}: {
  params: Promise<{ id: string; entryId: string }>;
}) {
  const { orgId } = await requireOrg();
  const { id, entryId } = await params;
  if (!z.uuid().safeParse(id).success || !z.uuid().safeParse(entryId).success) notFound();

  const entry = await db.query.revenueEntries.findFirst({
    where: and(
      eq(revenueEntries.id, entryId),
      eq(revenueEntries.revenueEventId, id),
      eq(revenueEntries.orgId, orgId),
      isNull(revenueEntries.archivedAt),
    ),
  });
  if (!entry) notFound();

  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-bold">Editar apuro</h1>
      <RevenueEntryForm
        action={updateRevenueEntry.bind(null, id, entry.id)}
        submitLabel="Guardar alterações"
        cancelHref={`/festas/${id}`}
        defaults={{
          occurredOn: entry.occurredOn,
          label: entry.label ?? "",
          grossCents: centsToInput(entry.grossCents),
          note: entry.note ?? "",
        }}
      />
    </AppShell>
  );
}
