CREATE TABLE "publish_control" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"scope" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "publish_control_org_scope_uq" UNIQUE("org_id","scope")
);
--> statement-breakpoint
CREATE TABLE "trust_level" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"category" text NOT NULL,
	"level" text DEFAULT 'TL0' NOT NULL,
	"veto_model" text DEFAULT 'publish-then-takedown' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trust_level_org_category_uq" UNIQUE("org_id","category")
);
--> statement-breakpoint
ALTER TABLE "publish_control" ADD CONSTRAINT "publish_control_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_level" ADD CONSTRAINT "trust_level_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "publish_control_org_idx" ON "publish_control" USING btree ("org_id");