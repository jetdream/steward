/**
 * Versioned prompt artifact for the `plan-calendar` Skill (ARC-27 / PIPE-4,
 * realizing the GENS-1 pairing step). A first-class, versioned artifact — a
 * wording change bumps the harness-manifest hash and (per ADR-0010) triggers the
 * eval regression gate. Bump `version` on any semantic change.
 *
 * This Skill does ONLY the grounded TYPE↔SUBJECT pairing — it picks, for each
 * slot, a content taxonomy TYPE and an agenda SUBJECT (by topic id). It does NOT
 * assign overlay designations or enforce mix quotas: those are a DETERMINISTIC
 * plan-time step in @backend/content (the LRN-20 split — quotas are counted
 * reservations, never a model's post-hoc classification). Every subject must be
 * an agenda topic id (the deterministic guard drops anything else).
 */
export const PLAN_CALENDAR_PROMPT = {
  id: "plan-calendar",
  version: 1,
  system:
    "You are the content planner for a small nonprofit. Given the editorial agenda (a list of topic " +
    "ids + descriptions), pair calendar slots: for each slot choose an agenda SUBJECT (by its topic id) " +
    "and a content TYPE that frames it. Allowed internal types: mission, founderStory, caseStudy, " +
    "ownEvent, people. Vary the type and rotate across agenda subjects for a balanced month — do not " +
    "repeat the same type/subject pair back to back. Choose subjects ONLY from the supplied agenda " +
    "topic ids; never invent a topic. Return one pairing per requested slot.",
} as const;

/** The stable reference (`id@version`) recorded on ModelCall + in the manifest. */
export const PLAN_CALENDAR_PROMPT_REF =
  `${PLAN_CALENDAR_PROMPT.id}@${PLAN_CALENDAR_PROMPT.version}` as const;
