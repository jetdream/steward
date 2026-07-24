/**
 * The Memory WRITE path (MEMS-1) — the ONLY code path that mutates Memory; there
 * is no side channel. Sequence: classify (LLM port) → apply the MEMS-1 policy →
 * dedup / supersede (MEMS-2) → persist → embed. Every write carries its kind,
 * source (provenance), and timestamp; no write lacks source or timestamp.
 *
 * Policy backstop (MEMS-1, the LRN-20 discipline): classification is the LLM's
 * job, but "input on an explicit correction channel is a styleRule/taboo, never
 * a bare fact" is enforced DETERMINISTICALLY here — not left to the model.
 */
import { randomUUID } from "node:crypto";
import type { MemoryEntry, MemoryEntryKind, MemorySource, OrgId } from "@shared";
import { memoryEntry } from "@shared/db/schema.js";
import { and, eq, isNull } from "drizzle-orm";
import { runSkill } from "../harness/runtime.js";
import type { EmbedTaskType, LlmPort } from "../ports/llm.js";
import { normalize, subjectKey } from "./subject-key.js";

/** Injected dependencies for the memory module (composition root binds them). */
export interface MemoryDeps {
  db: import("../db/client.js").Database;
  llm: LlmPort;
}

/** Caller-supplied context for a write (callers: ONB, INT, CHT, APR, GEN, EXT, BOT). */
export interface WriteContext {
  /** The owning org — every write is org-scoped (ACC-3). */
  orgId: OrgId;
  /** Provenance (MEMS-1): the triggering event. */
  source: MemorySource;
  /**
   * True when the raw input arrived on an EXPLICIT correction channel (APR
   * reject/edit/skip, CHT confirmed redirect, ONBS-5 review) — forces the
   * styleRule/taboo policy (MEMS-1 "never a bare fact").
   */
  correctionChannel: boolean;
  /**
   * Marks the write as an inference / sensible default not yet founder-confirmed
   * (ONBS-2 ingestion, MEMS-5 assumed default). Surfaced as a correctable
   * AssumedNote. Defaults to false.
   */
  assumed?: boolean;
}

const PROHIBITION = /\b(never|don'?t|do not|avoid|no more|stop|without)\b/i;

/** MEMS-1 deterministic policy: a correction-channel fact/story becomes a rule. */
export function applyCorrectionPolicy(
  kind: MemoryEntryKind,
  content: string,
  correctionChannel: boolean,
): MemoryEntryKind {
  if (!correctionChannel) return kind;
  if (kind === "fact" || kind === "story") {
    return PROHIBITION.test(content) ? "taboo" : "styleRule";
  }
  return kind;
}

/** The text embedded for retrieval — subject + content when a subject exists. */
function embedText(subject: string | undefined, content: string): string {
  return subject ? `${subject}: ${content}` : content;
}

/**
 * Write raw input to Memory, returning the resulting ACTIVE entries. Extraction
 * may yield several typed entries from one input; each is deduped/superseded
 * independently.
 */
export async function writeMemory(
  deps: MemoryDeps,
  rawInput: string,
  ctx: WriteContext,
): Promise<MemoryEntry[]> {
  // Run as the "extract-memory" Skill (ARC-27): binds the org + skill + prompt
  // version so every LLM call in this write (extraction + per-entry embedding) is
  // attributed + cost-logged (PIPE-5).
  return runSkill({ orgId: ctx.orgId, skillId: "extract-memory" }, async () => {
    const candidates = await deps.llm.extractEntries(rawInput, {
      correctionChannel: ctx.correctionChannel,
    });

    const results: MemoryEntry[] = [];
    for (const cand of candidates) {
      const kind = applyCorrectionPolicy(cand.kind, cand.content, ctx.correctionChannel);
      const key = subjectKey(kind, cand.subject, cand.content);
      const entry = await upsertEntry(deps, ctx, {
        kind,
        subject: cand.subject,
        content: cand.content,
        subjectKey: key,
      });
      results.push(entry);
    }
    return results;
  });
}

/** MEMS-2: merge an identical restatement, supersede a correction, else insert. */
async function upsertEntry(
  deps: MemoryDeps,
  ctx: WriteContext,
  fields: {
    kind: MemoryEntryKind;
    subject: string | undefined;
    content: string;
    subjectKey: string;
  },
): Promise<MemoryEntry> {
  const { db } = deps;
  const [active] = await db
    .select()
    .from(memoryEntry)
    .where(
      and(
        eq(memoryEntry.orgId, ctx.orgId),
        eq(memoryEntry.subjectKey, fields.subjectKey),
        isNull(memoryEntry.supersededAt),
      ),
    )
    .limit(1);

  if (active) {
    if (normalize(active.content) === normalize(fields.content)) {
      // Identical restatement → MERGE (touch), never a duplicate row (MEMS-2).
      const [touched] = await db
        .update(memoryEntry)
        .set({ reinforcedAt: new Date(), assumed: ctx.assumed ?? active.assumed })
        .where(eq(memoryEntry.id, active.id))
        .returning();
      return touched ?? active;
    }
    // Same subject, different claim → CORRECTION: supersede, retain the prior
    // (VAL-3 never overwrite), insert the new active row pointing back.
    const id = randomUUID();
    const inserted = await insertActive(deps, ctx, id, fields);
    await db
      .update(memoryEntry)
      .set({ supersededAt: new Date(), supersededBy: id })
      .where(eq(memoryEntry.id, active.id));
    return inserted;
  }

  return insertActive(deps, ctx, randomUUID(), fields);
}

/**
 * Insert a fresh active row, then compute + persist its retrieval embedding. The
 * write commits first; the embedding is enrichment layered on. Returns the row
 * WITH its embedding populated so callers see the persisted state.
 */
async function insertActive(
  deps: MemoryDeps,
  ctx: WriteContext,
  id: string,
  fields: {
    kind: MemoryEntryKind;
    subject: string | undefined;
    content: string;
    subjectKey: string;
  },
): Promise<MemoryEntry> {
  const { db, llm } = deps;
  const [inserted] = await db
    .insert(memoryEntry)
    .values({
      id,
      orgId: ctx.orgId,
      kind: fields.kind,
      subject: fields.subject ?? null,
      content: fields.content,
      subjectKey: fields.subjectKey,
      source: ctx.source,
      assumed: ctx.assumed ?? false,
    })
    .returning();
  if (!inserted) throw new Error("writeMemory: insert returned no row");

  const vector = await embedFor(llm, fields.subject, fields.content);
  await db.update(memoryEntry).set({ embedding: vector }).where(eq(memoryEntry.id, id));
  return { ...inserted, embedding: vector };
}

/** Compute the RETRIEVAL_DOCUMENT embedding for an entry's text. */
function embedFor(llm: LlmPort, subject: string | undefined, content: string): Promise<number[]> {
  const taskType: EmbedTaskType = "RETRIEVAL_DOCUMENT";
  return llm.embed(embedText(subject, content), taskType);
}

/**
 * MEMS-1 bare-approval REINFORCEMENT: bump `reinforcedAt` on the entries that
 * grounded an approved draft (identified from the retrieveContext set), so
 * "every approval writes" holds without inventing an eighth type.
 */
export async function reinforce(
  deps: MemoryDeps,
  orgId: OrgId,
  entryIds: readonly string[],
): Promise<number> {
  if (entryIds.length === 0) return 0;
  const now = new Date();
  let touched = 0;
  for (const id of entryIds) {
    const rows = await deps.db
      .update(memoryEntry)
      .set({ reinforcedAt: now })
      .where(and(eq(memoryEntry.orgId, orgId), eq(memoryEntry.id, id)))
      .returning({ id: memoryEntry.id });
    touched += rows.length;
  }
  return touched;
}
