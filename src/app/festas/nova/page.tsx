import { and, asc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { RevenueEventForm } from "@/components/revenue-event-form";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";
import { createRevenueEvent } from "../actions";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function NewRevenueEventPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  const { orgId } = await requireOrg();
  const { de, ate } = await searchParams;
  const machines = await db
    .select({ id: assets.id, code: assets.code, name: assets.name })
    .from(assets)
    .where(and(eq(assets.orgId, orgId), isNull(assets.archivedAt)))
    .orderBy(asc(assets.code));

  // Datas vindas do arrasto no calendário.
  const startsOn = de && DATE.test(de) ? de : "";
  const endsOn = ate && DATE.test(ate) && ate !== startsOn ? ate : "";

  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-bold">Registar festa</h1>
      <RevenueEventForm
        action={createRevenueEvent}
        assets={machines}
        submitLabel="Registar festa"
        cancelHref="/festas"
        defaults={{ startsOn, endsOn }}
      />
    </AppShell>
  );
}
