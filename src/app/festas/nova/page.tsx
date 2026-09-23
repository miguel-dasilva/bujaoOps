import { and, asc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { RevenueEventForm } from "@/components/revenue-event-form";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";
import { createRevenueEvent } from "../actions";

export default async function NewRevenueEventPage() {
  const { orgId } = await requireOrg();
  const machines = await db
    .select({ id: assets.id, code: assets.code, name: assets.name })
    .from(assets)
    .where(and(eq(assets.orgId, orgId), isNull(assets.archivedAt)))
    .orderBy(asc(assets.code));

  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-bold">Registar festa</h1>
      {machines.length === 0 ? (
        <p className="rounded-md border border-dashed border-linha bg-card p-6 text-rocha">
          Regista primeiro uma máquina para poderes associar uma festa.
        </p>
      ) : (
        <RevenueEventForm
          action={createRevenueEvent}
          assets={machines}
          submitLabel="Registar festa"
          cancelHref="/festas"
        />
      )}
    </AppShell>
  );
}
