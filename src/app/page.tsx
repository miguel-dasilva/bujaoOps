import { AppShell } from "@/components/app-shell";
import { ButtonLink } from "@/components/button-link";
import { getGeneralExpensesCents, getPayback, type PaybackRow } from "@/db/payback";
import { formatCents } from "@/lib/money";
import { requireOrg } from "@/lib/tenant";

export default async function SummaryPage() {
  const { orgId } = await requireOrg();
  const [rows, generalExpensesCents] = await Promise.all([
    getPayback(orgId),
    getGeneralExpensesCents(orgId),
  ]);

  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-bold">Resumo</h1>
      {rows.length === 0 ? (
        <div className="grid gap-4 rounded-md border border-dashed border-linha bg-white p-6">
          <p className="text-rocha">
            Regista a tua primeira máquina com o custo de compra. A partir daí, cada apuro e cada
            despesa aproximam ou afastam o momento em que ela se paga.
          </p>
          <ButtonLink href="/maquinas/nova" className="justify-self-start">
            Registar máquina
          </ButtonLink>
        </div>
      ) : (
        <div className="grid gap-4">
          <TotalBalanceCard rows={rows} generalExpensesCents={generalExpensesCents} />
          {rows.map((r) => (
            <PaybackCard key={r.id} row={r} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function TotalBalanceCard({
  rows,
  generalExpensesCents,
}: {
  rows: PaybackRow[];
  generalExpensesCents: number;
}) {
  const totalBalanceCents =
    rows.reduce((sum, r) => sum + r.balanceCents, 0) - generalExpensesCents;
  const paid = totalBalanceCents >= 0;

  return (
    <section className="rounded-md border border-linha bg-white p-5">
      <h2 className="text-lg font-bold">Balanço total</h2>
      <p className={`num mt-1 text-4xl font-bold ${paid ? "text-ganho" : "text-perda"}`}>
        {formatCents(totalBalanceCents)}
      </p>
      {generalExpensesCents > 0 && (
        <p className="mt-2 text-sm text-rocha">
          Inclui {formatCents(generalExpensesCents)} de despesas gerais da empresa, não ligadas a
          nenhuma máquina.
        </p>
      )}
    </section>
  );
}

function PaybackCard({ row }: { row: PaybackRow }) {
  const paid = row.balanceCents >= 0;
  const recovered =
    row.costCents > 0
      ? Math.max(0, Math.min(1, row.operatingProfitCents / row.costCents))
      : 1;

  return (
    <section className="rounded-md border border-linha bg-white p-5">
      <h2 className="text-lg">
        <span className="font-bold text-atlantico">{row.code}</span> {row.name}
      </h2>

      <p className={`num mt-3 text-4xl font-bold ${paid ? "text-ganho" : "text-perda"}`}>
        {formatCents(row.balanceCents)}
      </p>
      <p className="text-rocha">
        {paid
          ? "A máquina já se pagou. Daqui para a frente é lucro."
          : `Faltam ${formatCents(-row.balanceCents)} para a máquina se pagar.`}
      </p>

      <div
        className="mt-4 h-3 overflow-hidden rounded-full bg-nevoa"
        role="progressbar"
        aria-label="Custo de compra recuperado"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(recovered * 100)}
      >
        <div className="h-full bg-atlantico" style={{ width: `${recovered * 100}%` }} />
      </div>

      <dl className="num mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
        <dt className="text-rocha">Apuros</dt>
        <dd className="text-right sm:text-left">{formatCents(row.grossCents)}</dd>
        <dt className="text-rocha">Comissões</dt>
        <dd className="text-right sm:text-left">−{formatCents(row.feesCents)}</dd>
        <dt className="text-rocha">Despesas</dt>
        <dd className="text-right sm:text-left">−{formatCents(row.expensesCents)}</dd>
        <dt className="text-rocha">Custo de compra</dt>
        <dd className="text-right sm:text-left">−{formatCents(row.costCents)}</dd>
      </dl>
    </section>
  );
}
