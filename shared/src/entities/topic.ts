/**
 * DM-13 Topic — the cross-boundary entity TYPE, DERIVED from the single source
 * (DEC-39): the `topic` table. Type-only import (no drizzle in the client
 * bundle). Plus the `EvidencePointer` value object — the TOPS-1 grounding guard's
 * resolvable pointer into Memory (and, later, the Radar).
 */

import type { InferSelectModel } from "drizzle-orm";
import { z } from "zod";
import type { topic } from "../db/topic.js";

/**
 * A resolvable evidence pointer (TOPS-1): the Memory entries a topic is grounded
 * in. A topic with an EMPTY pointer is never persisted — the deterministic
 * grounding guard (LRN-20). Radar item ids join here when EXT lands.
 */
export const EvidencePointer = z.object({
  memoryEntryIds: z.array(z.string()).default([]),
});
export type EvidencePointer = z.infer<typeof EvidencePointer>;

/** A Topic row exactly as stored (a content topic / editorial theme). */
export type Topic = InferSelectModel<typeof topic>;
