"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";
import { assetSchema, type AssetInput } from "@/lib/validation";

export type FormState = {
  errors?: Partial<Record<keyof AssetInput, string[]>>;
  message?: string;
};

function toRow(input: AssetInput) {
  return {
    code: input.code,
    name: input.name,
    acquiredOn: input.acquiredOn,
    acquisitionCostCents: input.acquisitionCost,
    attributes: {
      ...(input.serialNumber && { serialNumber: input.serialNumber }),
      ...(input.pricePerGame != null && { pricePerGameCents: input.pricePerGame }),
    },
  };
}

function isUniqueViolation(e: unknown): boolean {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code === "23505" || err?.cause?.code === "23505";
}

const duplicateCode: FormState = {
  errors: { code: ["Já existe uma máquina com este código"] },
};

export async function createAsset(_prev: FormState, formData: FormData): Promise<FormState> {
  const { orgId } = await requireOrg();
  const parsed = assetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  try {
    await db.insert(assets).values({ orgId, ...toRow(parsed.data) });
  } catch (e) {
    if (isUniqueViolation(e)) return duplicateCode;
    throw e;
  }

  revalidatePath("/maquinas");
  revalidatePath("/");
  redirect("/maquinas");
}

export async function updateAsset(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { orgId } = await requireOrg();
  const parsed = assetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  try {
    const updated = await db
      .update(assets)
      .set(toRow(parsed.data))
      .where(and(eq(assets.id, id), eq(assets.orgId, orgId), isNull(assets.archivedAt)))
      .returning({ id: assets.id });
    if (updated.length === 0) return { message: "Esta máquina já não existe." };
  } catch (e) {
    if (isUniqueViolation(e)) return duplicateCode;
    throw e;
  }

  revalidatePath("/maquinas");
  revalidatePath("/");
  redirect("/maquinas");
}
