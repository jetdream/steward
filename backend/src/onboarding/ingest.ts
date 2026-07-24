/**
 * ONBS-2 source ingestion — scrape the website (IG-7) + harvest Meta (IG-1) and
 * pipe each raw artifact through the ONE Memory write path (MEMS-1) so the
 * extract-memory Skill classifies facts + style, each entry stamped with its
 * source pointer and marked `assumed` for the ONBS-5 review. The StrategyDoc style
 * seed (STR-2/STRS-2) reads these Memory entries when the STR vertical lands
 * (DEC-22 — Memory is the single source; Strategy projects it), so this slice
 * realizes the Memory-write half of ONBS-2. Non-blocking + honest degradation
 * (ONBS-2): a failed/thin source contributes nothing and never throws.
 *
 * @implements ONBS-2 v1  (source ingestion into Memory — the DM-3 StrategyDoc seed lands with STRS-2)
 */
import type { MemoryEntryView, OrgId } from "@shared";
import type { Memory } from "../memory/index.js";
import type { FetchedArtifact, SourceFetchPort } from "../ports/sources.js";

/** Ingestion needs only Memory's write path + the source-fetch port. */
export interface IngestDeps {
  memory: Pick<Memory, "write">;
  sources: SourceFetchPort;
}

/** The public sources to ingest (any subset; each is optional + non-blocking). */
export interface IngestSourcesInput {
  /** Website URLs to scrape (IG-7). */
  siteUrls?: string[];
  /** Meta handles to harvest (IG-1) — deferred until a ChannelConnection lands. */
  metaHandles?: string[];
}

export interface IngestResult {
  /** Artifacts fetched across all named sources. */
  fetched: number;
  /** The active Memory entries written from them (each source-pointed + assumed). */
  written: MemoryEntryView[];
}

/** Drop the server-only embedding — the client-safe MemoryEntry projection. */
function toView(row: { embedding?: unknown } & MemoryEntryView): MemoryEntryView {
  const { embedding: _embedding, ...view } = row;
  return view;
}

/**
 * A fetched artifact is INGESTIBLE only with a resolvable ref AND non-empty text —
 * the deterministic ONBS-2 grounded guard ("an entry with no resolvable source
 * pointer is not written"). Pure, no content judgment (LRN-20).
 */
export function ingestible(a: FetchedArtifact): boolean {
  return a.ref.trim().length > 0 && a.text.trim().length > 0;
}

/**
 * Ingest an org's public sources into Memory (ONBS-2). Fetches each named source,
 * drops non-ingestible artifacts (the grounded guard), and writes the rest through
 * `memory.write` with `assumed: true` + the source ref — extraction + supersession
 * are Memory's (MEMS-1/2). Returns the fetch count + the client-safe written entries.
 */
export async function ingestSources(
  deps: IngestDeps,
  orgId: OrgId,
  input: IngestSourcesInput,
): Promise<IngestResult> {
  const artifacts: FetchedArtifact[] = [];
  for (const url of input.siteUrls ?? []) {
    artifacts.push(...(await deps.sources.scrapeSite(url)));
  }
  for (const handle of input.metaHandles ?? []) {
    artifacts.push(...(await deps.sources.harvestMeta(handle)));
  }

  const written: MemoryEntryView[] = [];
  for (const a of artifacts) {
    if (!ingestible(a)) continue;
    const entries = await deps.memory.write(a.text, {
      orgId,
      source: { trigger: "onboarding-ingest", ref: a.ref, detail: `${a.kind}: ${a.ref}` },
      correctionChannel: false,
      assumed: true,
    });
    for (const e of entries) written.push(toView(e));
  }
  return { fetched: artifacts.length, written };
}
