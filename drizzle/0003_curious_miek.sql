ALTER TABLE "revenue_events" ALTER COLUMN "asset_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "revenue_events" ADD COLUMN "island" text;--> statement-breakpoint
ALTER TABLE "revenue_events" ADD COLUMN "contact_name" text;--> statement-breakpoint
ALTER TABLE "revenue_events" ADD COLUMN "contact_info" text;--> statement-breakpoint
ALTER TABLE "revenue_events" ADD COLUMN "conditions" text;