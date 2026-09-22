"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { revenueEvents } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";
import { revenueEventSchema, type RevenueEventInput } from "@/lib/validation";

export type FormState = {
  errors?: Partial<Record<keyof RevenueEventInput, string[]>>;
  message?: string;
};

function toRow(input: RevenueEventInput) {
  return {
    assetId: input.assetId,
    title: input.title,
    venueName: input.venueName ?? null,
    startsOn: input.startsOn,
    endsOn: input.endsOn,
    platformFeeCents: input.platformFee ?? 0,
    notes: input.notes ?? null,
  };
}

export async function createRevenueEvent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { orgId } = await requireOrg();
  const parsed = revenueEventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  const [row] = await db
    .insert(revenueEvents)
    .values({ orgId, ...toRow(parsed.data) })
    .returning({ id: revenueEvents.id });

  revalidatePath("/festas");
  redirect(`/festas/${row.id}`);
}

export async function updateRevenueEvent(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { orgId } = await requireOrg();
  const parsed = revenueEventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  const updated = await db
    .update(revenueEvents)
    .set(toRow(parsed.data))
    .where(
      and(eq(revenueEvents.id, id), eq(revenueEvents.orgId, orgId), isNull(revenueEvents.archivedAt)),
    )
    .returning({ id: revenueEvents.id });
  if (updated.length === 0) return { message: "Esta festa já não existe." };

  revalidatePath("/festas");
  revalidatePath(`/festas/${id}`);
  redirect(`/festas/${id}`);
}
