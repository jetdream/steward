/**
 * StrategyDoc persistence (DM-3) — the append-only version store (STR-2) + the
 * Memory reads the strategy view needs. Sections (a/b/d/e) persist as versioned
 * rows (current = max version; prior retained, VAL-3). Section (c) is NOT stored —
 * it is derived (DEC-22) from the platform guardrails + the active Memory overlay,
 * which `activeOverlay` reads here (an org-scoped query over Memory, the single
 * source — the same direct-read pattern onboarding uses for the gap model).
 */
import { randomUUID } from "node:crypto";
import type { ChannelInstructions, OrgId, StrategyDoc } from "@shared";
import { memoryEntry, strategyDoc } from "@shared/db/schema.js";
import { and, desc, eq, inArray, isNull, max } from "drizzle-orm";
import type { Database } from "../db/client.js";

/** The persisted sections of a StrategyDoc version (a/b/d/e; c is derived). */
export interface StrategySections {
  sectionA: string;
  sectionB: string;
  sectionD: string;
  sectionE: ChannelInstructions;
}

/** The current StrategyDoc (highest version) for an org, or null if none drafted yet. */
export async function getCurrentDoc(db: Database, orgId: OrgId): Promise<StrategyDoc | null> {
  const [row] = await db
    .select()
    .from(strategyDoc)
    .where(eq(strategyDoc.orgId, orgId))
    .orderBy(desc(strategyDoc.version))
    .limit(1);
  return row ?? null;
}

/** Append a new StrategyDoc version (version = current max + 1). Returns the stored row. */
export async function insertVersion(
  db: Database,
  orgId: OrgId,
  sections: StrategySections,
): Promise<StrategyDoc> {
  const rows = await db
    .select({ v: max(strategyDoc.version) })
    .from(strategyDoc)
    .where(eq(strategyDoc.orgId, orgId));
  const nextVersion = (rows[0]?.v ?? 0) + 1;
  const [row] = await db
    .insert(strategyDoc)
    .values({
      id: randomUUID(),
      orgId,
      version: nextVersion,
      sectionA: sections.sectionA,
      sectionB: sections.sectionB,
      sectionD: sections.sectionD,
      sectionE: sections.sectionE,
    })
    .returning();
  if (!row) throw new Error("insertVersion: insert returned no row");
  return row;
}

/** All StrategyDoc versions for an org, newest first (STR-2 retained history + diffs). */
export async function listVersions(db: Database, orgId: OrgId): Promise<StrategyDoc[]> {
  return db
    .select()
    .from(strategyDoc)
    .where(eq(strategyDoc.orgId, orgId))
    .orderBy(desc(strategyDoc.version));
}

/** Active Memory entries flattened to grounding text for the STRS-2 auto-draft (VAL-4). */
export async function activeGroundingText(db: Database, orgId: OrgId): Promise<string> {
  const rows = await db
    .select({ kind: memoryEntry.kind, subject: memoryEntry.subject, content: memoryEntry.content })
    .from(memoryEntry)
    .where(and(eq(memoryEntry.orgId, orgId), isNull(memoryEntry.supersededAt)));
  return rows.map((r) => `${r.kind}${r.subject ? ` (${r.subject})` : ""}: ${r.content}`).join("\n");
}

/** The active org rule/taboo overlay — the ORG layer of the derived section (c) (DEC-22). */
export async function activeOverlay(db: Database, orgId: OrgId): Promise<string[]> {
  const rows = await db
    .select({ content: memoryEntry.content })
    .from(memoryEntry)
    .where(
      and(
        eq(memoryEntry.orgId, orgId),
        isNull(memoryEntry.supersededAt),
        inArray(memoryEntry.kind, ["styleRule", "taboo"]),
      ),
    );
  return rows.map((r) => r.content);
}
