CREATE TABLE "media_asset" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"blob_key" text NOT NULL,
	"url" text NOT NULL,
	"content_type" text NOT NULL,
	"provenance" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_item" ADD COLUMN "media_asset_id" text;--> statement-breakpoint
ALTER TABLE "media_asset" ADD CONSTRAINT "media_asset_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_asset_org_idx" ON "media_asset" USING btree ("org_id");--> statement-breakpoint
ALTER TABLE "content_item" ADD CONSTRAINT "content_item_media_asset_id_media_asset_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_asset"("id") ON DELETE set null ON UPDATE no action;