/**
 * The DETERMINISTIC disposition policy for the Ready spine (APRS-1) — pure, no
 * DB/LLM. The batch-approve filter is the load-bearing invariant: batch approve
 * NEVER clears a pinned/blocked card (held-for-taboo GR-8, sensitive GR-3, veto-
 * window, awaiting-picture GENS-4) — the One-Home invariant (DEC-18).
 */
import type { EditorialState } from "@shared";

/** The card fields the batch filter reads (a projection of the DM-5 ContentItem). */
export interface BatchCandidate {
  editorialState: EditorialState;
  /** VAL escalated (GR-3 sensitive / GR-8 taboo) — forces per-card human approval. */
  escalated: boolean;
  /** Whether a picture is attached (GENS-3/4 — no picture ⇒ cannot approve). */
  hasPicture: boolean;
}

/**
 * APRS-1: is a card eligible for "approve all ready"? Only a plain `draft` that is
 * NOT escalated and HAS its picture. `awaiting_picture` (GENS-4), an escalated
 * hold (GR-3/GR-8), and any non-draft state are DETERMINISTICALLY excluded — never
 * batch-cleared (they still approve individually, per card). Pure.
 */
export function batchEligible(card: BatchCandidate): boolean {
  if (card.editorialState !== "draft") return false; // awaiting_picture/approved/skipped are not batchable
  if (card.escalated) return false; // GR-3/GR-8 held — a human must clear it per card
  if (!card.hasPicture) return false; // GENS-3/4 picture invariant
  return true;
}
