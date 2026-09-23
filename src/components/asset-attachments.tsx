"use client";

import { useActionState, useEffect, useRef } from "react";
import { PaperclipIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import type { AttachmentState } from "@/app/maquinas/attachments-actions";
import type { Attachment } from "@/db/dashboard";
import { Button } from "./ui/button";

function formatSize(bytes: number | null): string {
  if (bytes == null) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1).replace(".", ",")} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function AssetAttachments({
  attachments,
  upload,
  remove,
}: {
  attachments: Attachment[];
  upload: (prev: AttachmentState, formData: FormData) => Promise<AttachmentState>;
  remove: (id: string) => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(upload, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Ficheiro anexado");
      formRef.current?.reset();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="grid gap-3">
      <h3 className="font-bold">Anexos</h3>

      {attachments.length > 0 && (
        <ul className="divide-y divide-linha rounded-lg border border-linha">
          {attachments.map((a) => (
            <li key={a.id} className="flex min-h-12 items-center gap-2 pr-2 pl-3">
              <PaperclipIcon className="size-4 shrink-0 text-rocha" aria-hidden />
              <a
                href={a.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate underline underline-offset-4"
              >
                {a.fileName}
              </a>
              <span className="num shrink-0 text-sm text-rocha">{formatSize(a.sizeBytes)}</span>
              <form action={remove.bind(null, a.id)}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover ${a.fileName}`}
                >
                  <XIcon />
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="ficheiro"
          required
          className="min-h-12 flex-1 rounded-lg border border-linha bg-card px-3 py-2 file:mr-3 file:min-h-8 file:rounded-md file:border-0 file:bg-nevoa file:px-3 file:font-bold file:text-basalto"
        />
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? "A enviar…" : "Anexar"}
        </Button>
      </form>
    </div>
  );
}
