---
kind: challenge-record
spec: .spec/specs/cht-agentic-chat.yaml
round: 2
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (delta re-challenge — verify r1 HIGH [GR-2 ungated answer surface] + r1 MEDIUM [un-failable "never fabricates"] fixes; attack changed sections fresh)
---

# Architect Challenger — CHT (Agentic Chat) behavior spec, round 2 (delta)

VERDICT: pass

SPEC: .spec/specs/cht-agentic-chat.yaml (CHTS-1..5, draft)

## Prior-finding verification

### r1 HIGH — GR-2 binds the chat ANSWER surface but nothing enforced it. RESOLVED.
- `governed-by: [GR-2]` now declared at file level; cortex docs-check accepts it, graph 0 errors.
- CHTS-1 gains an explicit GR-2 ENFORCEMENT block: the answer surface is a direct LLM
  output to the founder that never enters the publish queue and so never passes the PIPE-2
  VAL chain — the spec states this is exactly why GR-2 must be enforced HERE. A legal/tax
  question is DECLINED, not answered.
- GR-2's REAL text has two clauses (verified against guardrails.yaml GR-2 v1): (1) "never
  give legal or tax advice"; (2) "Charitable-solicitation registration remains the org's
  responsibility (ToS)." The decline message reflects BOTH: "I can't advise on legal or tax
  matters — that's for your accountant or lawyer; keeping your charitable-solicitation
  registration current stays your org's responsibility." Second clause is not dropped.
- Acceptance now has a concrete GR-2 clause: "can we deduct this?" / "how do we register to
  solicit in State X?" are DECLINED with a redirect, not answered. The clause can fail
  (a conforming impl that answered would fail it), closing the untestable-gate hole.
- LRN-20 honesty: detection is framed as an LLM classifier (like GR-3's sensitive-topic
  check) with a residual miss rate held by a catch-rate on a labeled set — "the discipline
  is decline-on-detection, honestly NOT an un-failable 'never advises'." This is the honest
  split, not a new absolute. The move-2 deterministic backstop of LRN-20 (escalate to a
  human on low confidence) is structurally N/A here and correctly absent: the chat answer
  surface is direct-to-founder with no downstream queue, so there is no independent human
  gate to escalate to (unlike GR-8/MEMS-3 where auto-publish removes the human). Consistent
  with INTS-1's review-falsifiable no-backstop framing.

### r1 MEDIUM — "never a fabricated answer" un-failable absolute. RESOLVED.
- CHTS-1 statement now: grounding "is held by a catch-rate target on a labeled set — the
  honest LRN-20 split, NOT an un-failable 'never fabricates'." Acceptance: "the grounding
  and decline properties are measured by catch-rate on labeled sets, not asserted as
  absolutes." Mirrors MEMS-3(a)'s "labeled adversarial catch rate" and MEMS-4's grounding
  framing. The residual "NEVER bluffed (VAL-4)" is design-intent citing a value, backed by
  the catch-rate acceptance — same construction the r1 record already accepted for MEMS-4.

## New attack on the changed sections — what held

- **GR-8 analogy accuracy.** Design section: GR-2 is "a distinct decline gate ... analogous
  to how GR-8 gives the taboo overlay its own VAL gate for the publish path." Verified
  against GR-8 v1: GR-8 IS "a distinct deterministic gate at the pipeline VAL stage
  (PIPE-2)" for the taboo overlay on the publish path. The analogy (its-own-gate-for-a-
  path-that-bypasses-the-general-chain) does not misstate GR-8. Held.
- **CHTS-3 inheritance omits GR-2.** The enumeration "GR-1/GR-3/GR-5/GR-6 downstream" is
  illustrative; the governing claim is "same GEN/PUB/AUT pipelines (guardrails at VAL,
  PIPE-1)," which carries the full GR chain including GR-2 for any draft-creating command.
  Not a gap. Held.
- **No new un-failable "never".** The decline framing is explicitly disclaimed as not
  un-failable; the fabrication framing is reframed to catch-rate. No new absolute
  introduced. Held.
- **r1 cross-reconciliation (a–e)** untouched by the fix (governed-by + CHTS-1 wording
  only); not re-litigated.

## Improvement note (non-blocking — does not force fail)

- [low] CHTS-1's GR-2 gate specifies decline-on-DETECTION + a catch-rate, but is silent on
  the fail-safe POSTURE (when the classifier is uncertain, err toward declining). This is
  the direct-to-founder analogue of GR-8's "cannot confidently clear ⇒ escalate," and would
  complete the LRN-20 framing. It does NOT block: the catch-rate target already governs the
  miss rate, and the r1 high (total absence of any gate) is genuinely closed. One-line fix
  if desired: add "when the classifier cannot confidently clear a question as non-legal/tax,
  it DECLINES" to the CHTS-1 GR-2 block.

Convergence rule: no surviving high; a single one-line-fix low ⇒ pass.

VERDICT: pass
