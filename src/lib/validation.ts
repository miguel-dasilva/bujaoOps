import { z } from "zod";
import { parseEurosToCents } from "./money";

const optionalEuros = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    const cents = parseEurosToCents(v);
    if (cents === null || cents < 0) {
      ctx.addIssue({ code: "custom", message: "Valor inválido. Escreve, por exemplo, 2615,00" });
      return z.NEVER;
    }
    return cents;
  });

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || null)
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida");

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || undefined);

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
