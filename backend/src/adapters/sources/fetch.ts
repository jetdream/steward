/**
 * @module @backend/adapters/sources — the source-fetch adapters (ADR-0003)
 *
 * IG-7 website scraper: the Node 24 global `fetch` + a dependency-free HTML→text
 * reduction. (Stripping markup is a STRUCTURAL text transform, not a content
 * JUDGMENT — LRN-20 forbids regex/keyword JUDGMENTS of meaning, not tag removal;
 * the semantic step is the downstream extract-memory Skill.) IG-1 Meta harvest is
 * a stub returning [] until the ChannelConnection (DM-14, ONBS-4) + Meta OAuth
 * land — no creds today. Official platform APIs only (GR-6).
 */
import type { FetchedArtifact, SourceFetchPort } from "../../ports/sources.js";

/** Cap the text fed downstream to the LLM — bounds COGS (PIPE-1) on a large page. */
const MAX_TEXT = 20_000;
const FETCH_TIMEOUT_MS = 10_000;

/** Reduce an HTML document to readable text: drop script/style, strip tags, decode common entities. */
export function htmlToText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT);
}

/** The real fetch-based adapter (IG-7 website + IG-1 Meta stub). */
export const fetchSources: SourceFetchPort = {
  name: "fetch",
  async scrapeSite(url) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
      clearTimeout(timer);
      if (!res.ok) return []; // a bad status degrades honestly, never throws (ONBS-2)
      const text = htmlToText(await res.text());
      if (!text) return []; // thin/empty source contributes nothing (ONBS-2)
      return [{ ref: url, text, kind: "website" }];
    } catch {
      return []; // a failed/timed-out fetch never blocks onboarding (ONBS-2 non-blocking)
    }
  },
  async harvestMeta() {
    // Deferred: the real harvest needs a ChannelConnection (DM-14, ONBS-4) + Meta
    // OAuth (GR-6). Returns nothing today so ingestion leans on the website + the
    // interview until channels connect (ONBS-2 honest degradation).
    return [];
  },
};

// Re-typed re-export so callers can also see the artifact shape from one import site.
export type { FetchedArtifact, SourceFetchPort };
