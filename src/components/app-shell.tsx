import Link from "next/link";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-linha bg-basalto text-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <nav className="flex gap-1 text-base font-bold">
            <Link href="/" className="rounded px-3 py-2 hover:bg-white/10">
              Resumo
            </Link>
            <Link href="/festas" className="rounded px-3 py-2 hover:bg-white/10">
              Festas
            </Link>
            <Link href="/maquinas" className="rounded px-3 py-2 hover:bg-white/10">
              Máquinas
            </Link>
            <Link href="/despesas" className="rounded px-3 py-2 hover:bg-white/10">
              Despesas
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <OrganizationSwitcher
              hidePersonal
              afterSelectOrganizationUrl="/"
              appearance={{ elements: { organizationSwitcherTrigger: "text-white" } }}
            />
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </>
  );
}
