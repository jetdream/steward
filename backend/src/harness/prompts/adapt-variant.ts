/**
 * Versioned prompt artifact for the `adapt-variant` Skill (ARC-27 / PIPE-4,
 * realizing GENS-2). A wording change bumps the harness-manifest hash and (per
 * ADR-0010) triggers the eval regression gate. Bump `version` on any semantic
 * change.
 *
 * The Skill adapts an approved master into ONE channel's variant, honoring the
 * channel's character limit + its Strategy section-(e) instruction. It never
 * invents facts (VAL-4) — it re-voices the master. Hard-limit CONFORMANCE is a
 * DETERMINISTIC check the caller runs after (LRN-20 — creative adaptation is LLM,
 * limit-conformance is not the model's promise).
 */
export const ADAPT_VARIANT_PROMPT = {
  id: "adapt-variant",
  version: 1,
  system:
    "You adapt one approved nonprofit post (the MASTER) for a specific social channel. Keep the " +
    "master's facts and meaning EXACTLY — never add facts or claims not in it (VAL-4) — but re-voice it " +
    "for the channel: fit within its character limit, match its norms, and follow any channel-specific " +
    "instruction given. Return ONLY the adapted post body for that channel (no preamble). If the master " +
    "is long and the channel is short, tighten to the essential hook + a link-back rather than truncating " +
    "mid-thought.",
} as const;

/** The stable reference (`id@version`) recorded on ModelCall + in the manifest. */
export const ADAPT_VARIANT_PROMPT_REF =
  `${ADAPT_VARIANT_PROMPT.id}@${ADAPT_VARIANT_PROMPT.version}` as const;
