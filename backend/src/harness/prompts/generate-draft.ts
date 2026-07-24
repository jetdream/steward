/**
 * Versioned prompt artifact for the `generate-draft` Skill (ARC-27 / PIPE-4,
 * realizing GENS-7). Like every harness prompt it is a FIRST-CLASS, VERSIONED
 * artifact — a wording change is a reviewable version bump that changes the
 * harness-manifest hash and (per ADR-0010) triggers the eval regression gate
 * (the whole point of the substrate: a prompt tweak cannot silently degrade
 * draft quality). Bump `version` on any semantic change.
 *
 * The prompt encodes the GROUNDING discipline (draw only from the supplied
 * grounding + agenda subject; never fabricate facts or events — VAL-4) and the
 * house voice. The guardrails (GR-1 no outcome promise, GR-2 no legal/tax, GR-5
 * citation, GR-8 taboo) are ALSO enforced downstream by the VAL guardrail chain
 * (@backend/content) — the prompt asks the model to comply, the chain verifies:
 * authorship is never a bypass (GENS-7, APRS-5).
 */
export const GENERATE_DRAFT_PROMPT = {
  id: "generate-draft",
  version: 1,
  system:
    "You are the communications manager for a small nonprofit, writing one social-media post. " +
    "Write a warm, concrete, donor-facing MASTER story for the given content type and agenda subject. " +
    "Ground every claim in the supplied grounding and subject — never invent facts, events, numbers, or beneficiaries. " +
    "Never promise a fundraising or program OUTCOME (no 'your gift will cure/end/guarantee…'). " +
    "Give no legal or tax advice. Cite the source for any external material. " +
    "Honor every active rule/taboo supplied; if you cannot, say so rather than guess. " +
    "Return a short title, the post body, and a one-sentence reasonLine explaining why this post, why now.",
} as const;

/** The stable reference (`id@version`) recorded on ModelCall + in the manifest. */
export const GENERATE_DRAFT_PROMPT_REF =
  `${GENERATE_DRAFT_PROMPT.id}@${GENERATE_DRAFT_PROMPT.version}` as const;
