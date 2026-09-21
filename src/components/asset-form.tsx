"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/maquinas/actions";
import { Button, ButtonLink, Field } from "./ui";

export type AssetFormDefaults = {
  code?: string;
  name?: string;
  acquiredOn?: string;
  acquisitionCost?: string;
  pricePerGame?: string;
  serialNumber?: string;
};

export function AssetForm({
  action,
  defaults = {},
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: AssetFormDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="grid gap-5">
      {state.message && (
        <p role="alert" className="rounded-md border border-perda bg-white p-3 text-perda">
          {state.message}
        </p>
      )}
      <Field
        label="Código"
        name="code"
        defaultValue={defaults.code}
        hint="Curto e único. Aparece nas listas, por exemplo BJ-01."
        autoCapitalize="characters"
        required
        errors={e.code}
      />
      <Field label="Nome" name="name" defaultValue={defaults.name} required errors={e.name} />
      <Field
        label="Custo de compra (€)"
        name="acquisitionCost"
        defaultValue={defaults.acquisitionCost}
        inputMode="decimal"
        placeholder="2615,00"
        hint="É o valor que o payback tem de recuperar."
        errors={e.acquisitionCost}
      />
      <Field
        label="Data de compra"
        name="acquiredOn"
        type="date"
        defaultValue={defaults.acquiredOn}
        errors={e.acquiredOn}
      />
      <Field
        label="Preço por jogo (€)"
        name="pricePerGame"
        defaultValue={defaults.pricePerGame}
        inputMode="decimal"
        placeholder="1,00"
        errors={e.pricePerGame}
      />
      <Field
        label="Número de série"
        name="serialNumber"
        defaultValue={defaults.serialNumber}
        errors={e.serialNumber}
      />
      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "A guardar…" : submitLabel}
        </Button>
        <ButtonLink href="/maquinas" variant="quiet">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
