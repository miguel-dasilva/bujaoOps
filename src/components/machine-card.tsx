"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import type { NoteState } from "@/app/maquinas/actions";
import type { AttachmentState } from "@/app/maquinas/attachments-actions";
import type { FormState } from "@/app/festas/[id]/apuros/actions";
import type { MachineCard as MachineCardData } from "@/db/dashboard";
import { formatDate } from "@/lib/date";
import { formatCents } from "@/lib/money";
import { AssetAttachments } from "./asset-attachments";
import { AssetNoteForm } from "./asset-note-form";
import { ButtonLink } from "./button-link";
import { RevenueEntryForm } from "./revenue-entry-form";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

export function MachineCard({
  machine,
  today,
  createEntry,
  updateNote,
  uploadAttachment,
  removeAttachment,
}: {
  machine: MachineCardData;
  today: string;
  createEntry: ((prev: FormState, formData: FormData) => Promise<FormState>) | null;
  updateNote: (prev: NoteState, formData: FormData) => Promise<NoteState>;
  uploadAttachment: (prev: AttachmentState, formData: FormData) => Promise<AttachmentState>;
  removeAttachment: (id: string) => Promise<void>;
}) {
  const { activeEvent } = machine;
  // Uma máquina em festa é uma máquina a dar dinheiro hoje: abre já aberta.
  const [open, setOpen] = useState(activeEvent !== null);

  const paid = machine.balanceCents >= 0;
  const recovered =
    machine.costCents > 0
      ? Math.max(0, Math.min(1, machine.operatingProfitCents / machine.costCents))
      : 1;

  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg">
            <span className="num font-bold">{machine.code}</span>{" "}
            <span className="text-rocha">{machine.name}</span>
          </h2>
          {activeEvent ? (
            <Badge variant="outline" className="border-ganho text-ganho">
              <span className="size-2 rounded-full bg-ganho-vivo" aria-hidden />
              {activeEvent.venueName
                ? `${activeEvent.title}, ${activeEvent.venueName}`
                : activeEvent.title}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-rocha">
              <span className="size-2 rounded-full bg-linha" aria-hidden />
              Parada
            </Badge>
          )}
        </div>

        <div>
          <p className={`num text-4xl font-bold ${paid ? "text-ganho" : "text-perda"}`}>
            {formatCents(machine.balanceCents)}
          </p>
          <p className="text-rocha">
            {paid
              ? "A máquina já se pagou. Daqui para a frente é lucro."
              : `Faltam ${formatCents(-machine.balanceCents)} para a máquina se pagar.`}
          </p>
        </div>

        <div
          className="h-3 overflow-hidden rounded-full bg-nevoa"
          role="progressbar"
          aria-label="Custo de compra recuperado"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(recovered * 100)}
        >
          <div className="h-full bg-ganho-vivo" style={{ width: `${recovered * 100}%` }} />
        </div>

        <dl className="num grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
          <dt className="text-rocha">Apuros</dt>
          <dd className="text-right sm:text-left">{formatCents(machine.grossCents)}</dd>
          <dt className="text-rocha">Despesas</dt>
          <dd className="text-right sm:text-left">−{formatCents(machine.expensesCents)}</dd>
          <dt className="text-rocha">Comissões</dt>
          <dd className="text-right sm:text-left">−{formatCents(machine.feesCents)}</dd>
          <dt className="text-rocha">Custo de compra</dt>
          <dd className="text-right sm:text-left">−{formatCents(machine.costCents)}</dd>
        </dl>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-linha font-bold hover:bg-nevoa">
            {open ? "Fechar" : "Ver detalhes"}
            <ChevronDownIcon
              className={`size-5 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="grid gap-6 pt-6">
            <section>
              <h3 className="mb-2 font-bold">Últimos apuros</h3>
              {machine.recentEntries.length === 0 ? (
                <p className="text-rocha">Ainda não há apuros nesta máquina.</p>
              ) : (
                <ul className="divide-y divide-linha rounded-lg border border-linha">
                  {machine.recentEntries.map((entry) => (
                    <li key={entry.id}>
                      <Link
                        href={`/festas/${entry.revenueEventId}/apuros/${entry.id}/editar`}
                        className="flex min-h-12 items-center gap-3 px-3 hover:bg-nevoa"
                      >
                        <span className="num min-w-16 text-rocha">
                          {formatDate(entry.occurredOn)}
                        </span>
                        <span className="flex-1">{entry.label || "—"}</span>
                        <span className="num font-bold">{formatCents(entry.grossCents)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="mb-2 font-bold">Registar apuro</h3>
              {createEntry && activeEvent ? (
                <RevenueEntryForm
                  action={createEntry}
                  defaults={{ occurredOn: today }}
                  submitLabel="Registar apuro"
                  resetOnSuccess
                  compact
                />
              ) : (
                <div className="grid justify-items-start gap-3 rounded-lg border border-dashed border-linha p-4">
                  <p className="text-rocha">
                    Esta máquina não está em nenhuma festa. Um apuro pertence sempre a uma festa.
                  </p>
                  <ButtonLink href="/festas/nova" variant="outline" size="sm">
                    Registar festa
                  </ButtonLink>
                </div>
              )}
            </section>

            <section>
              <AssetNoteForm action={updateNote} note={machine.note} />
            </section>

            <section>
              <AssetAttachments
                attachments={machine.attachments}
                upload={uploadAttachment}
                remove={removeAttachment}
              />
            </section>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
