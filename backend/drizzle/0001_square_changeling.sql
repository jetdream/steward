-- pgvector (ADR-0002): the `vector` type + hnsw index below require it. Idempotent.
CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TABLE "memory_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"kind" text NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"subject_key" text NOT NULL,
	"source" jsonb NOT NULL,
	"assumed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reinforced_at" timestamp,
	"superseded_at" timestamp,
	"superseded_by" text,
	"embedding" vector(1536)
);
--> statement-breakpoint
ALTER TABLE "memory_entry" ADD CONSTRAINT "memory_entry_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "memory_entry_org_idx" ON "memory_entry" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "memory_entry_org_key_idx" ON "memory_entry" USING btree ("org_id","subject_key");--> statement-breakpoint
CREATE INDEX "memory_entry_org_kind_idx" ON "memory_entry" USING btree ("org_id","kind");--> statement-breakpoint
CREATE INDEX "memory_entry_embedding_idx" ON "memory_entry" USING hnsw ("embedding" vector_cosine_ops);