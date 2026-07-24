CREATE TABLE "channel_connection" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"platform" text NOT NULL,
	"external_account_ref" text NOT NULL,
	"credential_cipher" text NOT NULL,
	"token_expires_at" timestamp,
	"status" text DEFAULT 'connected' NOT NULL,
	"status_reason" text DEFAULT '' NOT NULL,
	"connected_at" timestamp DEFAULT now() NOT NULL,
	"last_verified_at" timestamp,
	CONSTRAINT "channel_connection_org_platform_uq" UNIQUE("org_id","platform")
);
--> statement-breakpoint
ALTER TABLE "channel_connection" ADD CONSTRAINT "channel_connection_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "channel_connection_org_idx" ON "channel_connection" USING btree ("org_id");