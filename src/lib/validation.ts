import { z } from "zod";
import { parseEurosToCents } from "./money";

function parseEurosField(v: string, ctx: z.RefinementCtx) {
  const cents = parseEurosToCents(v);
  if (cents === null || cents < 0) {
    ctx.addIssue({ code: "custom", message: "Valor inválido. Escreve, por exemplo, 2615,00" });
    return z.NEVER;
  }
  return cents;
}

const optionalEuros = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => (!v ? null : parseEurosField(v, ctx)));

const requiredEuros = z.string().trim().min(1, "Indica um valor").transform(parseEurosField);

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || null)
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida");

const requiredDate = z
  .string()
  .trim()
  .min(1, "Indica uma data")
  .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida");

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || undefined);

const optionalUuid = z
  .string()
  .trim()
  .transform((v) => (v ? v : undefined))
  .pipe(z.uuid("Valor inválido").optional());

// O mesmo schema serve o servidor agora e o cliente (react-hook-form) mais tarde.
export const assetSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Indica um código, por exemplo BJ-01")
    .max(20, "Máximo de 20 caracteres")
    .transform((v) => v.toUpperCase()),
  name: z.string().trim().min(1, "Indica um nome").max(80, "Máximo de 80 caracteres"),
  acquiredOn: optionalDate,
  acquisitionCost: optionalEuros,
  pricePerGame: optionalEuros,
  serialNumber: optionalText,
});

export type AssetInput = z.output<typeof assetSchema>;

export const revenueEventSchema = z.object({
  assetId: z.uuid("Escolhe uma máquina"),
  title: z
    .string()
    .trim()
    .min(1, "Indica um nome para a festa")
    .max(120, "Máximo de 120 caracteres"),
  venueName: optionalText,
  startsOn: requiredDate,
  endsOn: optionalDate,
  platformFee: optionalEuros,
  notes: optionalText,
});

export type RevenueEventInput = z.output<typeof revenueEventSchema>;

export const revenueEntrySchema = z.object({
  occurredOn: requiredDate,
  label: optionalText,
  grossCents: requiredEuros,
  note: optionalText,
});

export type RevenueEntryInput = z.output<typeof revenueEntrySchema>;

export const expenseSchema = z.object({
  assetId: optionalUuid,
  revenueEventId: optionalUuid,
  category: z.string().trim().min(1, "Indica uma categoria").max(60, "Máximo de 60 caracteres"),
  description: z
    .string()
    .trim()
    .min(1, "Indica uma descrição")
    .max(200, "Máximo de 200 caracteres"),
  amountCents: requiredEuros,
  incurredOn: requiredDate,
});

export type ExpenseInput = z.output<typeof expenseSchema>;
