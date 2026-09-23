import Link from "next/link";
import { and, asc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { ButtonLink } from "@/components/button-link";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { formatCents } from "@/lib/money";
import { requireOrg } from "@/lib/tenant";

export default async function MachinesPage() {
  const { orgId } = await requireOrg();
  const rows = await db
    .select()
    .from(assets)
    .where(and(eq(assets.orgId, orgId), isNull(assets.archivedAt)))
    .orderBy(asc(assets.code));

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Máquinas</h1>
        <ButtonLink href="/maquinas/nova">Registar máquina</ButtonLink>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-linha bg-white p-6 text-rocha">
          Ainda não tens máquinas. Regista a primeira com o custo de compra para o resumo começar a
          contar o payback.
        </p>
      ) : (
        <ul className="divide-y divide-linha overflow-hidden rounded-md border border-linha bg-white">
          {rows.map((a) => (
            <li key={a.id}>
              <Link
                href={`/maquinas/${a.id}`}
                className="flex items-center gap-4 px-4 py-4 hover:bg-nevoa"
              >
                <span className="num min-w-16 font-bold text-atlantico">{a.code}</span>
                <span className="flex-1">{a.name}</span>
                <span className="num text-rocha">
                  {a.acquisitionCostCents != null ? formatCents(a.acquisitionCostCents) : "sem custo"}
                </span>
                <span className="flex-1">
                  {a.description || "sem descrição"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
