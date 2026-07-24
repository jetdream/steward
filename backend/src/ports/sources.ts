/**
 * @module @backend/ports/sources — the source-ingestion port (ADR-0003)
 *
 * Reads an org's PUBLIC presence for onboarding ingestion (ONBS-2): the website
 * (IG-7) and the org's Meta accounts — FB/Instagram/Threads (IG-1). It returns raw
 * text ARTIFACTS each with a resolvable source pointer; turning them into typed
 * Memory entries is Memory's job (the extract-memory Skill), never this port's —
 * the port only FETCHES. No vendor type leaks past it (ADR-0003); official
 * platform APIs only (GR-6); only public presence under signup consent (SEC-3).
 */

/** One fetched source artifact — raw readable text plus its resolvable provenance pointer. */
export interface FetchedArtifact {
  /** Resolvable pointer to the artifact (page URL / post permalink) — the ONBS-2 source ref. */
  ref: string;
  /** The readable text (HTML stripped) the extract-memory Skill mines for facts + style. */
  text: string;
  /** Which source produced it — for provenance detail + honest degradation. */
  kind: "website" | "meta-post";
}

/** Reads an org's public presence for ONBS-2 ingestion (implemented by `../adapters/sources/`). */
export interface SourceFetchPort {
  readonly name: string;
  /** Scrape a website URL to readable text (IG-7). Best-effort: a failed/thin fetch returns []. */
  scrapeSite(url: string): Promise<FetchedArtifact[]>;
  /**
   * Harvest the org's Meta posts — FB/Instagram/Threads (IG-1). The real harvest
   * needs a connected channel (DM-14, ONBS-4) + Meta OAuth, so the current adapter
   * returns [] until that lands; the `handle` param is provisional and firms with
   * the ChannelConnection. Official APIs only (GR-6).
   */
  harvestMeta(handle: string): Promise<FetchedArtifact[]>;
}
