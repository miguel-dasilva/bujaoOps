import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from ".";
import { assets, revenueEvents } from "./schema";
import { overlaps } from "@/lib/calendar-grid";
import { toEventStatus, type EventStatus } from "@/lib/event-status";

export type CalendarEvent = {
  id: string;
  title: string;
  status: EventStatus;
  island: string | null;
  venueName: string | null;
  startsOn: string;
  endsOn: string | null;
  platformFeeCents: number;
  contactName: string | null;
  contactInfo: string | null;
  conditions: string | null;
  notes: string | null;
  assetId: string | null;
  assetCode: string | null;
  assetName: string | null;
  /** Outra festa confirmada quer a mesma máquina ao mesmo tempo. */
  conflictsWith: string[];
};

export async function getCalendarEvents(orgId: string): Promise<CalendarEvent[]> {
  const rows = await db
    .select({
      id: revenueEvents.id,
      title: revenueEvents.title,
      status: revenueEvents.status,
      island: revenueEvents.island,
      venueName: revenueEvents.venueName,
      startsOn: revenueEvents.startsOn,
      endsOn: revenueEvents.endsOn,
      platformFeeCents: revenueEvents.platformFeeCents,
      contactName: revenueEvents.contactName,
      contactInfo: revenueEvents.contactInfo,
      conditions: revenueEvents.conditions,
      notes: revenueEvents.notes,
      assetId: revenueEvents.assetId,
      assetCode: assets.code,
      assetName: assets.name,
    })
    .from(revenueEvents)
    .leftJoin(assets, eq(revenueEvents.assetId, assets.id))
    .where(and(eq(revenueEvents.orgId, orgId), isNull(revenueEvents.archivedAt)))
    .orderBy(asc(revenueEvents.startsOn));

  const events: CalendarEvent[] = rows.map((r) => ({
    ...r,
    status: toEventStatus(r.status),
    conflictsWith: [],
  }));

  // A máquina não pode estar em duas ilhas ao mesmo tempo. Só conta para
  // festas confirmadas: duas ideias sobrepostas ainda não são um problema.
  const booked = events.filter((e) => e.status === "confirmed" && e.assetId);
  for (let i = 0; i < booked.length; i++) {
    for (let j = i + 1; j < booked.length; j++) {
      const a = booked[i];
      const b = booked[j];
      if (a.assetId === b.assetId && overlaps(a, b)) {
        a.conflictsWith.push(b.title);
        b.conflictsWith.push(a.title);
      }
    }
  }

  return events;
}
