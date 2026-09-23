import { AppShell } from "@/components/app-shell";
import { ButtonLink } from "@/components/button-link";
import { MachineCard } from "@/components/machine-card";
import { Card, CardContent } from "@/components/ui/card";
import { getMachineCards, type MachineCard as MachineCardData } from "@/db/dashboard";
import { getGeneralExpensesCents } from "@/db/payback";
import { todayInAzores } from "@/lib/date";
import { formatCents } from "@/lib/money";
import { requireOrg } from "@/lib/tenant";
import { createRevenueEntry } from "./festas/[id]/apuros/actions";
import { updateAssetNote } from "./maquinas/actions";
import { removeAttachment, uploadAttachment } from "./maquinas/attachments-actions";

export default async function DashboardPage() {
  const { orgId } = await requireOrg();
  const [machines, generalExpensesCents] = await Promise.all([
    getMachineCards(orgId),
    getGeneralExpensesCents(orgId),
  ]);
  const today = todayInAzores();

  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-bold">Resumo</h1>
      {machines.length === 0 ? (
        <Card>
          <CardContent className="grid gap-4">
            <p className="text-rocha">
              Regista a tua primeira máquina com o custo de compra. A partir daí, cada apuro e cada
              despesa aproximam ou afastam o momento em que ela se paga.
            </p>
            <ButtonLink href="/maquinas/nova" className="justify-self-start">
              Registar máquina
            </ButtonLink>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <TotalBalanceCard machines={machines} generalExpensesCents={generalExpensesCents} />
          {machines.map((m) => (
            <MachineCard
              key={m.id}
              machine={m}
              today={today}
              createEntry={
                m.activeEvent ? createRevenueEntry.bind(null, m.activeEvent.id) : null
              }
              updateNote={updateAssetNote.bind(null, m.id)}
              uploadAttachment={uploadAttachment.bind(null, m.id)}
              removeAttachment={removeAttachment}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function TotalBalanceCard({
  machines,
  generalExpensesCents,
}: {
  machines: MachineCardData[];
  generalExpensesCents: number;
}) {
  const totalBalanceCents =
    machines.reduce((sum, m) => sum + m.balanceCents, 0) - generalExpensesCents;
  const paid = totalBalanceCents >= 0;

  return (
    <Card className="bg-basalto text-white ring-0">
      <CardContent>
        <h2 className="font-bold text-white/70">Balanço total</h2>
        <p className={`num mt-1 text-4xl font-bold ${paid ? "text-ganho-vivo" : "text-perda-vivo"}`}>
          {formatCents(totalBalanceCents)}
        </p>
        {generalExpensesCents > 0 && (
          <p className="mt-2 text-sm text-white/70">
            Inclui {formatCents(generalExpensesCents)} de despesas gerais da empresa, não ligadas a
            nenhuma máquina.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
