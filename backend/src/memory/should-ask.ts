/**
 * The interrupt-or-assume decision (MEMS-5) + the never-ask-twice asked-set
 * (MEMS-6). Before ANY question reaches the founder, shouldAsk decides whether
 * the unknown justifies an interrupt (MEM-2):
 *  - one of the three interrupt-allowed classes (field-only material, a
 *    genuinely founder-owned decision, or a blocking unknown) → ASK;
 *  - EVERYTHING ELSE → ASSUME (the caller records a sensible default via the
 *    write path with `assumed: true`, surfaced as a correctable AssumedNote —
 *    a silent guess is forbidden, VAL-3).
 *
 * The asked-set is a DERIVED index over MemoryEntry (not session state): a
 * structured unknown is keyed by the same deterministic canonical-subject string
 * as dedup (subject-key.ts), so it has ZERO false-match — an unknown already
 * answered or assumed is resolved from Memory, never re-asked (MEMS-6). Residual
 * free-form unknowns (fuzzy/embedding matching) are out of this spine slice; the
 * safe default there is bias-to-ask, so no such unknown is silently suppressed.
 */
import type { OrgId } from "@shared";
import { memoryEntry } from "@shared/db/schema.js";
import { and, eq, isNull } from "drizzle-orm";
import type { MemoryDeps } from "./write.js";

/** The three MEM-2 interrupt-allowed classes — only these justify an ask (MEMS-5). */
export type InterruptClass = "field-material" | "founder-owned" | "blocking";

/** An unknown presented for the interrupt-or-assume decision. */
export interface Unknown {
  /** The deterministic canonical-subject key of the unknown (asked-set key, MEMS-6). */
  subjectKey: string;
  /** The interrupt class if the caller has classified it into one; else omit. */
  interruptClass?: InterruptClass;
}

/** The decision shouldAsk returns. */
export type AskDecision =
  | { decision: "ask"; class: InterruptClass }
  | { decision: "assume"; reason: "already-resolved" | "defaultable" };

/** True when an unknown's key is already resolved (answered/assumed) in Memory. */
export async function isResolved(
  deps: MemoryDeps,
  orgId: OrgId,
  subjectKey: string,
): Promise<boolean> {
  const [row] = await deps.db
    .select({ id: memoryEntry.id })
    .from(memoryEntry)
    .where(
      and(
        eq(memoryEntry.orgId, orgId),
        eq(memoryEntry.subjectKey, subjectKey),
        isNull(memoryEntry.supersededAt),
      ),
    )
    .limit(1);
  return row !== undefined;
}

/** Decide whether to interrupt the founder for `unknown` (MEMS-5/MEMS-6). */
export async function shouldAsk(
  deps: MemoryDeps,
  orgId: OrgId,
  unknown: Unknown,
): Promise<AskDecision> {
  // MEMS-6: never re-ask a resolved unknown — resolve from Memory instead.
  if (await isResolved(deps, orgId, unknown.subjectKey)) {
    return { decision: "assume", reason: "already-resolved" };
  }
  // MEMS-5: only the three interrupt classes justify an ask.
  if (unknown.interruptClass) {
    return { decision: "ask", class: unknown.interruptClass };
  }
  // Everything else defaults sensibly — the caller writes an `assumed` entry.
  return { decision: "assume", reason: "defaultable" };
}
