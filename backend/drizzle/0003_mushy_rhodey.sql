CREATE TABLE "content_item" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"editorial_state" text DEFAULT 'draft' NOT NULL,
	"content_type" text NOT NULL,
	"subject" text NOT NULL,
	"designation" text DEFAULT 'none' NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"reason_line" text NOT NULL,
	"val_outcome" text NOT NULL,
	"escalated" boolean DEFAULT false NOT NULL,
	"val_summary" text DEFAULT '' NOT NULL,
	"is_external" boolean DEFAULT false NOT NULL,
	"qa_status" text DEFAULT 'n/a' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_item" ADD CONSTRAINT "content_item_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_item_org_idx" ON "content_item" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "content_item_org_state_idx" ON "content_item" USING btree ("org_id","editorial_state");