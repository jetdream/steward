---
kind: challenge-record
spec: .spec/specs/ops-console.yaml
round: 1
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (single P1b pass — design-conformance / measurement-boundary / implementation-divergence+hidden-assumptions / cross-cutting reconciliation; LRN-19/20/22 weaponized)
---

VERDICT: fail
SPEC: .spec/specs/ops-console.yaml

FINDINGS:

- [high] The "MEASUREMENT BOUNDARY" reconciliation on OPSS-1 is backwards: silent
  operator QA INFLATES G-2, it does not leave it clean. G-2 (Autonomy proof,
  goals.yaml) is "% of drafts approved WITHOUT edits, measured at an org's week 8
  across the cohort" — its purpose is to prove the SYSTEM produces approvable
  drafts. When operators silently catch/FIX broken drafts BEFORE Ready, the founder
  only ever sees operator-cleaned drafts, so the founder edits fewer of them and the
  approval-without-edit rate rises — measuring system+hidden-operator-labor, not
  autonomy. The spec's own words admit this ("it changes what the founder sees,
  upstream of the measurement point") and then treat it as a defense; changing what
  the founder sees at the measurement point IS how a founder-point metric is
  polluted. The acceptance ("operator QA edits do not register as founder edits")
  guards the wrong direction — nobody would miscount an operator edit as a founder
  edit; the real distortion is that the operator edit is INVISIBLE and thereby masks
  a founder edit that would otherwise have occurred. Worse, cohort 1 is both the
  silent-QA population and G-2's first field cohort, and the per-org dial is turned
  DOWN "as G-2 earns it" — so a confounded signal drives the autonomy-dial decision
  (a self-defeating loop). This survives refutation even on the charitable "operators
  only regenerate, never hand-edit" reading: best-of-N with a human selector, the
  rejects never shown to the founder, still overstates raw system autonomy. Fix:
  measure G-2 on PRE-QA drafts, or explicitly flag/exclude operator-touched drafts
  from the approval-without-edit rate, and surface the confound honestly as a
  limitation/open-question (VAL-3 "nothing hidden", LRN-20) — do not assert "does
  not pollute the metric."

- [high] The "held for silent review before Ready" gate has no home in the data
  model or pipeline it is constrained-by, and contradicts the spec's own "no new
  domain entity" claim (LRN-22 class). DM-5's editorial lifecycle is
  draft -> awaiting_picture -> approved/skipped; a ContentItem in `draft` is exactly
  what APRS-1's readyStack surfaces (and at TL1 auto-approves without the founder
  acting). To HOLD a generated draft out of Ready you need either a new editorial
  state / a QA-status flag on ContentItem (a DM-5 change) or an APR-queue filter (an
  APRS behavior) — but the spec adds neither, declares DM-5 nowhere (see next
  finding), does not depend-on APRS, and PIPE-2's diagram routes FIT -> INB (Ready)
  with no QA stage. "The console is a read/operate view ... No new domain entity"
  cannot be true of a gate that withholds a draft from the founder — that is a
  write/state intervention on the editorial lifecycle. An implementer cannot build
  the mandated silent hold from the cited artifacts as-is; they must invent an
  undeclared cross-cutting state or filter, i.e. silent divergence. Fix: name where
  the hold lives — a DM-5 editorial state/flag (add DM-5 to constrained-by and
  reconcile the state machine + PIPE-2 stage) or an APR-side qa-gate filter (add
  APRS to depends-on and specify the filter) — and drop/qualify the "no new domain
  entity" claim accordingly.

- [medium] constrained-by omits the data-model design-elements the console gates and
  reads. The QA gate is fundamentally a ContentItem (DM-5) lifecycle intervention,
  and the spec also reads DM-6/DM-7 (transcripts) and DM-8 (radar candidates) — all
  architecture design-elements — yet DM-5/DM-6/DM-7/DM-8 appear only in `data` prose,
  never in constrained-by (contrast PUBS and APRS, which both list DM-5). Per
  specs/CLAUDE.md constrained-by cites design-element IDs; a design artifact that
  clearly governs this spec is missing from the graph, so a DM-5 version bump would
  not cascade to this spec. Fix: add DM-5 (at minimum) to constrained-by; add
  DM-6/DM-7/DM-8 as the entities the review surfaces read.

- [medium] Operator identity/authorization and cross-org confidential-data access are
  unspecified, and the cited SEC-7 does not cover them. SEC-7 is FOUNDER auth
  (BetterAuth Google + dev email) — it defines no operator role and no internal
  console access posture; it is not even in constrained-by. Meanwhile the console
  reads ALL orgs' ChatSession transcripts and drafts, which SEC-4 classifies as
  org-provided CONFIDENTIAL data — an internal operator reading every org's
  confidential material is a real privacy posture with no governing element. The SEC
  threat-model pass is deferred, so this need not be fully resolved now, but the spec
  asserts "operator-authenticated (SEC-7)" as though solved. Fix: add an
  open-question naming the deferred operator-auth + cross-org-confidential-access
  posture (SEC-4), and stop citing SEC-7 as the operator-auth basis (or add a SEC
  operator-access element to constrained-by).

Held under scrutiny (attacked, did not break): the LRN-20 deterministic/probabilistic
split is honest (dial state + failure-queue routing/retry deterministic; QA review +
radar-precision sampling human judgment). OPSS-2's failure-queue routing conforms to
PUBS-1 (retry+backoff, alert operators, founder only when action is needed — MEM-2)
and to PIPE-1's model-call-logging-per-org-for-OPS-QA framing. Transcript review vs
INT/DM-6/DM-7 and radar-precision vs R-4/EXT/DM-8 are consistent. The
no-governed-by is honest (internal console originates no org content, so no GR content
guardrail applies). design-scope: cross-cutting is correct and the mechanical gate
(accepted ADR-0002/0003, approved PIPE-1/ARC-22/EXP-10/EXP-37/EXP-50) is satisfied.
Graph is green (docs-check: 0 errors, 0 warnings).
