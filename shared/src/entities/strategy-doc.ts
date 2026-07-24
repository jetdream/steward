/**
 * StrategyDoc (DM-3) entity type — derived from the Drizzle table (DEC-39), never
 * re-declared. The persisted five-section contract minus (c), which is a live
 * derived view (DEC-22). Client-safe (type-only; no drizzle at runtime).
 */
import type { InferSelectModel } from "drizzle-orm";
import type { strategyDoc } from "../db/strategy.js";

export type StrategyDoc = InferSelectModel<typeof strategyDoc>;
export type { ChannelInstructions } from "../db/strategy.js";
