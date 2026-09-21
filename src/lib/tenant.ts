import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { organizations } from "@/db/schema";

// Chama isto no início de TODA a página e Server Action que toque em dados.
// O proxy.ts protege as rotas, mas a autorização não deve depender só dele:
// cada leitura e escrita filtra pelo orgId que sai daqui.
export const requireOrg = cache(async () => {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/select-org");

  // Espelho da organização do Clerk, criado na primeira visita.
  const existing = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
    columns: { id: true },
  });
  if (!existing) {
    const clerk = await clerkClient();
    const org = await clerk.organizations.getOrganization({ organizationId: orgId });
    await db
      .insert(organizations)
      .values({ id: orgId, name: org.name })
      .onConflictDoNothing();
  }

  return { userId, orgId };
});
