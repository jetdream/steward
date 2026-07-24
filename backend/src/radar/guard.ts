/**
 * The deterministic EXTS-1 R-4 source guard (LRN-20 — structure/policy, not a
 * content judgment). A discovered candidate reaches the mandatory GR-5 citation
 * ONLY if its source is provenance-bound (the URL is one the search GROUNDING
 * actually retrieved, not model-invented) AND dereferenceable (the link resolves).
 * Hallucinated (not-in-sources) and dead links are dropped, never cited.
 */
import type { SearchCandidate } from "../ports/llm.js";

/** Provenance-bound iff the candidate's URL is in the grounding `sources` set (EXTS-1). */
export function provenanceBound(candidate: SearchCandidate, sources: ReadonlySet<string>): boolean {
  return sources.has(candidate.url);
}

/**
 * Keep a candidate only if provenance-bound AND dereferenceable. `deref` is injected
 * (a real HTTP check in prod, faked in tests) so the guard itself stays pure/testable.
 */
export async function applyR4Guard(
  candidates: SearchCandidate[],
  sources: string[],
  deref: (url: string) => Promise<boolean>,
): Promise<SearchCandidate[]> {
  const set = new Set(sources);
  const kept: SearchCandidate[] = [];
  for (const c of candidates) {
    if (!provenanceBound(c, set)) continue; // hallucinated / not grounded → drop
    if (!(await deref(c.url))) continue; // dead link → drop
    kept.push(c);
  }
  return kept;
}
