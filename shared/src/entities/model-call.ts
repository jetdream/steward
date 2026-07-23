/**
 * DM-19 ModelCall — the cross-boundary entity TYPE, DERIVED from the single
 * source (DEC-39): the `model_call` table. Type-only import, no runtime code.
 * Observability/cost record (PIPE-5); read by ops/KPI surfaces (OPS-1, ADM-6).
 */
import type { InferSelectModel } from "drizzle-orm";
import type { modelCall } from "../db/model-call.js";

/** A ModelCall row as stored (per-call LLM/search observability + cost). */
export type ModelCall = InferSelectModel<typeof modelCall>;
