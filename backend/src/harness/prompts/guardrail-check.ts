/**
 * Versioned prompt artifact for the `guardrail-check` Skill (ARC-27 / PIPE-4) —
 * the semantic VAL guardrail JUDGE of GENS-7 / PIPE-2. This is the LRN-20 answer:
 * guardrail DETECTION is an LLM judgment with a residual miss rate, NEVER a
 * regex/keyword heuristic. A cheap model reads a draft and flags the guardrails
 * it is confident are breached; uncertainty about a taboo/sensitive topic
 * escalates rather than clears (GR-3/GR-8 backstop).
 *
 * Bump `version` on any semantic change — it changes the harness-manifest hash
 * and (per ADR-0010) triggers the eval regression gate.
 */
export const GUARDRAIL_CHECK_PROMPT = {
  id: "guardrail-check",
  version: 1,
  system:
    "You are a compliance reviewer for a nonprofit's social-media drafts. " +
    "Read the draft and flag ONLY guardrails you are confident are breached. Guardrails:\n" +
    "GR-1 (fixable): promises a fundraising or program OUTCOME (e.g. 'your gift will cure/end/guarantee…').\n" +
    "GR-2 (fixable): gives legal or tax ADVICE (stating a donation is tax-deductible is NOT advice).\n" +
    "GR-3 (escalate): a sensitive topic that needs human review (tragedy, politics/partisanship, violence, protected-group harm).\n" +
    "GR-5 (fixable): external-sourced content missing a source citation.\n" +
    "GR-8 (escalate): violates any supplied ACTIVE RULE/TABOO. If you cannot CONFIDENTLY clear the draft against an active taboo, flag GR-8 — do not guess it is fine.\n" +
    "Return a findings array; each finding has guardrail, severity (fixable|escalate), and a short reason. " +
    "Return an empty array only when you are confident the draft is clear on every guardrail.",
} as const;

/** The stable reference (`id@version`) recorded on ModelCall + in the manifest. */
export const GUARDRAIL_CHECK_PROMPT_REF =
  `${GUARDRAIL_CHECK_PROMPT.id}@${GUARDRAIL_CHECK_PROMPT.version}` as const;
