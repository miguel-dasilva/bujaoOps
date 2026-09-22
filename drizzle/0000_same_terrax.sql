CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"type" text DEFAULT 'boxing_machine' NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"acquired_on" date,
	"acquisition_cost_cents" bigint,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assets_org_code_unique" UNIQUE("org_id","code")
);
--> statement-breakpoint
CREATE TABLE "cash_counts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"revenue_entry_id" uuid NOT NULL,
	"denomination_cents" integer NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "cash_counts_entry_denom" UNIQUE("revenue_entry_id","denomination_cents")
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"asset_id" uuid,
	"revenue_event_id" uuid,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"amount_cents" bigint NOT NULL,
	"vat_cents" bigint DEFAULT 0 NOT NULL,
	"incurred_on" date NOT NULL,
	"payment_status" text DEFAULT 'paid' NOT NULL,
	"receipt_url" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"default_currency" char(3) DEFAULT 'EUR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revenue_entries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"revenue_event_id" uuid NOT NULL,
	"occurred_on" date NOT NULL,
	"label" text,
	"gross_cents" bigint NOT NULL,
	"counted_cents" bigint,
	"note" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revenue_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"asset_id" uuid NOT NULL,
	"title" text NOT NULL,
	"venue_name" text,
	"starts_on" date NOT NULL,
	"ends_on" date,
	"platform_fee_cents" bigint DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"notes" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_counts" ADD CONSTRAINT "cash_counts_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_counts" ADD CONSTRAINT "cash_counts_revenue_entry_id_revenue_entries_id_fk" FOREIGN KEY ("revenue_entry_id") REFERENCES "public"."revenue_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_revenue_event_id_revenue_events_id_fk" FOREIGN KEY ("revenue_event_id") REFERENCES "public"."revenue_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_entries" ADD CONSTRAINT "revenue_entries_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_entries" ADD CONSTRAINT "revenue_entries_revenue_event_id_revenue_events_id_fk" FOREIGN KEY ("revenue_event_id") REFERENCES "public"."revenue_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_events" ADD CONSTRAINT "revenue_events_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_events" ADD CONSTRAINT "revenue_events_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expenses_org_asset_incurred" ON "expenses" USING btree ("org_id","asset_id","incurred_on");--> statement-breakpoint
CREATE INDEX "revenue_events_org_asset_start" ON "revenue_events" USING btree ("org_id","asset_id","starts_on");