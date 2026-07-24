CREATE TABLE "external_item" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"source" text NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"relevance_rationale" text NOT NULL,
	"topic_id" text,
	"disposition" text,
	"event_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "external_item" ADD CONSTRAINT "external_item_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "external_item_org_idx" ON "external_item" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "external_item_org_disposition_idx" ON "external_item" USING btree ("org_id","disposition");