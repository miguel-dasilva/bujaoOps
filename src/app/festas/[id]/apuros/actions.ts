"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { revenueEntries, revenueEvents } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";
import { revenueEntrySchema, type RevenueEntryInput } from "@/lib/validation";

export type FormState = {
  errors?: Partial<Record<keyof RevenueEntryInput, string[]>>;
  message?: string;
  // Distingue "gravou agora" do estado inicial do formulário, que também não
  // tem erros. Sem isto, o formulário festejava sozinho ao abrir a página.
  ok?: boolean;
};

function toRow(input: RevenueEntryInput) {
  return {
    occurredOn: input.occurredOn,
    label: input.label ?? null,
    grossCents: input.grossCents,
    note: input.note ?? null,
  };
}

export async function createRevenueEntry(
  revenueEventId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { orgId } = await requireOrg();
  const parsed = revenueEntrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  const event = await db.query.revenueEvents.findFirst({
    where: and(
      eq(revenueEvents.id, revenueEventId),
      eq(revenueEvents.orgId, orgId),
      isNull(revenueEvents.archivedAt),
    ),
    columns: { id: true },
  });
  if (!event) return { message: "Esta festa já não existe." };

  await db.insert(revenueEntries).values({ orgId, revenueEventId, ...toRow(parsed.data) });

  revalidatePath(`/festas/${revenueEventId}`);
  revalidatePath("/");
  return { ok: true };
}

export async function updateRevenueEntry(
  revenueEventId: string,
  entryId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { orgId } = await requireOrg();
  const parsed = revenueEntrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  const updated = await db
    .update(revenueEntries)
    .set(toRow(parsed.data))
    .where(
      and(
        eq(revenueEntries.id, entryId),
        eq(revenueEntries.revenueEventId, revenueEventId),
        eq(revenueEntries.orgId, orgId),
        isNull(revenueEntries.archivedAt),
      ),
    )
    .returning({ id: revenueEntries.id });
  if (updated.length === 0) return { message: "Este apuro já não existe." };

  revalidatePath(`/festas/${revenueEventId}`);
  revalidatePath("/");
  redirect(`/festas/${revenueEventId}`);
}
