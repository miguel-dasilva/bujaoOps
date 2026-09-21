import { OrganizationList } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="grid min-h-dvh place-items-center gap-6 p-4">
      <div className="max-w-sm text-center">
        <h1 className="text-2xl font-bold">Escolhe a empresa</h1>
        <p className="mt-2 text-rocha">
          Os dados ficam sempre dentro de uma empresa. Cria a tua (por exemplo, Bujões do Pico)
          para começar.
        </p>
      </div>
      <OrganizationList
        hidePersonal
        afterSelectOrganizationUrl="/"
        afterCreateOrganizationUrl="/"
      />
    </main>
  );
}
