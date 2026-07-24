/**
 * @module @backend/interviewer (part of ARC-13 — Chat + Interviewer)
 *
 * The interviewer SKILL (not a surface): a curious thinking partner that fills
 * Memory gaps. It runs in the shared conversation and reads/writes ONLY through
 * Memory (MEMS) + the single gap model (ONBS-3) — no side channel. LRN-20 split:
 * the DETERMINISTIC parts are question GATING (the gap model already excludes
 * resolved gaps — MEMS-6) + the per-turn rate cap + resumable session state
 * (DM-6/7); the PROBABILISTIC part is conversational QUALITY (the
 * `interview-questions` Skill), held by the eval, not a deterministic guarantee.
 *
 * @implements INTS-1 v1  (the curious interviewer — open, story-seeking questions)
 * @implements INTS-2 v1  (resumable, never re-asking, capped; answers → Memory via MEMS-1)
 * @implements INTS-4 v1  (progressive enrichment — the always-available open-questions list)
 *
 * DEFERRED: INTS-3 periodic calendar-tied curiosity draws on the shared PRO-4
 * proactive-interruption budget (DEC-24) — it lands with the Proactive manager.
 */
import type { ChatMessage, ChatSession, MemoryEntry, OrgId } from "@shared";
import type { Database } from "../db/client.js";
import { runSkill } from "../harness/runtime.js";
import type { Memory } from "../memory/index.js";
import { computeGaps, type Gap, type GapCategory } from "../onboarding/index.js";
import type { InterviewQuestion, LlmPort } from "../ports/llm.js";
import * as store from "./store.js";

/** The INTS-2 per-turn cap — a FEW questions, never an interrogation. */
const PER_TURN_CAP = 3;

/** One open gap surfaced in the enrichment list (INTS-4) — a filtered gap-model view. */
export interface OpenQuestion {
  category: GapCategory;
  why: string;
}

/** The open gaps (present === false) as the enrichment list — deterministic, no LLM. */
function openGapsOf(gaps: Gap[]): OpenQuestion[] {
  return gaps.filter((g) => !g.present).map((g) => ({ category: g.category, why: g.why }));
}

export interface InterviewerDeps {
  db: Database;
  memory: Pick<Memory, "write" | "listGrounding">;
  port: LlmPort;
}

export interface Interviewer {
  startSession(orgId: OrgId): Promise<ChatSession>;
  nextQuestions(orgId: OrgId, sessionId: string): Promise<InterviewQuestion[]>;
  recordAnswer(orgId: OrgId, sessionId: string, answer: string): Promise<MemoryEntry[]>;
  openQuestions(orgId: OrgId): Promise<OpenQuestion[]>;
  transcript(orgId: OrgId, sessionId: string): Promise<ChatMessage[]>;
}

export function createInterviewer(deps: InterviewerDeps): Interviewer {
  return {
    startSession: (orgId) => store.startSession(deps.db, orgId),

    /**
     * INTS-1/2: a few gap-driven, open questions. The gap model (ONBS-3) supplies
     * the OPEN gaps deterministically (a resolved gap is `present` → never re-asked,
     * MEMS-6); the Skill phrases them; the per-turn cap holds. Questions are recorded
     * as assistant messages on the resumable session.
     */
    async nextQuestions(orgId, sessionId) {
      const openGaps = openGapsOf(await computeGaps(deps.db, orgId));
      if (openGaps.length === 0) return [];
      const grounding = (await deps.memory.listGrounding(orgId))
        .map((e) => `${e.kind}: ${e.content}`)
        .join("\n");
      const questions = await runSkill({ orgId, skillId: "interview-questions" }, () =>
        deps.port.interviewQuestions({ grounding, openGaps, count: PER_TURN_CAP }),
      );
      const capped = questions.slice(0, PER_TURN_CAP);
      for (const q of capped)
        await store.appendMessage(deps.db, orgId, sessionId, "assistant", q.question);
      return capped;
    },

    /** INTS-2: record the founder's answer — transcript + Memory (MEMS-1 free-remark path). */
    async recordAnswer(orgId, sessionId, answer) {
      await store.appendMessage(deps.db, orgId, sessionId, "user", answer);
      return deps.memory.write(answer, {
        orgId,
        source: { trigger: "interview", detail: "interview answer" },
        correctionChannel: false,
      });
    },

    /** INTS-4: the always-available open-questions list — a filtered view of the gap model. */
    openQuestions: async (orgId) => openGapsOf(await computeGaps(deps.db, orgId)),

    transcript: (orgId, sessionId) => store.getTranscript(deps.db, orgId, sessionId),
  };
}
