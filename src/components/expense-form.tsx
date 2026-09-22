"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/despesas/actions";
import { Button, ButtonLink, Field, Select } from "./ui";

const CATEGORY_SUGGESTIONS = [
  "Combustível",
  "Manutenção",
  "Material",
  "Transporte",
  "Seguro",
  "Comissões",
];

export type ExpenseFormDefaults = {
  assetId?: string;
  revenueEventId?: string;
  category?: string;
  description?: string;
  amountCents?: string;
  incurredOn?: string;
};

export function ExpenseForm({
  action,
  assets,
  revenueEvents,
  defaults = {},
  submitLabel,
  cancelHref,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  assets: { id: string; code: string; name: string }[];
  revenueEvents: { id: string; title: string; assetCode: string }[];
  defaults?: ExpenseFormDefaults;
  submitLabel: string;
  cancelHref: string;
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
        label="Descrição"
        name="description"
        defaultValue={defaults.description}
        hint="O que foi. Por exemplo, «Bioma» ou «óleo para o gerador»."
        required
        errors={e.description}
      />
      <Field
        label="Categoria"
        name="category"
        defaultValue={defaults.category}
        list="categoria-sugestoes"
        required
        errors={e.category}
      />
      <datalist id="categoria-sugestoes">
        {CATEGORY_SUGGESTIONS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <Field
        label="Valor (€)"
        name="amountCents"
        defaultValue={defaults.amountCents}
        inputMode="decimal"
        placeholder="26,48"
        required
        errors={e.amountCents}
      />
      <Field
        label="Data"
        name="incurredOn"
        type="date"
        defaultValue={defaults.incurredOn}
        required
        errors={e.incurredOn}
      />
      <Select
        label="Máquina"
        name="assetId"
        defaultValue={defaults.assetId ?? ""}
        hint="Deixa em branco se for uma despesa geral da empresa."
        errors={e.assetId}
        options={[
          { value: "", label: "— nenhuma, despesa geral —" },
          ...assets.map((a) => ({ value: a.id, label: `${a.code} — ${a.name}` })),
        ]}
      />
      <Select
        label="Festa"
        name="revenueEventId"
        defaultValue={defaults.revenueEventId ?? ""}
        hint="Escolhe só se a despesa for específica de uma festa, por exemplo uma comissão de recinto."
        errors={e.revenueEventId}
        options={[
          { value: "", label: "— nenhuma —" },
          ...revenueEvents.map((r) => ({ value: r.id, label: `${r.assetCode} — ${r.title}` })),
        ]}
      />
      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "A guardar…" : submitLabel}
        </Button>
        <ButtonLink href={cancelHref} variant="quiet">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
