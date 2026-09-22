import { and, asc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { ExpenseForm } from "@/components/expense-form";
import { db } from "@/db";
import { assets, revenueEvents } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";
import { createExpense } from "../actions";

export default async function NewExpensePage() {
  const { orgId } = await requireOrg();
  const [machines, events] = await Promise.all([
    db
      .select({ id: assets.id, code: assets.code, name: assets.name })
      .from(assets)
      .where(and(eq(assets.orgId, orgId), isNull(assets.archivedAt)))
      .orderBy(asc(assets.code)),
    db
      .select({ id: revenueEvents.id, title: revenueEvents.title, assetCode: assets.code })
      .from(revenueEvents)
      .innerJoin(assets, eq(revenueEvents.assetId, assets.id))
      .where(and(eq(revenueEvents.orgId, orgId), isNull(revenueEvents.archivedAt)))
      .orderBy(asc(revenueEvents.startsOn)),
  ]);

  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-bold">Registar despesa</h1>
      <ExpenseForm
        action={createExpense}
        assets={machines}
        revenueEvents={events}
        submitLabel="Registar despesa"
        cancelHref="/despesas"
      />
    </AppShell>
  );
}
