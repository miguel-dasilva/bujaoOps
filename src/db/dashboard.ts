import { sql } from "drizzle-orm";
import { db } from ".";
import { getPayback, type PaybackRow } from "./payback";
import { todayInAzores } from "@/lib/date";

export type ActiveEvent = {
  id: string;
  title: string;
  venueName: string | null;
  startsOn: string;
  endsOn: string | null;
};

export type RecentEntry = {
  id: string;
  revenueEventId: string;
  occurredOn: string;
  label: string | null;
  grossCents: number;
};

export type Attachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  sizeBytes: number | null;
};

export type MachineCard = PaybackRow & {
  note: string | null;
  activeEvent: ActiveEvent | null;
  recentEntries: RecentEntry[];
  attachments: Attachment[];
};

const rows = <T>(r: { rows: unknown[] }) => r.rows as T[];

// Uma festa "a decorrer" é a que apanha o dia de hoje. É isto que responde a
// "onde está a máquina" sem precisar de locais como entidade própria.
export async function getMachineCards(orgId: string): Promise<MachineCard[]> {
  const today = todayInAzores();

  const [payback, notes, active, recent, files] = await Promise.all([
    getPayback(orgId),
    db.execute(sql`
      select id, description
      from assets
      where org_id = ${orgId} and archived_at is null
    `),
    db.execute(sql`
      select asset_id, id, title, venue_name, starts_on, ends_on
      from revenue_events
      where org_id = ${orgId} and archived_at is null
        and starts_on <= ${today}
        and coalesce(ends_on, starts_on) >= ${today}
      order by starts_on desc
    `),
    db.execute(sql`
      select id, revenue_event_id, asset_id, occurred_on, label, gross_cents
      from (
        select e.id, e.revenue_event_id, ev.asset_id, e.occurred_on, e.label, e.gross_cents,
               row_number() over (
                 partition by ev.asset_id
                 order by e.occurred_on desc, e.created_at desc
               ) as rn
        from revenue_entries e
        join revenue_events ev on ev.id = e.revenue_event_id
        where e.org_id = ${orgId}
          and e.archived_at is null and ev.archived_at is null
      ) t
      where rn <= 5
      order by occurred_on desc
    `),
    db.execute(sql`
      select id, asset_id, file_name, file_url, size_bytes
      from asset_attachments
      where org_id = ${orgId} and archived_at is null
      order by created_at desc
    `),
  ]);

  const noteByAsset = new Map(
    rows<{ id: string; description: string | null }>(notes).map((r) => [r.id, r.description]),
  );

  const activeByAsset = new Map<string, ActiveEvent>();
  for (const r of rows<Record<string, string | null>>(active)) {
    // A primeira ganha: se duas festas se sobrepuserem, fica a que começou depois.
    if (!activeByAsset.has(r.asset_id!)) {
      activeByAsset.set(r.asset_id!, {
        id: r.id!,
        title: r.title!,
        venueName: r.venue_name,
        startsOn: r.starts_on!,
        endsOn: r.ends_on,
      });
    }
  }

  const entriesByAsset = new Map<string, RecentEntry[]>();
  for (const r of rows<Record<string, unknown>>(recent)) {
    const assetId = String(r.asset_id);
    const list = entriesByAsset.get(assetId) ?? [];
    list.push({
      id: String(r.id),
      revenueEventId: String(r.revenue_event_id),
      occurredOn: String(r.occurred_on),
      label: r.label == null ? null : String(r.label),
      grossCents: Number(r.gross_cents),
    });
    entriesByAsset.set(assetId, list);
  }

  const filesByAsset = new Map<string, Attachment[]>();
  for (const r of rows<Record<string, unknown>>(files)) {
    const assetId = String(r.asset_id);
    const list = filesByAsset.get(assetId) ?? [];
    list.push({
      id: String(r.id),
      fileName: String(r.file_name),
      fileUrl: String(r.file_url),
      sizeBytes: r.size_bytes == null ? null : Number(r.size_bytes),
    });
    filesByAsset.set(assetId, list);
  }

  return payback.map((p) => ({
    ...p,
    note: noteByAsset.get(p.id) ?? null,
    activeEvent: activeByAsset.get(p.id) ?? null,
    recentEntries: entriesByAsset.get(p.id) ?? [],
    attachments: filesByAsset.get(p.id) ?? [],
  }));
}
