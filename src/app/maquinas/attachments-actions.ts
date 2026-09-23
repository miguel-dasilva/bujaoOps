"use server";

import { del, put } from "@vercel/blob";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { assetAttachments, assets } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";

export type AttachmentState = { message?: string; ok?: boolean };

// Tudo passa por Server Actions, sem route handler. O teto real é o limite de
// corpo da plataforma (~4,5 MB), por isso validamos antes para dar uma
// mensagem em vez de deixar o envio rebentar sem explicação.
// Não é exportado: um ficheiro "use server" só pode exportar funções async.
const MAX_BYTES = 4 * 1024 * 1024;

export async function uploadAttachment(
  assetId: string,
  _prev: AttachmentState,
  formData: FormData,
): Promise<AttachmentState> {
  const { orgId } = await requireOrg();

  const file = formData.get("ficheiro");
  if (!(file instanceof File) || file.size === 0) {
    return { message: "Escolhe um ficheiro." };
  }
  if (file.size > MAX_BYTES) {
    return { message: "Ficheiro demasiado grande. O limite é 4 MB." };
  }

  const asset = await db.query.assets.findFirst({
    where: and(eq(assets.id, assetId), eq(assets.orgId, orgId), isNull(assets.archivedAt)),
    columns: { id: true },
  });
  if (!asset) return { message: "Esta máquina já não existe." };

  const { url } = await put(`${orgId}/${assetId}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  await db.insert(assetAttachments).values({
    orgId,
    assetId,
    fileName: file.name,
    fileUrl: url,
    contentType: file.type || null,
    sizeBytes: file.size,
  });

  revalidatePath("/");
  return { ok: true };
}

export async function removeAttachment(id: string): Promise<void> {
  const { orgId } = await requireOrg();

  const [removed] = await db
    .update(assetAttachments)
    .set({ archivedAt: new Date() })
    .where(
      and(
        eq(assetAttachments.id, id),
        eq(assetAttachments.orgId, orgId),
        isNull(assetAttachments.archivedAt),
      ),
    )
    .returning({ fileUrl: assetAttachments.fileUrl });

  // Sem isto o ficheiro fica no Blob a contar para a quota para sempre.
  if (removed) await del(removed.fileUrl);

  revalidatePath("/");
}
