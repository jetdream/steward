/**
 * DM-13 Topic PERSISTENCE + the editorial-agenda read (TOPS-1 / TOPS-4 read half).
 * Persists guarded candidate topics as ACTIVE, system-derived DM-13 rows (the
 * auto-drafted agenda — never a blank page, VAL-6), and exposes the agenda (the
 * active-Topic set) org-scoped (ACC-3). Dedup is by a DETERMINISTIC canonical
 * `topicKey` so a re-run does not duplicate a theme.
 *
 * @implements TOPS-1 v1  (persist identified topics)
 * @implements TOPS-4 v1  (getAgenda — the active-topic set is the agenda; read half)
 */
import { randomUUID } from "node:crypto";
import type { OrgId, Topic } from "@shared";
import { topic } from "@shared/db/schema.js";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import type { Database } from "../db/client.js";
import type { CandidateTopic } from "../ports/llm.js";

/**
 * The DETERMINISTIC canonical key of a theme — lowercased, whitespace-collapsed,
 * surrounding punctuation stripped. The dedup + declined-suppression key (TOPS-3),
 * mirroring the memory subject-key discipline: an exact, zero-false-match key,
 * never a similarity guess.
 */
export function topicKey(theme: string): string {
  return theme
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** The org's ACTIVE topic keys — used to dedup a re-run and to seed `existingThemes`. */
export async function activeTopics(db: Database, orgId: OrgId): Promise<Topic[]> {
  return db
    .select()
    .from(topic)
    .where(and(eq(topic.orgId, orgId), eq(topic.status, "active"), isNull(topic.supersededAt)))
    .orderBy(desc(topic.createdAt));
}

/** The editorial agenda (TOP-4): the org's active-Topic set. Alias of `activeTopics`. */
export const getAgenda = activeTopics;

/**
 * Persist guarded candidate topics as active, system-derived DM-13 rows, skipping
 * any whose canonical key already exists among the org's active topics (dedup on
 * re-run). Returns the rows inserted this call.
 */
export async function persistTopics(
  db: Database,
  orgId: OrgId,
  candidates: CandidateTopic[],
): Promise<Topic[]> {
  if (candidates.length === 0) return [];
  const keyed = candidates.map((c) => ({ c, key: topicKey(c.theme) }));

  // Existing active keys for this org (dedup) — a single indexed lookup.
  const keys = [...new Set(keyed.map((k) => k.key))];
  const existing = await db
    .select({ topicKey: topic.topicKey })
    .from(topic)
    .where(and(eq(topic.orgId, orgId), eq(topic.status, "active"), inArray(topic.topicKey, keys)));
  const seen = new Set(existing.map((r) => r.topicKey));

  const toInsert = keyed
    .filter(({ key }) => !seen.has(key))
    // Collapse intra-batch duplicates too.
    .filter(({ key }, i, arr) => arr.findIndex((k) => k.key === key) === i)
    .map(({ c, key }) => ({
      id: randomUUID(),
      orgId,
      topicKey: key,
      description: c.description,
      whyItFits: c.whyItFits,
      evidence: { memoryEntryIds: c.evidenceMemoryIds },
      provenance: "system-derived" as const,
      status: "active" as const,
    }));
  if (toInsert.length === 0) return [];
  return db.insert(topic).values(toInsert).returning();
}
