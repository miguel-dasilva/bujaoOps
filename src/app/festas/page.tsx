import Link from "next/link";
import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { ButtonLink } from "@/components/button-link";
import { db } from "@/db";
import { assets, revenueEvents } from "@/db/schema";
import { formatDateRange } from "@/lib/date";
import { requireOrg } from "@/lib/tenant";

export default async function RevenueEventsPage() {
  const { orgId } = await requireOrg();
  const rows = await db
    .select({
      id: revenueEvents.id,
      title: revenueEvents.title,
      venueName: revenueEvents.venueName,
      startsOn: revenueEvents.startsOn,
      endsOn: revenueEvents.endsOn,
      assetCode: assets.code,
    })
    .from(revenueEvents)
    .innerJoin(assets, eq(revenueEvents.assetId, assets.id))
    .where(and(eq(revenueEvents.orgId, orgId), isNull(revenueEvents.archivedAt)))
    .orderBy(desc(revenueEvents.startsOn));

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Festas</h1>
        <ButtonLink href="/festas/nova">Registar festa</ButtonLink>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-linha bg-card p-6 text-rocha">
          Ainda não tens festas registadas. Regista a primeira para começares a lançar apuros.
        </p>
      ) : (
        <ul className="divide-y divide-linha overflow-hidden rounded-md border border-linha bg-card">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/festas/${r.id}`}
                className="flex items-center gap-4 px-4 py-4 hover:bg-nevoa"
              >
                <span className="num min-w-16 font-bold text-basalto">{r.assetCode}</span>
                <span className="flex-1">
                  {r.title}
                  {r.venueName ? <span className="text-rocha"> · {r.venueName}</span> : null}
                </span>
                <span className="num text-rocha">{formatDateRange(r.startsOn, r.endsOn)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
