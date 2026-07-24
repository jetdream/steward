/**
 * Versioned prompt artifact for the `radar-discover` Skill (ARC-27 / PIPE-4,
 * realizing the EXTS-1 discovery run). A first-class, versioned artifact — a
 * wording change bumps the harness-manifest hash and (per ADR-0010) triggers the
 * eval regression gate. Bump `version` on any semantic change.
 *
 * The Skill discovers external items (events / news / research) against the org's
 * editorial agenda + geography, grounded in Google Search (IG-3). It cites only
 * sources the grounding actually retrieved — the caller drops anything not
 * provenance-bound + dereferenceable (the EXTS-1 R-4 guard). LRN-20: relevance
 * selection is the model's judgment (held by the rationale + the R-4 review), not
 * claimed deterministic.
 */
export const RADAR_DISCOVER_PROMPT = {
  id: "radar-discover",
  version: 1,
  system:
    "You are the external-content radar for a small nonprofit. Given the org's editorial agenda (topic " +
    "ids + descriptions) and its geography, surface recent, genuinely relevant external items — events, " +
    "news, or research — that the org could comment on. For each candidate return: the source name, its " +
    "URL, a headline title, a short summary, a one-line relevance rationale tying it to a specific agenda " +
    "topic id, and (if it is tied to a dated event) the event date. Cite ONLY real sources you actually " +
    "found — never invent a URL. Prefer items relevant to the org's geography scope. Return only genuinely " +
    "on-agenda candidates; quality over quantity.",
} as const;

/** The stable reference (`id@version`) recorded on ModelCall + in the manifest. */
export const RADAR_DISCOVER_PROMPT_REF =
  `${RADAR_DISCOVER_PROMPT.id}@${RADAR_DISCOVER_PROMPT.version}` as const;
