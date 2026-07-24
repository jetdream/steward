/**
 * ExternalItem persistence (DM-8) — the Radar's candidate store (ARC-16). Persists
 * R-4-guarded discovery candidates, reads the Discoveries feed (EXT-5, org-scoped),
 * exposes the saved pool the planner draws from (GEN-1), and records a triage
 * disposition. Org-scoped everywhere (ACC-3).
 */
import { randomUUID } from "node:crypto";
import type { ExternalItem, ExternalItemDisposition, OrgId } from "@shared";
import { externalItem } from "@shared/db/schema.js";
import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import type { SearchCandidate } from "../ports/llm.js";

/** Persist R-4-guarded candidates as untriaged ExternalItems; returns the stored rows. */
export async function persistCandidates(
  db: Database,
  orgId: OrgId,
  candidates: SearchCandidate[],
): Promise<ExternalItem[]> {
  if (candidates.length === 0) return [];
  const rows = candidates.map((c) => ({
    id: randomUUID(),
    orgId,
    source: c.source,
    url: c.url,
    title: c.title,
    summary: c.summary,
    relevanceRationale: c.relevanceRationale,
    topicId: c.topicId,
    disposition: null,
    eventDate: c.eventDate ? new Date(c.eventDate) : null,
  }));
  return db.insert(externalItem).values(rows).returning();
}

/** The Discoveries feed (EXT-5): an org's candidates, newest first. Pull-only (no counts). */
export async function listDiscoveries(db: Database, orgId: OrgId): Promise<ExternalItem[]> {
  return db
    .select()
    .from(externalItem)
    .where(eq(externalItem.orgId, orgId))
    .orderBy(desc(externalItem.createdAt));
}

/** The SAVED POOL (GEN-1): items the founder saved for later, for the planner to draw from. */
export async function savedPool(db: Database, orgId: OrgId): Promise<ExternalItem[]> {
  return db
    .select()
    .from(externalItem)
    .where(and(eq(externalItem.orgId, orgId), eq(externalItem.disposition, "saved-for-later")))
    .orderBy(desc(externalItem.createdAt));
}

/** Set a triage disposition on an item, org-confined (ACC-3). Returns the updated row or null. */
export async function setDisposition(
  db: Database,
  orgId: OrgId,
  id: string,
  disposition: ExternalItemDisposition,
): Promise<ExternalItem | null> {
  const [row] = await db
    .update(externalItem)
    .set({ disposition })
    .where(and(eq(externalItem.orgId, orgId), eq(externalItem.id, id)))
    .returning();
  return row ?? null;
}
