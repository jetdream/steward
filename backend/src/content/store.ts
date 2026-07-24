/**
 * DM-5 ContentItem PERSISTENCE (the G1b slice) — the Content Engine's output
 * store (ARC-15). Turns a GENS-7 DraftResult into a durable ContentItem row and
 * reads it back org-scoped (ACC-3). This completes the `generateDraft -> ContentItem`
 * interface (GENS): generation is no longer a throwaway; a draft becomes the
 * editorial master the downstream lifecycle (APR approve/skip, GENS-3/4 picture
 * gate, PUB publish) advances.
 *
 * @implements GENS-7 v1  (persist the generated master as a DM-5 ContentItem)
 */
import { randomUUID } from "node:crypto";
import type { ContentItem, EditorialState, OrgId } from "@shared";
import { contentItem } from "@shared/db/schema.js";
import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import type { ContentSlot } from "../ports/llm.js";
import type { DraftResult } from "./types.js";

/** What `persistDraft` needs: the slot it answered + the VAL-gated result. */
export interface PersistDraftInput {
  orgId: OrgId;
  slot: ContentSlot;
  result: DraftResult;
  /** External-sourced content (GR-5) — defaults to false. */
  isExternal?: boolean;
}

/** Join the VAL findings (+ any note) into the human-readable hold reason (APR shows it). */
function summarizeVal(result: DraftResult): string {
  const parts = result.val.findings.map((f) => `${f.guardrail}: ${f.reason}`);
  if (result.val.note) parts.push(result.val.note);
  return parts.join("; ");
}

/**
 * Persist a generated draft as a DM-5 ContentItem (editorial state `draft`). An
 * escalated VAL outcome (GR-3/GR-8) is recorded via `escalated` + `valSummary`;
 * the item still lands in `draft` (at TL0 every draft needs founder approval, so
 * escalation just records WHY it can never auto-advance). Returns the stored row.
 */
export async function persistDraft(db: Database, input: PersistDraftInput): Promise<ContentItem> {
  const { orgId, slot, result } = input;
  const [row] = await db
    .insert(contentItem)
    .values({
      id: randomUUID(),
      orgId,
      editorialState: "draft",
      contentType: slot.type,
      subject: slot.subject,
      designation: slot.designation,
      title: result.master.title,
      body: result.master.body,
      reasonLine: result.master.reasonLine,
      valOutcome: result.val.outcome,
      escalated: result.val.outcome === "escalate",
      valSummary: summarizeVal(result),
      isExternal: input.isExternal ?? false,
    })
    .returning();
  // The insert always returns exactly one row; the guard satisfies the type.
  if (!row) throw new Error("persistDraft: insert returned no row");
  return row;
}

/** Load one ContentItem, org-scoped (ACC-3). Returns null if not found in this org. */
export async function getContentItem(
  db: Database,
  orgId: OrgId,
  id: string,
): Promise<ContentItem | null> {
  const [row] = await db
    .select()
    .from(contentItem)
    .where(and(eq(contentItem.orgId, orgId), eq(contentItem.id, id)));
  return row ?? null;
}

/** List an org's ContentItems, newest first, optionally filtered by editorial state. */
export async function listContentItems(
  db: Database,
  orgId: OrgId,
  editorialState?: EditorialState,
): Promise<ContentItem[]> {
  return db
    .select()
    .from(contentItem)
    .where(
      editorialState
        ? and(eq(contentItem.orgId, orgId), eq(contentItem.editorialState, editorialState))
        : eq(contentItem.orgId, orgId),
    )
    .orderBy(desc(contentItem.createdAt));
}
