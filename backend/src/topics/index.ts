/**
 * @module @backend/topics (ARC-26 — the editorial-agenda engine)
 *
 * The system owns the editorial AGENDA (DEC-23): WHAT the org talks about. It
 * proactively identifies content topics grounded in Memory (TOPS-1) and exposes
 * the active-topic set as the agenda (TOPS-4) — the single source the planner
 * (GEN-1), Strategy section (a) (STRS-1), and the Radar (EXT-1) read.
 *
 * TOPS-1 slice (this module today): the `identify-topics` Skill on the ARC-27/
 * PIPE-4 substrate — grounded identification + the deterministic evidence guard
 * (LRN-20) — and DM-13 persistence + `getAgenda` (the TOPS-4 read half).
 *
 * @implements TOPS-1 v1  (topic identification — identify.ts)
 * @implements TOPS-4 v1  (the editorial agenda, read half — store.ts getAgenda)
 *
 * DEFERRED: TOPS-2 the per-topic research strategy (needs the Radar, EXT-1),
 * TOPS-3 topic proposals (needs the PRO-4 interruption budget + the XP-1
 * experience card), the `editAgenda` edit half of TOPS-4 (adopt/adjust/retire
 * writing taste to Memory), and topic EVOLUTION (re-describe/retire via
 * supersession) — a re-run currently dedups by canonical key rather than diffing.
 */
import type { OrgId, Topic } from "@shared";
import type { Database } from "../db/client.js";
import type { Memory } from "../memory/index.js";
import type { LlmPort } from "../ports/llm.js";
import { identifyForOrg } from "./identify.js";
import { getAgenda, persistTopics } from "./store.js";

export type { DeriveTopicsInput } from "./identify.js";
export { applyEvidenceGuard, deriveTopics, identifyForOrg } from "./identify.js";
export { activeTopics, getAgenda, persistTopics, topicKey } from "./store.js";

/** The @backend/topics facade (ARC-26) — binds the DB + Memory + LLM port once. */
export interface Topics {
  /** Identify topics grounded in Memory, guard them, and persist the new ones (TOPS-1). */
  identify(orgId: OrgId): Promise<Topic[]>;
  /** The editorial agenda: the org's active-topic set (TOP-4). */
  getAgenda(orgId: OrgId): Promise<Topic[]>;
}

/** Bind the topics engine to its dependencies (ADR-0003 composition root). */
export function createTopics(deps: { db: Database; memory: Memory; port: LlmPort }): Topics {
  return {
    async identify(orgId) {
      const existing = (await getAgenda(deps.db, orgId)).map((t) => t.description);
      const guarded = await identifyForOrg(
        { memory: deps.memory, port: deps.port },
        orgId,
        existing,
      );
      return persistTopics(deps.db, orgId, guarded);
    },
    getAgenda: (orgId) => getAgenda(deps.db, orgId),
  };
}
