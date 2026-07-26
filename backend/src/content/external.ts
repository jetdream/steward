/**
 * EXTS-2 external drafts — a worth-a-post Radar candidate becomes a DRAFT in the
 * org's voice via the CONTENT ENGINE (LRN-22 ownership: the Radar hands a candidate
 * here, it does not draft). The draft runs the SAME generate → VAL chain as any
 * master, with `isExternal: true` so GR-5 mandatory citation is enforced at VAL and
 * GR-3 sensitive-topic still holds. The result is an external-type ContentItem
 * linked back to its ExternalItem (DM-5 ↔ DM-8 "sourced from").
 *
 * @implements GENS-7 v1  (external drafts enter the same VAL guardrail chain)
 */
import type { ContentItem, OrgId } from "@shared";
import type { Database } from "../db/client.js";
import { retrieveContext } from "../memory/retrieve.js";
import type { LlmPort } from "../ports/llm.js";
import { assembleGrounding, generateDraft } from "./generate.js";
import { persistDraft } from "./store.js";

/** The ExternalItem fields the drafter needs (from the Radar, EXTS-2). */
export interface ExternalSource {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
}

/**
 * Draft a worth-a-post external candidate (EXTS-2): grounded in the source, voiced
 * as the org's PERSPECTIVE (not a rehash), citation-gated (GR-5), and persisted as
 * an external-type ContentItem sourced from the ExternalItem.
 */
export async function draftExternalItem(
  deps: { db: Database; port: LlmPort },
  orgId: OrgId,
  item: ExternalSource,
): Promise<ContentItem> {
  const slot = { type: "relatedNews" as const, subject: item.title, designation: "none" as const };
  const grounding =
    `EXTERNAL SOURCE — you MUST cite it (GR-5): ${item.source} (${item.url})\n` +
    `HEADLINE: ${item.title}\nSUMMARY: ${item.summary}\n\n` +
    `Write the organization's own PERSPECTIVE / commentary tying this to its mission — not a rehash of the news.`;
  // GENS-7 names the active rule/taboo overlay an ALWAYS-ON input to the shared
  // VAL chain, and names external drafts (PIPE-3) as one of its consumers —
  // SOURCING is no more an exemption from GR-8 than AUTHORSHIP is (APRS-5). An
  // empty overlay let an externally-sourced draft violate a rule the founder had
  // already stated. No slot: the check needs the FULL active overlay (MEMS-3 —
  // an indexed read, never a top-k slice); external grounding is supplied above.
  const { overlay } = assembleGrounding(
    await retrieveContext({ db: deps.db, llm: deps.port }, orgId),
  );
  const result = await generateDraft(deps.port, {
    orgId,
    slot,
    grounding,
    overlay,
    isExternal: true,
  });
  return persistDraft(deps.db, {
    orgId,
    slot,
    result,
    isExternal: true,
    sourceExternalItemId: item.id,
  });
}
