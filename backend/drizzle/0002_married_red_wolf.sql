CREATE TABLE "model_call" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"skill" text NOT NULL,
	"prompt_version" text,
	"model" text NOT NULL,
	"operation" text NOT NULL,
	"tokens_in" integer DEFAULT 0 NOT NULL,
	"tokens_out" integer DEFAULT 0 NOT NULL,
	"cost_usd" double precision DEFAULT 0 NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"outcome" text NOT NULL,
	"guardrail_verdicts" jsonb,
	"run_id" text,
	"step_index" integer
);
--> statement-breakpoint
ALTER TABLE "model_call" ADD CONSTRAINT "model_call_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "model_call_org_idx" ON "model_call" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "model_call_org_created_idx" ON "model_call" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "model_call_run_idx" ON "model_call" USING btree ("run_id");