/**
 * DM-19 ModelCall writer (PIPE-5). Persists one per-call observability + cost
 * record. Best-effort by contract: callers wrap this so a logging failure never
 * breaks the underlying LLM call.
 */
import { randomUUID } from "node:crypto";
import type { ModelCallOperation, ModelCallOutcome } from "@shared";
import type { GuardrailVerdicts } from "@shared/db/model-call.js";
import { modelCall } from "@shared/db/schema.js";
import type { Database } from "../db/client.js";

/** The fields a caller supplies for a ModelCall row (id + createdAt are generated). */
export interface ModelCallInput {
  orgId: string;
  skill: string;
  model: string;
  operation: ModelCallOperation;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
  outcome: ModelCallOutcome;
  promptVersion?: string | undefined;
  guardrailVerdicts?: GuardrailVerdicts | undefined;
  runId?: string | undefined;
  stepIndex?: number | undefined;
}

/** Insert one ModelCall row. */
export async function recordModelCall(db: Database, input: ModelCallInput): Promise<void> {
  await db.insert(modelCall).values({
    id: randomUUID(),
    orgId: input.orgId,
    skill: input.skill,
    model: input.model,
    operation: input.operation,
    tokensIn: input.tokensIn,
    tokensOut: input.tokensOut,
    costUsd: input.costUsd,
    latencyMs: input.latencyMs,
    outcome: input.outcome,
    promptVersion: input.promptVersion ?? null,
    guardrailVerdicts: input.guardrailVerdicts ?? null,
    runId: input.runId ?? null,
    stepIndex: input.stepIndex ?? null,
  });
}
