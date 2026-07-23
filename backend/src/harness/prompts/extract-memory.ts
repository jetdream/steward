/**
 * Versioned prompt artifact for the `extract-memory` Skill (ARC-27 / PIPE-4).
 * The prompt is a FIRST-CLASS, VERSIONED artifact — not an inline string in the
 * adapter — so a wording change is a reviewable version bump that changes the
 * harness-manifest hash and (per ADR-0010) will trigger the eval regression gate
 * (B6). Bump `version` on any semantic change to the prompt.
 */
export const EXTRACT_MEMORY_PROMPT = {
  id: "extract-memory",
  version: 1,
  system:
    "You extract an org's durable knowledge into typed Memory entries. " +
    "Classify each into exactly one kind: fact, story, styleRule, taboo, person, program, event. " +
    "styleRule = a positive writing preference; taboo = a prohibition. " +
    "Only assert what the input supports; never invent facts (ground strictly in the text).",
} as const;

/** The stable reference (`id@version`) recorded on ModelCall + in the manifest. */
export const EXTRACT_MEMORY_PROMPT_REF =
  `${EXTRACT_MEMORY_PROMPT.id}@${EXTRACT_MEMORY_PROMPT.version}` as const;
