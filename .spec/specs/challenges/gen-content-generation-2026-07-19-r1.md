---
kind: challenge-record
spec: .spec/specs/gen-content-generation.yaml
round: 1
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (single thorough pass — design-conformance / implementation-divergence / cheaper-alternative+hidden-assumptions / LRN-19 + LRN-20 sweep)
---

# GEN (Planning & Content Generation) — challenge record, round 1

Attacked GENS-1..6 against constrained-by (ADR-0002/0003, DM-2/3/4/5/8/10/14,
PIPE-1, PIPE-2, ARC-15), governed-by (GR-1/3/4/5/8), depends-on (MEMS, STRS,
TOPS), and requirements GEN-1 v4 / GEN-2..6, STW-1, PUB-2, PRO-1. Weaponized
LRN-20 (honest deterministic/probabilistic split), LRN-19 (reconciliation
straggler sweep), DEC-22 (Memory single source), DEC-23 (agenda single source).
docs-check graph is green (errors: [], warnings: []) — every finding below is
semantic and invisible to lint (the LRN-19 "green graph is not evidence of a
single-homed concept" case).

## Findings

### HIGH-1 — GENS-2/GENS-5 channel-fit ordering INVERTS its cited architecture PIPE-2
GENS-5 states, as a firm rule, "The fit gate runs BEFORE adaptation (GENS-2
produces variants only for channels that pass)"; GENS-2 restates it ("per-channel
VARIANTS ... for every CONNECTED channel that passes the fit gate"). The cited
constrained-by architecture PIPE-2 (Draft Generation Flow) sequenceDiagram runs
the OPPOSITE order:
  GEN->>GEN: master + per-channel variants (GEN-2)   [ALL channels]
  GEN->>VAL: validate every variant
  VAL->>FIT: per-channel fit verdicts                [GEN-5, AFTER variants]
i.e. adaptation precedes the fit gate, and variants are generated for channels
that are only fit-scored afterward. This is a meaning-level contradiction, not a
citation nit: the two flows produce DIFFERENT variant sets (PIPE-2 adapts then
discards; GENS adapts only survivors) and place VAL over different scopes, with a
real COGS delta (the spec's own <$25/org/month constraint) — LLM adaptation for
channels that will be skipped. A spec may not contradict an approved architecture
doc it is constrained-by; the lower layer may only tighten, and inverting a
sequence is not a tightening. GENS-5's flow is arguably the better design, which
means the correct fix is upstream: update PIPE-2's sequence to fit-before-adapt
via the design pass (cascading DM-5 "per-variant fit verdicts" — a skipped channel
has no variant to carry a verdict, so the skip-reason home needs restating too),
THEN conform the spec. As written, approving GENS bakes a spec/architecture
contradiction into the approved set. Blocks approval.

### MEDIUM-1 — Mix-quota "deterministic" claim is under-pinned; LRN-20 trap risk
GENS-1 asserts "MIX QUOTAS are DETERMINISTIC calendar-level constraints enforced
at plan time" with acceptance "any rolling 4-week window contains >=1
impact/gratitude POST and <=25% asks (a deterministic quota check, not an LLM
hope)." But Impact/Gratitude and Fundraising Asks are, per GEN-1 v4 and STW-1,
OVERLAYS "woven through the mix" — NOT base taxonomy types; GENS-1's own taxonomy
parenthetical lists only {mission, founder, case, event, people | external
event/news/research} and omits the overlays. The quota is only deterministic if
the planner assigns the overlay as a PLAN-TIME slot designation (a scheduling
attribute counted at plan time). The spec never states this, so a reasonable impl
could classify generated content post-hoc (an LLM judgment) while claiming to
satisfy "deterministic quota check" — and the acceptance, phrased over the realized
"post"/"asks", reads as measuring content, not plan designations. This is the
LRN-20 class MEMS was failed for: honestly split reservation (deterministic —
the planner reserves >=1 impact/gratitude slot and <=25% ask slots per window)
from realization (soft — whether the generated prose faithfully honors its overlay
designation is a VAL fit). Fix: state overlays are a plan-time slot-designation
dimension orthogonal to base type; the quota counts designations (deterministic);
faithful realization is a soft VAL fit.

### MEDIUM-2 — "rolling 4-week" window semantics undefined across plan boundaries
GENS-1 tightens GEN-1's "per 4 weeks" to "per rolling 4 weeks" and asserts "any
rolling 4-week window contains >=1 impact/gratitude post." A 4-week planner that
enforces ">=1 per plan block" does NOT satisfy a true sliding-window invariant:
impact at the START of block N and the END of block N+1 leaves a ~8-week gap that
a trailing 28-day window would flag, yet per-block counting passes. Fix: pin that
the quota is enforced over a trailing sliding window seeded from already-scheduled
history (the planner reads the last 4 weeks of scheduled overlay designations at
each replan), not per-independent-block — or, if calendar-aligned blocks are the
intent, drop "rolling" and say so.

### MEDIUM-3 — constrained-by omits the approved experience elements governing GENS-4/5
GENS-4 conforms in detail to EXP-16 (awaiting-picture: dashed warn slot, disabled
Approve until resolved, one-tap attach, no-match hands off to EXP-22) and GENS-5's
skip-reason renders on the EXP-2/EXP-16 card states — all cited in prose, but the
file-level constrained-by lists no EXP-* design-element (the sibling STRS cites
EXP-42 for its analogous surface). Since these approved experience elements govern
the state behavior GENS-4/5 realize, they belong in constrained-by. Fix: add EXP-16
(and EXP-2) to constrained-by.

### LOW-1 — governed-by vs design GR set mismatch
The design section invokes "platform guardrails (GR-1..GR-6, sensitive-topic GR-3)"
but governed-by cites only GR-1/3/4/5/8, omitting GR-2 (no tax/legal advice —
plausibly relevant to fundraising-ask generation) and GR-6. GR-6 is a publishing
concern (fine to omit); GR-2 either belongs in governed-by or the design prose
should be reconciled to the narrower set.

### LOW-2 — GENS-5 "hard Strategy prohibition = deterministic skip" over-generalizes STRS-3
GENS-5 keys a "hard Strategy prohibition (STRS-3)" as a DETERMINISTIC skip. STRS-3
makes section (e) a blanket HARD gate, but a SEMANTIC section-(e) rule ("no
political content on X") is an LLM classification, not a deterministic check; only
structural/technical limits (length/format, PUB-2) are deterministic skips. Scope
the "deterministic skip" claim to structural/technical limits; semantic channel-fit
is the LLM side, with the always-surfaced reason as its backstop.

### LOW-3 — interfaces mislocates the GEN-3 gate as a scheduling gate
interfaces names schedulable(item) as "the GEN-3 picture gate," but DM-5's state
machine enforces the picture requirement at the awaiting_picture -> approved
(editorial) transition (invariant 1), with scheduling gated downstream on approval.
GENS-4 already references "disabled Approve," so align the interface prose: the
picture gates APPROVAL; scheduling is downstream of approval.

## What was attacked and held
- GENS-1 subject-from-agenda vs GEN-1 v4 + TOPS-4 (DEC-23): consistent — agenda
  supplies WHAT, taxonomy HOW; subject traces to a TOPS-4 topic. Held.
- GENS-2/GENS-5 "variant only for connected channels (DM-14)" vs ONBS-4/DM-14
  (zero connections -> drafts still flow, publishing waits): consistent. Held.
- GENS-3/GENS-4 no-picture gate as deterministic: genuinely deterministic (an FK
  presence check), honest LRN-20 split — no overclaim. Held (aside from LOW-3
  altitude note).
- GENS-4 awaiting-picture vs EXP-16 + PRO-1: matches the approved state design and
  the PRO-1 material-request path. Held (aside from the MEDIUM-3 citation gap).
- Saved-pool freshness (prefer fresh, never auto-draft a passed event-tied save,
  ReasonLine credit) vs DM-8 v2 / DEC-20: consistent. Held.
- Design-scope: cross-cutting: honest (touches Memory, Strategy, Radar, Publishing,
  experience). Held.
- GR-8 taboo / GR-3 sensitive / GR-4 visuals / GR-5 external governed-by: right
  altitude. Held.

VERDICT: fail
