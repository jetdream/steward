/**
 * Composition root for the source-fetch port (ADR-0003). One real adapter today
 * (the `fetch`-based website scraper + Meta stub); no env selection needed —
 * website scraping requires no credential, and the Meta path stubs until OAuth.
 */
import type { SourceFetchPort } from "../../ports/sources.js";
import { fetchSources } from "./fetch.js";

/** Select the active source-fetch adapter (ONBS-2 ingestion). */
export function createSourceFetch(): SourceFetchPort {
  return fetchSources;
}
