import Link from "next/link";
import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { ButtonLink } from "@/components/button-link";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { formatDate } from "@/lib/date";
import { formatCents } from "@/lib/money";
import { requireOrg } from "@/lib/tenant";

export default async function ExpensesPage() {
  const { orgId } = await requireOrg();
  const rows = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.orgId, orgId), isNull(expenses.archivedAt)))
    .orderBy(desc(expenses.incurredOn));
  const totalCents = rows.reduce((sum, r) => sum + r.amountCents, 0);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Despesas</h1>
        <ButtonLink href="/despesas/nova">Registar despesa</ButtonLink>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-linha bg-card p-6 text-rocha">
          Ainda não tens despesas registadas.
        </p>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="font-bold">Total</span>
            <span className="num text-lg font-bold text-perda">{formatCents(totalCents)}</span>
          </div>
          <ul className="divide-y divide-linha overflow-hidden rounded-md border border-linha bg-card">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/despesas/${r.id}`}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-nevoa"
                >
                  <span className="num min-w-20 text-rocha">{formatDate(r.incurredOn)}</span>
                  <span className="flex-1">
                    {r.description}
                    <span className="text-rocha"> · {r.category}</span>
                  </span>
                  <span className="num font-bold">{formatCents(r.amountCents)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}
