"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { FormState } from "@/app/festas/[id]/apuros/actions";
import { ButtonLink } from "./button-link";
import { TextField } from "./form-fields";
import { Button } from "./ui/button";

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
  compact = false,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: RevenueEntryFormDefaults;
  submitLabel: string;
  cancelHref?: string;
  resetOnSuccess?: boolean;
  /** Só data e valor. É a versão usada no terreno, onde cada campo custa tempo. */
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};

  useEffect(() => {
    if (!state.ok) return;
    toast.success("Apuro registado");
    if (resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-5">
      {state.message && (
        <p role="alert" className="rounded-md border border-perda bg-card p-3 text-perda">
          {state.message}
        </p>
      )}
      <TextField
        label="Data"
        name="occurredOn"
        type="date"
        defaultValue={defaults.occurredOn}
        required
        errors={e.occurredOn}
      />
      <TextField
        label="Apuro bruto (€)"
        name="grossCents"
        defaultValue={defaults.grossCents}
        inputMode="decimal"
        placeholder="250,00"
        required
        errors={e.grossCents}
      />
      {!compact && (
        <>
          <TextField
            label="Nome do dia"
            name="label"
            defaultValue={defaults.label}
            placeholder="dia 1"
            errors={e.label}
          />
          <TextField label="Notas" name="note" defaultValue={defaults.note} errors={e.note} />
        </>
      )}
      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "A guardar…" : submitLabel}
        </Button>
        {cancelHref && (
          <ButtonLink href={cancelHref} variant="outline">
            Cancelar
          </ButtonLink>
        )}
      </div>
    </form>
  );
}
