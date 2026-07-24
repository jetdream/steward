CREATE TABLE "channel_variant" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"content_item_id" text NOT NULL,
	"platform" text NOT NULL,
	"body" text NOT NULL,
	"fit_verdict" text NOT NULL,
	"fit_reason" text DEFAULT '' NOT NULL,
	"overridden" boolean DEFAULT false NOT NULL,
	"delivery_state" text DEFAULT 'pending' NOT NULL,
	"scheduled_for" timestamp,
	"published_url" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "channel_variant" ADD CONSTRAINT "channel_variant_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_variant" ADD CONSTRAINT "channel_variant_content_item_id_content_item_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "channel_variant_org_idx" ON "channel_variant" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "channel_variant_item_idx" ON "channel_variant" USING btree ("content_item_id");