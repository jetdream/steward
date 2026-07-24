/**
 * @module @backend/chat (part of ARC-13 — Chat + Interviewer)
 *
 * The conversational SURFACE (the home's medium, not a separate destination). It
 * answers grounded in Memory + Strategy + the content schedule, records redirects
 * to the single Memory source (confirm-back first), and leads with non-blank
 * openings. It HOSTS the interviewer skill (INTS) and shares its DM-6/7 transcript.
 *
 * @implements CHTS-1 v1  (grounded answers + the GR-2 legal/tax decline gate)
 * @implements CHTS-2 v1  (redirects — confirm-back BEFORE binding, then written to Memory)
 * @implements CHTS-4 v1  (colleague voice — a REQUIRED reason on every proactive message)
 * @implements CHTS-5 v1  (proactive, never-blank leading chat — suggested openings)
 *
 * DEFERRED: CHTS-3 command actions (P1); CHTS-5's guided Adjust (a content-engine
 * redraft) + the disposition-triggered enrichment loop land with APR (they need the
 * draft dispositions APR owns). Grounding uses the broad active set (listGrounding);
 * query-relevant MEMS-4 retrieval is a refinement.
 */
import type { ChatSession, MemoryEntryView, OrgId } from "@shared";
import { listContentItems } from "../content/store.js";
import type { Database } from "../db/client.js";
import { runSkill } from "../harness/runtime.js";
import * as transcript from "../interviewer/store.js";
import type { Memory } from "../memory/index.js";
import type { ChatAnswer, LlmPort } from "../ports/llm.js";
import { getStrategy } from "../strategy/index.js";

/** A leading opening (CHTS-5) — the text plus its REQUIRED reason (CHTS-4). */
export interface SuggestedOpening {
  opening: string;
  reason: string;
}

/** What a redirect will bind, surfaced for confirm-back BEFORE any write (CHTS-2). */
export interface RedirectPreview {
  interpretation: string;
}

export interface ChatDeps {
  db: Database;
  memory: Pick<Memory, "write" | "listGrounding">;
  port: LlmPort;
}

export interface Chat {
  answer(orgId: OrgId, sessionId: string, question: string): Promise<ChatAnswer>;
  suggestOpenings(orgId: OrgId): Promise<SuggestedOpening[]>;
  previewRedirect(text: string): RedirectPreview;
  applyRedirect(orgId: OrgId, text: string): Promise<MemoryEntryView | null>;
  startSession(orgId: OrgId): Promise<ChatSession>;
}

/** Assemble the grounded context for a chat answer: Memory + Strategy + the schedule. */
async function assembleGrounding(deps: ChatDeps, orgId: OrgId): Promise<string> {
  const mem = (await deps.memory.listGrounding(orgId))
    .map((e) => `${e.kind}: ${e.content}`)
    .join("\n");
  const strat = await getStrategy(deps.db, orgId);
  const stratText = `STRATEGY — post about: ${strat.sectionA || "(not set)"}; tone: ${strat.sectionB || "(not set)"}`;
  const items = await listContentItems(deps.db, orgId);
  const schedule = items
    .map((i) => {
      const when = i.scheduledFor ? i.scheduledFor.toISOString().slice(0, 10) : "unscheduled";
      return `${when}: ${i.title} (${i.editorialState})`;
    })
    .join("\n");
  return [mem, stratText, `SCHEDULE:\n${schedule || "(nothing scheduled yet)"}`].join("\n\n");
}

export function createChat(deps: ChatDeps): Chat {
  return {
    startSession: (orgId) => transcript.startSession(deps.db, orgId),

    /** CHTS-1: a grounded answer (GR-2-gated). Records the Q + A on the session. */
    async answer(orgId, sessionId, question) {
      await transcript.appendMessage(deps.db, orgId, sessionId, "user", question);
      const grounding = await assembleGrounding(deps, orgId);
      const result = await runSkill({ orgId, skillId: "chat-answer" }, () =>
        deps.port.chatAnswer({ question, grounding }),
      );
      await transcript.appendMessage(deps.db, orgId, sessionId, "assistant", result.answer);
      return result;
    },

    /**
     * CHTS-5/CHTS-4: never a blank composer — a few context openings, EACH with a
     * required reason. Deterministic composition of open gaps + drafts awaiting review.
     */
    async suggestOpenings(orgId) {
      const openings: SuggestedOpening[] = [];
      const drafts = await listContentItems(deps.db, orgId, "draft");
      if (drafts.length > 0) {
        openings.push({
          opening: `Want to look over the ${drafts.length} draft${drafts.length === 1 ? "" : "s"} I prepared?`,
          reason: "you have drafts ready to review in the Ready spine",
        });
      }
      openings.push({
        opening: "Anything you'd like me to write about, or a story worth telling?",
        reason: "the composer is never blank — I lead so you mostly answer (CHTS-5)",
      });
      return openings;
    },

    /** CHTS-2: the confirm-back interpretation — NO write happens here (deterministic gate). */
    previewRedirect: (text) => ({
      interpretation: `I'll remember this as a standing rule for future posts: "${text}". Confirm?`,
    }),

    /** CHTS-2: bind a CONFIRMED redirect to Memory (styleRule/taboo, never a bare fact). */
    async applyRedirect(orgId, text) {
      const written = await deps.memory.write(text, {
        orgId,
        source: { trigger: "chat", detail: "chat redirect" },
        correctionChannel: true,
      });
      const first = written[0];
      if (!first) return null;
      const { embedding: _embedding, ...view } = first; // client-safe projection
      return view;
    },
  };
}
