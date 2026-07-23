/**
 * Deterministic canonical-subject keying (MEMS-2 dedup / MEMS-6 asked-set).
 * ZERO false-match by construction — a pure string function, never embedding
 * proximity. Two writes collapse (merge) only on an identical key; anything
 * else stays separate (bias-to-not-merge, MEMS-2).
 *
 * - STRUCTURED (person / program / event): key = `kind + normalized subject`,
 *   so "our founder is Jane" and "our founder is retiring" (same subject) share
 *   a key and the later corrects the earlier (supersession), while two
 *   different people never collide.
 * - FREE-FORM (fact / story) and RULES (styleRule / taboo): key = `kind +
 *   normalized full assertion`, so two DIFFERENT claims never merge.
 */
import type { MemoryEntryKind } from "@shared";

const STRUCTURED: ReadonlySet<MemoryEntryKind> = new Set(["person", "program", "event"]);

/** Lowercase, collapse whitespace, strip trailing sentence punctuation. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!?;,]+$/, "")
    .trim();
}

/** The canonical dedup/asked-set key for an entry (MEMS-2/MEMS-6). */
export function subjectKey(
  kind: MemoryEntryKind,
  subject: string | undefined,
  content: string,
): string {
  const basis = STRUCTURED.has(kind) ? (subject ?? content) : content;
  return `${kind}:${normalize(basis)}`;
}
