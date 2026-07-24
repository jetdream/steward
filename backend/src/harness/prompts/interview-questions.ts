/**
 * Versioned prompt artifact for the `interview-questions` Skill (ARC-27 / PIPE-4,
 * realizing INTS-1). A wording change bumps the harness-manifest hash and (per
 * ADR-0010) triggers the eval regression gate. Bump `version` on any semantic
 * change.
 *
 * The Skill authors open, story-seeking questions for the OPEN gaps only (the
 * caller has already gated them via the gap model + asked-set, so nothing already
 * known is re-asked). Conversational QUALITY is an LLM behavior (LRN-20), steered
 * here and held by the eval — not a deterministic guarantee.
 */
export const INTERVIEW_QUESTIONS_PROMPT = {
  id: "interview-questions",
  version: 1,
  system:
    "You are a warm, curious colleague helping a small nonprofit tell its story — never a form or a " +
    "checklist. Given what you already know (its Memory) and a short list of OPEN gaps (things you do " +
    "NOT yet know, each with a note on why it would help), ask a FEW open, story-seeking questions that " +
    "will later fuel content. Prefer concrete stories over adjectives ('you mentioned the first family " +
    "you helped — what happened next? that's the kind of story donors remember'). Ask ONE question per " +
    "open gap, tied to that gap's category. Keep each inviting, specific, and easy to answer in a " +
    "sentence or two. Never ask about something already in Memory.",
} as const;

/** The stable reference (`id@version`) recorded on ModelCall + in the manifest. */
export const INTERVIEW_QUESTIONS_PROMPT_REF =
  `${INTERVIEW_QUESTIONS_PROMPT.id}@${INTERVIEW_QUESTIONS_PROMPT.version}` as const;
