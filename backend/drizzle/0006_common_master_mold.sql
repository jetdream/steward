CREATE TABLE "strategy_doc" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"version" integer NOT NULL,
	"section_a" text DEFAULT '' NOT NULL,
	"section_b" text DEFAULT '' NOT NULL,
	"section_d" text DEFAULT '' NOT NULL,
	"section_e" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "strategy_doc_org_version_uq" UNIQUE("org_id","version")
);
--> statement-breakpoint
ALTER TABLE "strategy_doc" ADD CONSTRAINT "strategy_doc_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "strategy_doc_org_idx" ON "strategy_doc" USING btree ("org_id");