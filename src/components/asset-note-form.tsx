"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { NoteState } from "@/app/maquinas/actions";
import { TextareaField } from "./form-fields";
import { Button } from "./ui/button";

export function AssetNoteForm({
  action,
  note,
}: {
  action: (prev: NoteState, formData: FormData) => Promise<NoteState>;
  note: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state.ok) toast.success("Nota guardada");
    else if (state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="grid gap-3">
      <TextareaField
        label="Nota"
        name="note"
        defaultValue={note ?? ""}
        placeholder="Sensor do lado direito a falhar, levar cabo extra…"
        rows={3}
      />
      <Button type="submit" variant="outline" size="sm" disabled={pending} className="justify-self-start">
        {pending ? "A guardar…" : "Guardar nota"}
      </Button>
    </form>
  );
}
