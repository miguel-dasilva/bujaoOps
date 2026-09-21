import { AppShell } from "@/components/app-shell";
import { AssetForm } from "@/components/asset-form";
import { requireOrg } from "@/lib/tenant";
import { createAsset } from "../actions";

export default async function NewMachinePage() {
  await requireOrg();
  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-bold">Registar máquina</h1>
      <AssetForm action={createAsset} submitLabel="Registar máquina" />
    </AppShell>
  );
}
