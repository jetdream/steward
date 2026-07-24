/**
 * DM-19 ModelCall — the per-call LLM/search observability + cost record (PIPE-5,
 * ADR-0010). The single source of its shape (DEC-39). One row per LLM/search
 * port invocation, owned by Org (DM-1). A DM-17 ActivityEvent may aggregate
 * several ModelCall rows; this is the finer, cost-bearing grain PIPE-1's
 * "everything logged … for ops QA (OPS-1) and cost tracking" needs.
 *
 * Deliberately holds NO raw prompt/response CONTENT (SEC-4): only metadata +
 * usage + verdicts. If content logging is ever added it is org-scoped and
 * purged on BIL-2, never in the in-repo eval datasets (ADR-0010 split).
 */
import { relations } from "drizzle-orm";
import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { modelCallOperations, modelCallOutcomes } from "../enums.js";
import { organization } from "./auth-schema.js";

/** The guardrail-chain verdicts a generating call produced (PIPE-2), when any. */
export interface GuardrailVerdicts {
  /** pass | regenerate | escalate — the VAL outcome, if this call ran the chain. */
  outcome?: "pass" | "regenerate" | "escalate";
  /** Which checks fired (e.g. "GR-3", "GR-8"), for audit. */
  fired?: string[];
}

export const modelCall = pgTable(
  "model_call",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    /** The ARC-27 Skill id that made the call (e.g. "extract-memory", "embed-memory"). */
    skill: text("skill").notNull(),
    /** The versioned prompt template, when the call used one (null for embeddings). */
    promptVersion: text("prompt_version"),
    /** The model id (e.g. "gemini-2.5-flash", "gemini-embedding-001", or the dev-stub label). */
    model: text("model").notNull(),
    operation: text("operation", { enum: modelCallOperations }).notNull(),
    tokensIn: integer("tokens_in").notNull().default(0),
    tokensOut: integer("tokens_out").notNull().default(0),
    /** Computed cost in USD (PIPE-5 COGS); estimated when the adapter yields no exact usage. */
    costUsd: doublePrecision("cost_usd").notNull().default(0),
    latencyMs: integer("latency_ms").notNull().default(0),
    /** ok | error (PIPE-6 — a failed call after retries is still logged). */
    outcome: text("outcome", { enum: modelCallOutcomes }).notNull(),
    /** The PIPE-2 guardrail verdicts, when this call ran the VAL chain (else null). */
    guardrailVerdicts: jsonb("guardrail_verdicts").$type<GuardrailVerdicts>(),
    /** Trajectory ref for a bounded multi-step Skill run (ADR-0010 trajectory scoring). */
    runId: text("run_id"),
    stepIndex: integer("step_index"),
  },
  (table) => [
    index("model_call_org_idx").on(table.orgId),
    index("model_call_org_created_idx").on(table.orgId, table.createdAt),
    index("model_call_run_idx").on(table.runId),
  ],
);

/** ModelCall ⇒ Org (DM-1). */
export const modelCallRelations = relations(modelCall, ({ one }) => ({
  org: one(organization, { fields: [modelCall.orgId], references: [organization.id] }),
}));
