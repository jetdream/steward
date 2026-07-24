CREATE TABLE "edit_diff" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"content_item_id" text NOT NULL,
	"variant_id" text,
	"before_text" text NOT NULL,
	"after_text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "edit_diff" ADD CONSTRAINT "edit_diff_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edit_diff" ADD CONSTRAINT "edit_diff_content_item_id_content_item_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "edit_diff_org_idx" ON "edit_diff" USING btree ("org_id");