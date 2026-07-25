/**
 * The deterministic rules of the conversation region (CHTS-4/CHTS-5, UXS-2).
 *
 * Two of them, and both are structural guarantees rather than taste:
 * the composer is never blank, and no system-initiated message ships without a
 * reason. Pure and unit-tested; nothing here judges content (LRN-20).
 */

/** One leading affordance offered above the composer. */
export interface Opening {
  /** What tapping it puts in the composer, or what it starts. */
  opening: string;
  /** WHY Steward is offering it — required by CHTS-4, never decorative. */
  reason: string;
  /**
   * `interview` runs the gap-driven interviewer instead of filling the box;
   * `prompt` fills the composer with the text.
   */
  kind: "prompt" | "interview";
}

/**
 * The always-available invitation to be interviewed. Present whenever Steward
 * still has open gaps — it is the leading move that keeps the founder answering
 * rather than composing (CHTS-5).
 */
const INTERVIEW_OPENING: Opening = {
  opening: "Ask me something",
  reason: "there are still things only you can tell me",
  kind: "interview",
};

/**
 * The floor. CHTS-5 forbids a blank composer absolutely, so this must hold even
 * when the server has suggested nothing and every gap is closed — a founder who
 * opens the home to an empty box has met the blank page the whole product
 * exists to remove (VAL-6, DS-6).
 */
const ALWAYS_AVAILABLE: Opening = {
  opening: "What are you working on for us right now?",
  reason: "you can always ask me what I'm doing and why",
  kind: "prompt",
};

/**
 * The openings shown above the composer — NEVER empty (CHTS-5), and every one
 * carrying its reason (CHTS-4).
 *
 * Server suggestions lead because they are computed from what actually changed;
 * the interview invitation follows while gaps remain; the standing question is
 * the floor that makes "never blank" true by construction rather than by the
 * server happening to return something.
 */
export function leadingOpenings(
  suggested: ReadonlyArray<{ opening: string; reason: string }> | undefined,
  hasOpenGaps: boolean,
  limit = 4,
): Opening[] {
  const fromServer: Opening[] = (suggested ?? [])
    // A suggestion without a reason is not shippable (CHTS-4 is a structural
    // gate, so this drops it rather than inventing a reason for it).
    .filter((s) => s.opening.trim().length > 0 && s.reason.trim().length > 0)
    .map((s) => ({ opening: s.opening.trim(), reason: s.reason.trim(), kind: "prompt" as const }));

  const all = [...fromServer];
  if (hasOpenGaps) all.push(INTERVIEW_OPENING);
  if (all.length === 0) all.push(ALWAYS_AVAILABLE);

  // Dedup by the visible text — a server suggestion that happens to match the
  // floor should not appear twice.
  const seen = new Set<string>();
  return all
    .filter((o) => {
      const key = o.opening.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

/**
 * What the composer's primary verb does with what the founder typed.
 *
 * The founder DECLARES this, never a classifier: telling a question from a
 * standing instruction is a semantic judgment, and getting it wrong in the
 * binding direction writes a permanent rule nobody asked for (LRN-20, CHTS-2).
 * `reply` exists because answering an interview question must reach Memory
 * (INTS-2), while asking must not.
 */
export type ComposerIntent = "ask" | "reply" | "redirect";

/** Is there anything to send? Deterministic, and the only send gate. */
export function canSend(text: string): boolean {
  return text.trim().length > 0;
}
