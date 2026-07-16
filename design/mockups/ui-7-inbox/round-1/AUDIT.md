# Design audit — UI-7 inbox, round 1

Audited against: GR-1..6, VAL-3/5/6, G-3/G-4/G-5, DS-1..7, UI-7 (owning
element), UI-2 (weekly-digest journey), APR-1/2/4, GEN-4/5, CHT-2, UX-3/7,
users.md persona. Source-based audit of the full exported file (517 lines);
no rendered screenshot (see PROVENANCE.md).

## Verdict

**Strong conformance — approve as the design direction; one more canvas
round for the findings below before stabilization.** The design grounds on
the AI-1 steward tokens (`_ds` snapshot linked; `var(--accent)` etc.
throughout), the colleague voice is genuinely right, all five trust-chrome
patterns that this screen needs are present and correct, and the UI-2
journey works end-to-end: entry → finite stack → per-item verbs →
completion + streak + what-comes-next. No guardrail violations. No
requirement-altitude inventions (bucket C is empty).

Spec-faithful details worth calling out as *better than asked*: the
awaiting-picture card renders a **disabled** Approve until a photo is
chosen (exactly GEN-4's cannot-schedule rule, made tactile); "Approve all"
deliberately does not sweep the photo-blocked draft; the external item
carries citation + org-perspective commentary (GR-5); only one live accent
CTA exists per viewport state (DS-2 honored dynamically).

## Findings

### A — canvas-safe (fix in round 2, no governance impact)

- **A1. Uppercase micro-labels** ("Reviewed this week", "Heading out this
  week", section kickers) violate the sentence-case rule (DS-3 / substrate
  "no all-caps"). Fix to sentence case — unless the founder prefers to
  legalize small uppercase labels, which would be a DS-3 amendment (see B2).
- **A2. Off-scale font sizes** — 13/15/19/21/34px appear alongside the
  token scale (12/14/16/20/22/28). Snap to scale (DS-1/DS-3).
- **A3. Inlined elevation** — the chat-companion pill hardcodes the
  three-layer shadow values instead of `var(--elev-raised)`; frame-chrome
  shadows around the mockup device frames are presentation-only and exempt.
- **A4. Touch targets** — quiet actions (Edit/Skip/Redirect…) and mobile
  tab items sit under 44px (DS-4). Extend hit areas.
- **A5. Missing card → post-review affordance.** APR-1 requires per-channel
  variant preview; the card's FitBadges show fit but nothing invites the
  founder into UI-8 to inspect variants. Add the affordance (tap target on
  card / a quiet "Review variants" action).
- **A6. Redirect confirm-back state undesigned.** CHT-2 requires the
  system to confirm the redirect back before it binds (the UI-3 trust
  checkpoint); the mockup ends at "Send to Steward". Design the
  confirmation state (inline or via the chat companion).
- **A7. Bottom-left "CC / Weekly digest" block reads as an org switcher.**
  Steward is single-account-per-org (users.md); clarify it as an account
  menu so it doesn't imply a multi-org feature.

### B — design-truth updates (spec-side, then re-ground)

- **B1. Canonize round-1 inventions into UI-7's body** so future rounds and
  sibling screens inherit them: the "Reviewed this week" settled section
  with per-item Undo and scheduled-time lines; the disabled-Approve
  awaiting pattern; conditional "Approve all"; the completion card's
  "heading out this week" schedule list (a bridge to UI-10).
- **B2. Only if the founder prefers keeping uppercase labels:** amend DS-3
  (v bump, DEC required — it loosens a substrate rule). Default is A1.

### C — requirement-altitude changes

None. The design implies no product behavior beyond the approved
requirements.

## Journey fit (UI-2 — weekly digest)

Entry (digest deep link) lands on a finite stack with visible progress;
every APR-1 verb is present per item; the two open gaps in the journey are
A5 (inspection hop to UI-8) and A6 (redirect confirmation). The completion
moment closes the loop with the streak (G-4), the outgoing schedule, and
the system's next moves (VAL-6) — the founder can leave in well under the
G-3 budget with nothing hidden (VAL-3).
