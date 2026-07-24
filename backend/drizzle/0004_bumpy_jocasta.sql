CREATE TABLE "topic" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"topic_key" text NOT NULL,
	"description" text NOT NULL,
	"why_it_fits" text NOT NULL,
	"evidence" jsonb NOT NULL,
	"provenance" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"superseded_at" timestamp,
	"superseded_by" text
);
--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "topic_org_status_idx" ON "topic" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "topic_org_key_idx" ON "topic" USING btree ("org_id","topic_key");