"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/app/festas/[id]/apuros/actions";
import { Button, ButtonLink, Field } from "./ui";

export type RevenueEntryFormDefaults = {
  occurredOn?: string;
  label?: string;
  grossCents?: string;
  note?: string;
};

export function RevenueEntryForm({
  action,
  defaults = {},
  submitLabel,
  cancelHref,
  resetOnSuccess = false,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: RevenueEntryFormDefaults;
  submitLabel: string;
  cancelHref?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};

  useEffect(() => {
    if (resetOnSuccess && !state.errors && !state.message) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-5">
      {state.message && (
        <p role="alert" className="rounded-md border border-perda bg-white p-3 text-perda">
          {state.message}
        </p>
      )}
      <Field
        label="Data"
        name="occurredOn"
        type="date"
        defaultValue={defaults.occurredOn}
        required
        errors={e.occurredOn}
      />
      <Field
        label="Apuro bruto (€)"
        name="grossCents"
        defaultValue={defaults.grossCents}
        inputMode="decimal"
        placeholder="250,00"
        required
        errors={e.grossCents}
      />
      <Field
        label="Nome do dia"
        name="label"
        defaultValue={defaults.label}
        placeholder="dia 1"
        errors={e.label}
      />
      <Field label="Notas" name="note" defaultValue={defaults.note} errors={e.note} />
      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "A guardar…" : submitLabel}
        </Button>
        {cancelHref && (
          <ButtonLink href={cancelHref} variant="quiet">
            Cancelar
          </ButtonLink>
        )}
      </div>
    </form>
  );
}
