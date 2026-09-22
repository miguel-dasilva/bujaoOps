"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";
import { expenseSchema, type ExpenseInput } from "@/lib/validation";

export type FormState = {
  errors?: Partial<Record<keyof ExpenseInput, string[]>>;
  message?: string;
};

function toRow(input: ExpenseInput) {
  return {
    assetId: input.assetId ?? null,
    revenueEventId: input.revenueEventId ?? null,
    category: input.category,
    description: input.description,
    amountCents: input.amountCents,
    incurredOn: input.incurredOn,
  };
}

export async function createExpense(_prev: FormState, formData: FormData): Promise<FormState> {
  const { orgId } = await requireOrg();
  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  await db.insert(expenses).values({ orgId, ...toRow(parsed.data) });

  revalidatePath("/despesas");
  revalidatePath("/");
  redirect("/despesas");
}

export async function updateExpense(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { orgId } = await requireOrg();
  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  const updated = await db
    .update(expenses)
    .set(toRow(parsed.data))
    .where(and(eq(expenses.id, id), eq(expenses.orgId, orgId), isNull(expenses.archivedAt)))
    .returning({ id: expenses.id });
  if (updated.length === 0) return { message: "Esta despesa já não existe." };

  revalidatePath("/despesas");
  revalidatePath("/");
  redirect("/despesas");
}
