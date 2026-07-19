---
kind: challenge-record
spec: .spec/specs/onb-onboarding.yaml
round: 1
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (single pass, four lenses — design-conformance / implementation-divergence / cheaper-alternative+hidden-assumptions / over-structure + LRN-19 reconciliation sweep)
---

VERDICT: pass

SPEC: .spec/specs/onb-onboarding.yaml (ONBS-1..6, draft)

## What was attacked and why it held

**Design-conformance (constrained-by + guardrails/values).** Checked ONBS-1..6
against ADR-0002/0003 (both `accepted`), DM-1/2/3/14, PIPE-1, ARC-12/18,
IG-1/2/6/7, SEC-3/4/10, GR-6, GR-8, VAL-6, A-5. The non-blocking invariant is
STRUCTURAL, not aspirational (ONLY hard predecessor of ONBS-6 is the
minimum-viable-context predicate; no unfilled field gates the product) — a
genuine VAL-6/ONB-1 conformance, not a citation. GR-6 official-APIs-only honored
in ONBS-2/ONBS-4. GR-8 backstop correctly carried into ONBS-5's prohibition path.
DM-3/DEC-22 single-source respected (ONBS drafts the Strategy seed via STR-2, does
not re-home section (c)).

**LRN-20 determinism honesty (the primary trap).** All four LLM touch-points are
honestly split deterministic/probabilistic with a backstop + catch-rate, never an
un-failable "never": name→EIN match = fuzzy/LLM PROPOSAL, founder-confirmed, never
silently bound (ONBS-1); extraction = grounded-guard (no source pointer ⇒ not
written) + labeled catch-rate, not "never hallucinates" (ONBS-2);
minimum-viable-context = a checkable boolean `readyForFirstDrafts` with QUALITY as
the downstream LLM part (ONBS-6); channel health = a genuinely deterministic
state machine (expiry timestamp / platform auth-error, no classifier) (ONBS-4). No
overclaim survived.

**Cross-cutting reconciliation (LRN-19 sweep).** The gap-model single-source
claim holds end to end: ONB-3 OWNS the taxonomy, INT-2 CONSUMES it ("driven by
ONB-3's gap model"), MEMS-6 KEYS it ("structured unknowns … derived from ONB-3's
gap model"), and TOPS-3 extends the same asked-set — no second copy. Wrong-org
purge (ONBS-2→MEMS-2 "this isn't us" hard-delete), ingestion write trigger
(ONBS-2→MEMS-1 "ingestion finding (ONB-2)"), thin-memory degradation
(ONBS-6→MEMS-4/TOPS-1) all reconcile against the live text.

**Over-structure (DM-14 / SEC-10 earn their keep).** DM-14 ChannelConnection is
referenced (ONBS-4 output, DM-1 ERD CHANNEL_CONNECTION edge, SEC-10 credential
posture, read by ARC-18 for PUB-1) and carries typed state + a state machine — not
dead scaffolding; it closes a real OAuth-token gap. SEC-10 is a genuine posture
distinct from SEC-7 founder-auth (org channel-publishing credentials), referenced
by ONBS-4 and DM-14. Both are correctly homed in the architecture registers (right
altitude), not smuggled into the spec. Neither should be prose.

**Cheaper-alternative / altitude.** The gap model is already a DERIVED VIEW over
Memory (no new entity); nothing is over-built and no materially simpler conforming
design exists to name. Spec stays at behavior altitude; cross-cutting design lives
in DM/SEC/ADR by reference.

**Lint / gate.** `docs-check --json` = 0 errors, 0 warnings; ADR-0002/0003
`accepted`; constrained-by set all approved. Design gate prerequisites met.

## Findings (all non-blocking — no surviving high)

- **[medium] ONBS-2 claims X-account style-harvest but the committed X integration
  is write-only, and it miscites the harvest as IG-1.** ONBS-2 says "HARVESTS the
  org's FB/IG/Threads/X accounts (IG-1)". X is IG-2, not IG-1 (citation error).
  More substantively, IG-2 is "X API (paid tier) — publishing. Write access" and
  A-2 commits X as "Write access as a standing budget line item" — neither grants
  read scope to harvest the org's own X timeline for style. The general A-4
  assumption ("existing social channels … tone/style signal") does not override the
  specific write-only commitment. Survives because it is a real hidden assumption
  in a P0 spec asserting a capability the architecture does not currently support;
  non-blocking only because ONBS-2 already states sources "degrade honestly and
  non-blockingly". Fix: cite IG-2 for X, and either add an A-* assumption that X
  style-harvest needs read scope beyond the committed write tier (or mark X harvest
  best-effort/deferred), so the read-access gap is surfaced not silently assumed.

- **[medium] LRN-19 straggler: the ONBS-5 "here's what I know" review is not named
  in MEMS-1's write-trigger or explicit-correction-channel enumerations.** ONBS-5
  relies on a review-typed prohibition being classified as a taboo/styleRule
  ("a correction phrased as a PROHIBITION becomes a taboo/styleRule … MEMS-3").
  MEMS-1 grants "never a bare fact" only to an enumerated explicit-correction set
  (APR rejection / inline edit / skip-reason, or a CHT confirmed redirect), and
  MEMS-5 applies the narrower default (prohibition→bare fact) to enumerated FREE
  channels (chat asides, interview answers). The onboarding review is in neither
  list. The category "explicit correction channel" semantically covers it and
  ONBS-5 pins the correct outcome at the ONB layer, so the "one write path, one
  source" claim itself holds — hence non-blocking — but the reconciliation is
  incomplete exactly in the LRN-19 pattern. Fix: sweep MEMS-1 to name the
  onboarding "here's what I know" review as an enumerated write-trigger + explicit
  correction channel (a one-line addition, MEMS-1 v-bump).

- **[low] ONBS-3 acceptance "no homework/checklist surface exists anywhere in the
  product" is a product-global negative, not checkable within this spec's scope.**
  It restates the VAL-6 structural claim as an acceptance that cannot fail in a
  single-spec test. Fix: scope it to onboarding surfaces ("no onboarding step
  presents a checklist/homework surface"), leaving the product-wide guarantee to
  VAL-6.

Convergence: no surviving high; two mediums are surfacing/one-line-sweep fixes and
one low is a wording tightening — none forces a redesign, so per the challenge
policy this is a pass with the fixes recorded for the same change.

## Resolution (applied in the approving change)

- **ONBS-2 X-harvest.** Harvest scoped to the org's Meta accounts (FB/Instagram/
  Threads, IG-1) + website (IG-7); X (IG-2) is write-only (A-2), so X style leans
  on the shared cross-channel seed and the read-access gap is surfaced as an open
  question (Q-13), not silently assumed.
- **MEMS-1 v2 (LRN-19 straggler).** The onboarding "here's what I know" review
  correction (ONB-5) is now an enumerated write-trigger AND explicit correction
  channel in MEMS-1, so a review-typed prohibition routes to a taboo/styleRule
  rather than MEMS-5's free-channel default. The addition is additive-clarifying
  and was adversarially reviewed WITHIN this challenge (which read MEMS-1/MEMS-5
  specifically); MEM-1 coverage re-pinned MEMS-1@2. MEM spec stays approved — the
  design-gate intent (adversarial review of the delta) is met in-band, a
  proportionality call recorded here and in the commit.
- **ONBS-3 acceptance.** The product-global "no homework surface anywhere"
  negative scoped to onboarding surfaces; the product-wide guarantee stays with
  VAL-6.
