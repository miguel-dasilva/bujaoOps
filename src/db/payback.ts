import { sql } from "drizzle-orm";
import { db } from ".";

export type PaybackRow = {
  id: string;
  code: string;
  name: string;
  costCents: number;
  grossCents: number;
  feesCents: number;
  expensesCents: number;
  operatingProfitCents: number;
  balanceCents: number;
};

// Receita, comissões e despesas somadas em subconsultas separadas.
// (Somar a comissão num join com as entradas multiplicava-a pelo nº de dias.)
// Despesas contam se estiverem ligadas à máquina OU a uma festa da máquina.
// Despesas gerais (sem máquina nem festa) ficam fora do payback por máquina.
export async function getPayback(orgId: string): Promise<PaybackRow[]> {
  const result = await db.execute(sql`
    select
      a.id,
      a.code,
      a.name,
      coalesce(a.acquisition_cost_cents, 0) as cost,
      coalesce((
        select sum(e.gross_cents)
        from revenue_entries e
        join revenue_events ev on ev.id = e.revenue_event_id
        where ev.asset_id = a.id and ev.org_id = a.org_id
          and ev.archived_at is null and e.archived_at is null
      ), 0) as gross,
      coalesce((
        select sum(ev.platform_fee_cents)
        from revenue_events ev
        where ev.asset_id = a.id and ev.org_id = a.org_id
          and ev.archived_at is null
      ), 0) as fees,
      coalesce((
        select sum(x.amount_cents)
        from expenses x
        where x.org_id = a.org_id and x.archived_at is null
          and (
            x.asset_id = a.id
            or x.revenue_event_id in (
              select ev.id from revenue_events ev where ev.asset_id = a.id
            )
          )
      ), 0) as spent
    from assets a
    where a.org_id = ${orgId} and a.archived_at is null
    order by a.code
  `);

  return (result.rows as Record<string, unknown>[]).map((r) => {
    const costCents = Number(r.cost);
    const grossCents = Number(r.gross);
    const feesCents = Number(r.fees);
    const expensesCents = Number(r.spent);
    const operatingProfitCents = grossCents - feesCents - expensesCents;
    return {
      id: String(r.id),
      code: String(r.code),
      name: String(r.name),
      costCents,
      grossCents,
      feesCents,
      expensesCents,
      operatingProfitCents,
      balanceCents: operatingProfitCents - costCents,
    };
  });
}
