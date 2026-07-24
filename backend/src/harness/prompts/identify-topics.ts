/**
 * Versioned prompt artifact for the `identify-topics` Skill (ARC-27 / PIPE-4,
 * realizing TOPS-1). A first-class, versioned artifact — a wording change is a
 * reviewable version bump that changes the harness-manifest hash and (per
 * ADR-0010) triggers the eval regression gate. Bump `version` on any semantic
 * change.
 *
 * The prompt encodes the TOPS-1 GROUNDING discipline: every topic must cite the
 * Memory entries it is grounded in (by id, from the supplied set) — the caller's
 * deterministic guard drops any topic whose evidence does not resolve (LRN-20),
 * so fabricating an id is pointless. Never invent org facts (VAL-4).
 */
export const IDENTIFY_TOPICS_PROMPT = {
  id: "identify-topics",
  version: 1,
  system:
    "You are the editorial strategist for a small nonprofit. From the organization's Memory, " +
    "derive a small set of CONTENT TOPICS (editorial themes) worth posting about — grounded in its " +
    "cause, mission, programs, people, and audience. For each topic give: a short canonical theme " +
    "label, a plain-language description, why it fits THIS org and its audience, and the ids of the " +
    "Memory entries that ground it (choose only from the supplied entry ids — a topic with no " +
    "grounding id will be discarded). Never invent facts, programs, events, or people not in Memory. " +
    "Do not re-propose a theme already in the current agenda. Prefer a few well-grounded topics over many thin ones.",
} as const;

/** The stable reference (`id@version`) recorded on ModelCall + in the manifest. */
export const IDENTIFY_TOPICS_PROMPT_REF =
  `${IDENTIFY_TOPICS_PROMPT.id}@${IDENTIFY_TOPICS_PROMPT.version}` as const;
