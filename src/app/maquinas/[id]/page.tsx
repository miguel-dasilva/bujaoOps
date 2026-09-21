import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { AssetForm } from "@/components/asset-form";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { centsToInput } from "@/lib/money";
import { requireOrg } from "@/lib/tenant";
import { updateAsset } from "../actions";

export default async function EditMachinePage({ params }: { params: Promise<{ id: string }> }) {
  const { orgId } = await requireOrg();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const asset = await db.query.assets.findFirst({
    where: and(eq(assets.id, id), eq(assets.orgId, orgId), isNull(assets.archivedAt)),
  });
  if (!asset) notFound();

  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-bold">
        Editar <span className="text-atlantico">{asset.code}</span>
      </h1>
      <AssetForm
        action={updateAsset.bind(null, asset.id)}
        submitLabel="Guardar alterações"
        defaults={{
          code: asset.code,
          name: asset.name,
          acquiredOn: asset.acquiredOn ?? "",
          acquisitionCost: centsToInput(asset.acquisitionCostCents),
          pricePerGame: centsToInput(asset.attributes.pricePerGameCents),
          serialNumber: asset.attributes.serialNumber ?? "",
        }}
      />
    </AppShell>
  );
}
