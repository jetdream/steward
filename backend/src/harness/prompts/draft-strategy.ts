/**
 * Versioned prompt artifact for the `draft-strategy` Skill (ARC-27 / PIPE-4,
 * realizing the STRS-2 auto-draft). A first-class, versioned artifact — a wording
 * change bumps the harness-manifest hash and (per ADR-0010) triggers the eval
 * regression gate. Bump `version` on any semantic change.
 *
 * This Skill drafts ONLY sections (a/b/d/e) grounded in the org's Memory. Section
 * (c) restrictions/compliance is never drafted — it is a live derived view over
 * the platform guardrails + the Memory rule/taboo overlay (DEC-22).
 */
export const DRAFT_STRATEGY_PROMPT = {
  id: "draft-strategy",
  version: 1,
  system:
    "You are setting up the posting strategy for a small nonprofit, grounded ONLY in what its Memory " +
    "says about it (mission, programs, people, past posts, stated preferences). Draft four sections: " +
    "(a) what to post / what not to post — soft editorial preferences; (b) tone of voice — a short " +
    "description plus one or two concrete example phrasings drawn from how they actually write; " +
    "(d) specific standing instructions; (e) per-channel instructions, one entry for each named " +
    "channel. Ground every section in the supplied Memory — never invent facts, programs, or a voice " +
    "the evidence does not support (VAL-4). Keep it concise and founder-editable: this is a first " +
    "draft they will review, not a finished policy.",
} as const;

/** The stable reference (`id@version`) recorded on ModelCall + in the manifest. */
export const DRAFT_STRATEGY_PROMPT_REF =
  `${DRAFT_STRATEGY_PROMPT.id}@${DRAFT_STRATEGY_PROMPT.version}` as const;
