/**
 * @module @backend/memory (ARC-11)
 *
 * The org-memory read/write layer — PIPE-1's "one brain, several skills": the
 * single store every enriching capability (ONB, INT, CHT, APR, GEN, EXT, BOT)
 * writes through and every generating capability retrieves from. Memory is the
 * SINGLE source of founder rules/taboos (DEC-22); this module owns the DM-2
 * MemoryEntry read/write, pgvector retrieval + the active rule/taboo overlay,
 * the MEM-2 interrupt-or-assume decision, and the per-org asked-set.
 *
 * @implements MEMS-1 v2  (write path + entry taxonomy — write.ts)
 * @implements MEMS-2 v1  (supersession / dedup / precedence — write.ts, subject-key.ts)
 * @implements MEMS-4 v1  (grounded retrieval + empty-memory thinness — retrieve.ts)
 * @implements MEMS-5 v1  (interrupt-or-assume — should-ask.ts)
 * @implements MEMS-6 v1  (never-ask-twice asked-set — should-ask.ts)
 *
 * Scope note: the VAL-stage ENFORCEMENT of the overlay (MEMS-3) is delivered by
 * its consumer (PIPE-2 / GEN) when that vertical lands; this module ASSEMBLES
 * and returns the overlay (MEMS-4), it does not gate drafts.
 *
 * Facade: `createMemory(db, llm)` binds the dependencies once (composition root)
 * and exposes the internal surfaces named in the spec's `interfaces` block.
 */
import type { MemoryEntry, OrgId } from "@shared";
import { memoryEntry } from "@shared/db/schema.js";
import { and, eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import type { LlmPort } from "../ports/llm.js";
import { listGrounding, retrieveContext } from "./retrieve.js";
import { isResolved, shouldAsk, type Unknown } from "./should-ask.js";
import { type MemoryDeps, reinforce, type WriteContext, writeMemory } from "./write.js";

export type { GroundedContext } from "./retrieve.js";
export type { AskDecision, InterruptClass, Unknown } from "./should-ask.js";
export type { WriteContext } from "./write.js";

/** The @backend/memory facade — the module's public surface (ARC-11). */
export interface Memory {
  /** Write raw input to Memory (MEMS-1). Returns the resulting active entries. */
  write(rawInput: string, ctx: WriteContext): Promise<MemoryEntry[]>;
  /** Bare-approval reinforcement touch on grounding entries (MEMS-1). */
  reinforce(orgId: OrgId, entryIds: readonly string[]): Promise<number>;
  /** Grounded context for a slot: grounding + full overlay + thinness (MEMS-4). */
  retrieveContext(orgId: OrgId, slot?: string): ReturnType<typeof retrieveContext>;
  /** All active grounding entries, broad (not similarity) — the TOPS-1 agenda read. */
  listGrounding(orgId: OrgId, limit?: number): ReturnType<typeof listGrounding>;
  /** Interrupt-or-assume decision, consulting the asked-set (MEMS-5/MEMS-6). */
  shouldAsk(orgId: OrgId, unknown: Unknown): ReturnType<typeof shouldAsk>;
  /** True when an unknown is already resolved in Memory (MEMS-6). */
  isResolved(orgId: OrgId, subjectKey: string): Promise<boolean>;
  /**
   * The deterministic wrong-org / BIL-2 HARD purge (MEMS-2, SEC-4): the only
   * hard delete — removes every MemoryEntry for the org (asked-set included, as
   * it is derived over these rows). Returns the number of rows removed.
   */
  purgeOrg(orgId: OrgId): Promise<number>;
}

/** Bind the memory module to a DB handle + LLM port (ADR-0003 composition root). */
export function createMemory(db: Database, llm: LlmPort): Memory {
  const deps: MemoryDeps = { db, llm };
  return {
    write: (rawInput, ctx) => writeMemory(deps, rawInput, ctx),
    reinforce: (orgId, entryIds) => reinforce(deps, orgId, entryIds),
    retrieveContext: (orgId, slot) => retrieveContext(deps, orgId, slot),
    listGrounding: (orgId, limit) => listGrounding(deps, orgId, limit),
    shouldAsk: (orgId, unknown) => shouldAsk(deps, orgId, unknown),
    isResolved: (orgId, subjectKey) => isResolved(deps, orgId, subjectKey),
    async purgeOrg(orgId) {
      const removed = await db
        .delete(memoryEntry)
        .where(and(eq(memoryEntry.orgId, orgId)))
        .returning({ id: memoryEntry.id });
      return removed.length;
    },
  };
}
