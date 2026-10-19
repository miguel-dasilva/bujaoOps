"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/app/festas/actions";
import {
  EVENT_STATUSES,
  EVENT_STATUS_HINTS,
  EVENT_STATUS_LABELS,
  toEventStatus,
} from "@/lib/event-status";
import { ButtonLink } from "./button-link";
import { TextField, SelectField, TextareaField } from "./form-fields";
import { Button } from "./ui/button";

const ILHAS = [
  "São Miguel",
  "Terceira",
  "Faial",
  "Pico",
  "São Jorge",
  "Graciosa",
  "Santa Maria",
  "Flores",
  "Corvo",
];

export type RevenueEventFormDefaults = {
  assetId?: string;
  status?: string;
  title?: string;
  island?: string;
  venueName?: string;
  startsOn?: string;
  endsOn?: string;
  platformFee?: string;
  contactName?: string;
  contactInfo?: string;
  conditions?: string;
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
  const [status, setStatus] = useState(toEventStatus(defaults.status));
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="grid gap-5">
      {state.message && (
        <p role="alert" className="rounded-md border border-perda bg-card p-3 text-perda">
          {state.message}
        </p>
      )}
      <SelectField
        label="Estado"
        name="status"
        value={status}
        onChange={(ev) => setStatus(toEventStatus(ev.target.value))}
        hint={EVENT_STATUS_HINTS[status]}
        errors={e.status}
        options={EVENT_STATUSES.map((s) => ({ value: s, label: EVENT_STATUS_LABELS[s] }))}
      />
      <TextField
        label="Nome da festa"
        name="title"
        defaultValue={defaults.title}
        hint="Por exemplo, Semana do Mar 2027."
        required
        errors={e.title}
      />
      <TextField
        label="Ilha"
        name="island"
        defaultValue={defaults.island}
        list="ilhas-sugestoes"
        errors={e.island}
      />
      <datalist id="ilhas-sugestoes">
        {ILHAS.map((i) => (
          <option key={i} value={i} />
        ))}
      </datalist>
      <TextField
        label="Local"
        name="venueName"
        defaultValue={defaults.venueName}
        hint="O sítio da festa dentro da ilha. Por exemplo, Madalena."
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
      <SelectField
        label="Máquina"
        name="assetId"
        defaultValue={defaults.assetId ?? ""}
        hint={
          status === "confirmed"
            ? "Uma festa confirmada tem de ter máquina alocada."
            : "Só é preciso quando a festa estiver confirmada."
        }
        errors={e.assetId}
        options={[
          { value: "", label: "— ainda nenhuma —" },
          ...assets.map((a) => ({ value: a.id, label: `${a.code} — ${a.name}` })),
        ]}
      />
      <TextField
        label="Quem organiza"
        name="contactName"
        defaultValue={defaults.contactName}
        errors={e.contactName}
      />
      <TextField
        label="Contacto"
        name="contactInfo"
        defaultValue={defaults.contactInfo}
        hint="Telefone ou email, como preferires."
        errors={e.contactInfo}
      />
      <TextareaField
        label="Condições"
        name="conditions"
        defaultValue={defaults.conditions}
        hint="O que ficou combinado: preço do espaço, horários, eletricidade, exclusividade."
        rows={3}
        errors={e.conditions}
      />
      <TextField
        label="Comissão do recinto (€)"
        name="platformFee"
        defaultValue={defaults.platformFee}
        inputMode="decimal"
        placeholder="300,00"
        hint="O que fica com o dono do recinto, se houver."
        errors={e.platformFee}
      />
      <TextareaField
        label="Notas"
        name="notes"
        defaultValue={defaults.notes}
        hint="O diário do processo: quando ligaste, o que disseram, quando voltar a tentar."
        rows={3}
        errors={e.notes}
      />
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
