import { and, asc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { ExpenseForm } from "@/components/expense-form";
import { db } from "@/db";
import { assets, expenses, revenueEvents } from "@/db/schema";
import { centsToInput } from "@/lib/money";
import { requireOrg } from "@/lib/tenant";
import { updateExpense } from "../actions";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { orgId } = await requireOrg();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const expense = await db.query.expenses.findFirst({
    where: and(eq(expenses.id, id), eq(expenses.orgId, orgId), isNull(expenses.archivedAt)),
  });
  if (!expense) notFound();

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
      <h1 className="mb-6 text-3xl font-bold">Editar despesa</h1>
      <ExpenseForm
        action={updateExpense.bind(null, expense.id)}
        assets={machines}
        revenueEvents={events}
        submitLabel="Guardar alterações"
        cancelHref="/despesas"
        defaults={{
          assetId: expense.assetId ?? "",
          revenueEventId: expense.revenueEventId ?? "",
          category: expense.category,
          description: expense.description,
          amountCents: centsToInput(expense.amountCents),
          incurredOn: expense.incurredOn,
        }}
      />
    </AppShell>
  );
}
