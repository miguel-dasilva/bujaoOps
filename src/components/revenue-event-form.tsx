"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/festas/actions";
import { ButtonLink } from "./button-link";
import { TextField, SelectField } from "./form-fields";
import { Button } from "./ui/button";

export type RevenueEventFormDefaults = {
  assetId?: string;
  title?: string;
  venueName?: string;
  startsOn?: string;
  endsOn?: string;
  platformFee?: string;
  notes?: string;
};

export function RevenueEventForm({
  action,
  assets,
  defaults = {},
  submitLabel,
  cancelHref,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  assets: { id: string; code: string; name: string }[];
  defaults?: RevenueEventFormDefaults;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="grid gap-5">
      {state.message && (
        <p role="alert" className="rounded-md border border-perda bg-card p-3 text-perda">
          {state.message}
        </p>
      )}
      <SelectField
        label="Máquina"
        name="assetId"
        defaultValue={defaults.assetId}
        required
        errors={e.assetId}
        options={assets.map((a) => ({ value: a.id, label: `${a.code} — ${a.name}` }))}
      />
      <TextField
        label="Nome da festa"
        name="title"
        defaultValue={defaults.title}
        hint="Por exemplo, Semana do Mar 2026."
        required
        errors={e.title}
      />
      <TextField
        label="Local"
        name="venueName"
        defaultValue={defaults.venueName}
        errors={e.venueName}
      />
      <TextField
        label="Data de início"
        name="startsOn"
        type="date"
        defaultValue={defaults.startsOn}
        required
        errors={e.startsOn}
      />
      <TextField
        label="Data de fim"
        name="endsOn"
        type="date"
        defaultValue={defaults.endsOn}
        errors={e.endsOn}
      />
      <TextField
        label="Comissão do recinto (€)"
        name="platformFee"
        defaultValue={defaults.platformFee}
        inputMode="decimal"
        placeholder="300,00"
        hint="O que fica com o dono do recinto, se houver. Deixa em branco se não houver comissão."
        errors={e.platformFee}
      />
      <TextField label="Notas" name="notes" defaultValue={defaults.notes} errors={e.notes} />
      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "A guardar…" : submitLabel}
        </Button>
        <ButtonLink href={cancelHref} variant="outline">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
