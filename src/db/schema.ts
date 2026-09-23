import {
  bigint,
  char,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

// Princípios (secção 4 do plano):
// dinheiro em bigint de cêntimos · org_id em tudo · soft delete no que é
// financeiro · timestamptz · IDs UUIDv7 gerados na aplicação.
// mode "number" é seguro até ~90 biliões de euros em cêntimos.

const id = () =>
  uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7());
const orgId = () =>
  text("org_id")
    .notNull()
    .references(() => organizations.id);
const cents = (name: string) => bigint(name, { mode: "number" });
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const archivedAt = () => timestamp("archived_at", { withTimezone: true });

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(), // org_... vindo do Clerk
  name: text("name").notNull(),
  defaultCurrency: char("default_currency", { length: 3 })
    .notNull()
    .default("EUR"),
  createdAt: createdAt(),
});

export type AssetAttributes = {
  serialNumber?: string;
  pricePerGameCents?: number;
};

export const assets = pgTable(
  "assets",
  {
    id: id(),
    orgId: orgId(),
    type: text("type").notNull().default("boxing_machine"),
    code: text("code").notNull(), // 'BJ-01'
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    description: text("description"),
    acquiredOn: date("acquired_on", { mode: "string" }),
    acquisitionCostCents: cents("acquisition_cost_cents"),
    attributes: jsonb("attributes")
      .$type<AssetAttributes>()
      .notNull()
      .default({}),
    archivedAt: archivedAt(),
    createdAt: createdAt(),
  },
  (t) => [unique("assets_org_code_unique").on(t.orgId, t.code)],
);

export const revenueEvents = pgTable(
  "revenue_events",
  {
    id: id(),
    orgId: orgId(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id),
    title: text("title").notNull(), // 'Semana do Mar 2026'
    venueName: text("venue_name"),
    startsOn: date("starts_on", { mode: "string" }).notNull(),
    endsOn: date("ends_on", { mode: "string" }),
    platformFeeCents: cents("platform_fee_cents").notNull().default(0),
    status: text("status").notNull().default("confirmed"),
    notes: text("notes"),
    archivedAt: archivedAt(),
    createdAt: createdAt(),
  },
  (t) => [index("revenue_events_org_asset_start").on(t.orgId, t.assetId, t.startsOn)],
);

export const revenueEntries = pgTable("revenue_entries", {
  id: id(),
  orgId: orgId(),
  revenueEventId: uuid("revenue_event_id")
    .notNull()
    .references(() => revenueEvents.id),
  occurredOn: date("occurred_on", { mode: "string" }).notNull(),
  label: text("label"), // 'dia 1'
  grossCents: cents("gross_cents").notNull(),
  countedCents: cents("counted_cents"), // resultado do fecho de caixa
  note: text("note"),
  archivedAt: archivedAt(),
  createdAt: createdAt(),
});

export const cashCounts = pgTable(
  "cash_counts",
  {
    id: id(),
    orgId: orgId(),
    revenueEntryId: uuid("revenue_entry_id")
      .notNull()
      .references(() => revenueEntries.id),
    denominationCents: integer("denomination_cents").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (t) => [unique("cash_counts_entry_denom").on(t.revenueEntryId, t.denominationCents)],
);

export const expenses = pgTable(
  "expenses",
  {
    id: id(),
    orgId: orgId(),
    assetId: uuid("asset_id").references(() => assets.id), // null = geral
    revenueEventId: uuid("revenue_event_id").references(() => revenueEvents.id),
    category: text("category").notNull(),
    description: text("description").notNull(),
    amountCents: cents("amount_cents").notNull(),
    vatCents: cents("vat_cents").notNull().default(0),
    incurredOn: date("incurred_on", { mode: "string" }).notNull(),
    paymentStatus: text("payment_status").notNull().default("paid"),
    receiptUrl: text("receipt_url"),
    archivedAt: archivedAt(),
    createdAt: createdAt(),
  },
  (t) => [index("expenses_org_asset_incurred").on(t.orgId, t.assetId, t.incurredOn)],
);

export type Asset = typeof assets.$inferSelect;
