/**
 * @module @backend/approval (ARC-17 — Ready / Approvals)
 *
 * The disposition surface of the weekly visit (XH-1): the Ready spine + the two
 * verbs (approve / redirect) + the founder composer. It receives VAL-cleared
 * drafts from the content engine (GENS via PIPE-2) and records founder verdicts
 * before publishing (PUB). Dispositions write to Memory through the SINGLE MEMS-1
 * correction path (the learning loop) — a skip-reason, a redirect, an accepted
 * rule-proposal become styleRule/taboo entries (never a bare fact).
 *
 * The Ready stack is an ORDERED VIEW over pending ContentItems — NO new entity
 * (DM-5); the edit-diff log (APRS-3) is the one new table. The composer is NOT a
 * bypass: `compose` hands the founder-authored master to the SAME content-engine
 * VAL → persist → adapt chain a planner slot takes (LRN-22, APRS-5). All routing/
 * filtering here is DETERMINISTIC (LRN-20).
 *
 * @implements APRS-1 v3  (the disposition spine — readyStack / approve / batchApprove / editDraft / skip / redirect)
 * @implements APRS-3 v1  (the learning loop — edit-diff capture + founder-confirmed rule writes)
 * @implements APRS-5 v1  (the manual composer — same VAL chain, no authorship bypass)
 *
 * DEFERRED (documented keyed follow-on): the APRS-3 recurring-edit-PATTERN
 * DETECTION Skill (an LLM/statistical judgment over the accumulated edit-diff log
 * that SURFACES a proposal) — the loop's data capture (editDraft → edit_diff) and
 * its founder-confirmed write (proposeRule → Memory) land here; the detector that
 * proposes from the diffs is a later Skill + eval. Also deferred: bare-approval
 * grounding reinforcement (needs the draft→grounding provenance link), the AUT-1
 * TL1 auto-approve/veto-window (P2), APRS-4 notifications (Email port), APRS-2
 * cadence, APR-6 (P1).
 */
import { randomUUID } from "node:crypto";
import type { ChannelPlatform, ChannelVariant, ContentItem, MemoryEntry, OrgId } from "@shared";
import { channelVariant, contentItem, editDiff } from "@shared/db/schema.js";
import { and, asc, eq } from "drizzle-orm";
import { resolveOutcome } from "../content/guardrails.js";
import { getContentItem, listContentItems, persistDraft } from "../content/store.js";
import type { DraftResult } from "../content/types.js";
import { adaptContentItem } from "../content/variants.js";
import type { Database } from "../db/client.js";
import { canApprove } from "../media/gate.js";
import type { Memory } from "../memory/index.js";
import type { GeneratedMaster, LlmPort } from "../ports/llm.js";
import { type BatchCandidate, batchEligible } from "./dispositions.js";

/** A Ready-spine card: the pending item + its per-channel variants with fit verdicts (XH-5). */
export interface ReadyCard {
  item: ContentItem;
  variants: ChannelVariant[];
}

/** The founder-authored composer input (APRS-5). */
export interface ComposeInput {
  title: string;
  body: string;
  reasonLine?: string;
  /** An attached picture (library or upload) — without it the draft stays awaiting_picture (GENS-3/4). */
  mediaAssetId?: string;
  /** Target channels; defaults to all launch channels (the fit gate then scores each). */
  channels?: ChannelPlatform[];
}

export interface ApprovalDeps {
  db: Database;
  memory: Memory;
  port: LlmPort;
}

export interface Approval {
  readyStack(orgId: OrgId): Promise<ReadyCard[]>;
  approve(orgId: OrgId, itemId: string): Promise<{ approved: boolean; block?: "awaiting-picture" }>;
  batchApprove(orgId: OrgId): Promise<{ approved: number; excluded: number }>;
  editDraft(orgId: OrgId, itemId: string, text: string, variantId?: string): Promise<void>;
  skip(orgId: OrgId, itemId: string, reason?: string): Promise<void>;
  redirect(orgId: OrgId, itemId: string, text: string): Promise<MemoryEntry | null>;
  proposeRule(orgId: OrgId, pattern: string): Promise<MemoryEntry | null>;
  compose(orgId: OrgId, input: ComposeInput): Promise<ContentItem>;
}

/** Client-safe MemoryEntry projection (drop the embedding — never crosses the boundary). */
function memView(entry: MemoryEntry | undefined): MemoryEntry | null {
  if (!entry) return null;
  const { embedding: _embedding, ...view } = entry;
  return view as MemoryEntry;
}

export function createApproval(deps: ApprovalDeps): Approval {
  const { db, memory, port } = deps;

  async function variantsFor(orgId: OrgId, itemId: string): Promise<ChannelVariant[]> {
    return db
      .select()
      .from(channelVariant)
      .where(and(eq(channelVariant.orgId, orgId), eq(channelVariant.contentItemId, itemId)))
      .orderBy(asc(channelVariant.platform));
  }

  /** The ordered Ready spine: pending drafts, the OPSS-1 QA gate withholding pending-review. */
  async function computeReadyStack(orgId: OrgId): Promise<ReadyCard[]> {
    const items = (await listContentItems(db, orgId)).filter(
      (i) =>
        (i.editorialState === "draft" || i.editorialState === "awaiting_picture") &&
        i.qaStatus !== "pending-review",
    );
    const cards: ReadyCard[] = [];
    for (const item of items) cards.push({ item, variants: await variantsFor(orgId, item.id) });
    return cards;
  }

  /** Flip a draft item to `approved` (GENS-4-gated). false if it has no picture. */
  async function approveItem(orgId: OrgId, item: ContentItem): Promise<boolean> {
    if (!canApprove(item)) return false; // GENS-3/4: no picture ⇒ cannot advance to approved
    await db
      .update(contentItem)
      .set({ editorialState: "approved" })
      .where(and(eq(contentItem.orgId, orgId), eq(contentItem.id, item.id)));
    return true;
  }

  async function recordDiff(
    orgId: OrgId,
    itemId: string,
    beforeText: string,
    afterText: string,
    variantId: string | undefined,
  ): Promise<void> {
    await db.insert(editDiff).values({
      id: randomUUID(),
      orgId,
      contentItemId: itemId,
      ...(variantId ? { variantId } : {}),
      beforeText,
      afterText,
    });
  }

  return {
    readyStack: computeReadyStack,

    async approve(orgId, itemId) {
      const item = await getContentItem(db, orgId, itemId);
      if (!item) throw new Error("approval.approve: item not found for org");
      const ok = await approveItem(orgId, item);
      return ok ? { approved: true } : { approved: false, block: "awaiting-picture" };
    },

    async batchApprove(orgId) {
      const cards = await computeReadyStack(orgId);
      let approved = 0;
      let excluded = 0;
      for (const { item } of cards) {
        const candidate: BatchCandidate = {
          editorialState: item.editorialState,
          escalated: item.escalated,
          hasPicture: item.mediaAssetId != null,
        };
        if (batchEligible(candidate) && (await approveItem(orgId, item))) approved++;
        else excluded++;
      }
      return { approved, excluded };
    },

    async editDraft(orgId, itemId, text, variantId) {
      if (variantId) {
        const [v] = await db
          .select({ body: channelVariant.body })
          .from(channelVariant)
          .where(and(eq(channelVariant.orgId, orgId), eq(channelVariant.id, variantId)));
        if (!v) throw new Error("approval.editDraft: variant not found for org");
        await db
          .update(channelVariant)
          .set({ body: text })
          .where(and(eq(channelVariant.orgId, orgId), eq(channelVariant.id, variantId)));
        await recordDiff(orgId, itemId, v.body, text, variantId);
        return;
      }
      const item = await getContentItem(db, orgId, itemId);
      if (!item) throw new Error("approval.editDraft: item not found for org");
      await db
        .update(contentItem)
        .set({ body: text })
        .where(and(eq(contentItem.orgId, orgId), eq(contentItem.id, itemId)));
      await recordDiff(orgId, itemId, item.body, text, undefined);
    },

    async skip(orgId, itemId, reason) {
      const item = await getContentItem(db, orgId, itemId);
      if (!item) throw new Error("approval.skip: item not found for org");
      await db
        .update(contentItem)
        .set({ editorialState: "skipped" })
        .where(and(eq(contentItem.orgId, orgId), eq(contentItem.id, itemId)));
      // The optional after-the-fact reason feeds the enrichment loop (CHTS-5 / MEMS-1).
      if (reason && reason.trim().length > 0) {
        await memory.write(reason, {
          orgId,
          source: { trigger: "chat", detail: "skip reason" },
          correctionChannel: true,
        });
      }
    },

    // CHT-2 confirm-back: the founder already confirmed client-side; bind to Memory (CHTS-2 / MEMS-1).
    async redirect(orgId, _itemId, text) {
      const written = await memory.write(text, {
        orgId,
        source: { trigger: "chat", detail: "ready redirect" },
        correctionChannel: true,
      });
      return memView(written[0]);
    },

    // APRS-3: a founder-CONFIRMED rule-proposal → a styleRule/taboo (never a bare fact).
    async proposeRule(orgId, pattern) {
      const written = await memory.write(pattern, {
        orgId,
        source: { trigger: "chat", detail: "accepted rule-proposal" },
        correctionChannel: true,
      });
      return memView(written[0]);
    },

    async compose(orgId, input) {
      // APRS-5: authorship is NOT a bypass — the founder master runs the SAME VAL
      // guardrail chain (LRN-20 LLM judge) as generated content before it lands.
      const master: GeneratedMaster = {
        title: input.title,
        body: input.body,
        reasonLine: input.reasonLine ?? "Founder-composed",
      };
      const judgment = await port.checkGuardrails({ master, overlay: [], isExternal: false });
      const result: DraftResult = {
        master,
        val: {
          outcome: resolveOutcome(judgment.findings),
          findings: judgment.findings,
          judged: judgment.judged,
        },
        attempts: 0,
      };
      const slot = { type: "mission" as const, subject: input.title, designation: "none" as const };
      const item = await persistDraft(db, { orgId, slot, result });

      // A composed post with a picture clears the awaiting_picture gate (GENS-4); without one it stays blocked.
      if (input.mediaAssetId) {
        await db
          .update(contentItem)
          .set({ mediaAssetId: input.mediaAssetId, editorialState: "draft" })
          .where(and(eq(contentItem.orgId, orgId), eq(contentItem.id, item.id)));
      }
      // Per-channel adaptation + the fit gate (GENS-2/GENS-5) — shown for confirmation before publishing.
      await adaptContentItem({ db, port }, orgId, item.id, input.channels);
      const refreshed = await getContentItem(db, orgId, item.id);
      return refreshed ?? item;
    },
  };
}
