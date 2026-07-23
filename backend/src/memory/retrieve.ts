/**
 * The Memory RETRIEVE path (MEMS-4) — grounding, not invention. Returns a
 * grounded context package for a slot:
 * - GROUNDING: embedding-retrieved active fact/story/person/program/event
 *   (pgvector cosine over the DM-2 embedding), the material generation draws on.
 * - OVERLAY: the FULL active styleRule + taboo set for the org, fetched by an
 *   indexed query and NEVER similarity-gated (MEMS-3/MEMS-4) — a low-similarity
 *   rule must never be missed. The caller (GEN) routes this to the VAL gate.
 * - `thin`: brand-new / cause-level Memory signals thinness so callers lean on
 *   the interview (INT) rather than inventing facts. Empty Memory returns no
 *   fabricated facts.
 *
 * The VAL-stage ENFORCEMENT of the overlay (MEMS-3) lives with its consumer
 * (PIPE-2 / GEN), not here — this path only ASSEMBLES + returns the overlay.
 */
import type { MemoryEntry, OrgId } from "@shared";
import { memoryEntry } from "@shared/db/schema.js";
import { and, cosineDistance, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { withObsContext } from "../observability/context.js";
import type { MemoryDeps } from "./write.js";

/** Default number of grounding neighbours returned for a slot. */
const DEFAULT_TOP_K = 8;
/** Below this many grounding entries an org's Memory is treated as thin (ONBS-6). */
const THIN_THRESHOLD = 2;

const GROUNDING_KINDS = ["fact", "story", "person", "program", "event"] as const;
const OVERLAY_KINDS = ["styleRule", "taboo"] as const;

/** The grounded context package retrieveContext returns (MEMS-4). */
export interface GroundedContext {
  /** Embedding-retrieved grounding entries relevant to the slot (may be empty). */
  grounding: MemoryEntry[];
  /** The full active rule/taboo overlay — taboos first (MEMS-2 precedence). */
  overlay: { styleRules: MemoryEntry[]; taboos: MemoryEntry[] };
  /** True when grounding Memory is empty/cause-level — callers lean on INT. */
  thin: boolean;
}

/** Assemble the grounded context for a slot (empty `slot` returns overlay + thinness only). */
export async function retrieveContext(
  deps: MemoryDeps,
  orgId: OrgId,
  slot?: string,
): Promise<GroundedContext> {
  const { db, llm } = deps;

  // The full active rule/taboo overlay — indexed, never similarity-gated (MEMS-3).
  const overlayRows = await db
    .select()
    .from(memoryEntry)
    .where(
      and(
        eq(memoryEntry.orgId, orgId),
        isNull(memoryEntry.supersededAt),
        inArray(memoryEntry.kind, [...OVERLAY_KINDS]),
      ),
    );
  const overlay = {
    taboos: overlayRows.filter((r) => r.kind === "taboo"),
    styleRules: overlayRows.filter((r) => r.kind === "styleRule"),
  };

  // Count active grounding entries to decide thinness (ONBS-6 minimum-viable-context).
  const [{ count } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(memoryEntry)
    .where(
      and(
        eq(memoryEntry.orgId, orgId),
        isNull(memoryEntry.supersededAt),
        inArray(memoryEntry.kind, [...GROUNDING_KINDS]),
      ),
    );
  const thin = count < THIN_THRESHOLD;

  let grounding: MemoryEntry[] = [];
  if (slot && slot.trim().length > 0) {
    const queryVec = await withObsContext({ orgId, skill: "retrieve-memory" }, () =>
      llm.embed(slot, "RETRIEVAL_QUERY"),
    );
    const distance = cosineDistance(memoryEntry.embedding, queryVec);
    grounding = await db
      .select()
      .from(memoryEntry)
      .where(
        and(
          eq(memoryEntry.orgId, orgId),
          isNull(memoryEntry.supersededAt),
          isNotNull(memoryEntry.embedding),
          inArray(memoryEntry.kind, [...GROUNDING_KINDS]),
        ),
      )
      .orderBy(distance)
      .limit(DEFAULT_TOP_K);
  }

  return { grounding, overlay, thin };
}
