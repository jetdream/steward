---
kind: challenge-record
spec: .spec/specs/int-interviewer.yaml
round: 1
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (single pass — design-conformance / implementation-divergence / cheaper-alternative+hidden-assumptions / cross-cutting-reconciliation LRN-19 sweep)
---

# Architect Challenger — INT (Interviewer) behavior spec, round 1

VERDICT: pass

SPEC: .spec/specs/int-interviewer.yaml (INTS-1..4, draft → intended approved)

## What I attacked and how it held

**Design-conformance.** INTS-1..4 conform in meaning to the constrained-by set
(ADR-0002/0003, DM-2/6/7, PIPE-1, ARC-13) — all cited artifacts are accepted/
approved, and the design is a faithful composition over MEMS + ONBS. The NO
`governed-by` claim is HONEST: GR-8 binds the *generation* VAL gate and GR-3 the
*published-draft* sensitive-topic classifier — neither governs a Memory-gathering
skill that only asks questions and writes through MEMS-1 (itself GR-8-governed).
GR-6 binds ingestion (ONBS), not INT, which reads events from Memory. No hard
guardrail directly binds the questioning skill; the absence is correct, not a dodge.
`design-scope: cross-cutting` is honest (shared Memory, ONB gap model, CHT surface,
shared journeys) — it does not falsely claim local.

**Implementation-divergence / the LRN-20 split (the flagged question).** INTS-1's
framing of conversational QUALITY as probabilistic (content-value heuristic + eval,
explicitly "NOT claimed as a deterministic guarantee") is the HONEST LRN-20 split,
not a dodge: (1) the deterministic parts are correctly enumerated (gating = gap
model + asked-set + shouldAsk, resumability, rate cap); (2) it explicitly disclaims
the deterministic-"never" overclaim LRN-20 warns against; (3) the acceptance is
falsifiable — a checklist-style interviewer fails clause 1, a topic-switching
interviewer fails clause 2. "Curious not a form" is judged by eval, the correct
treatment for a quality (non-safety) property; LRN-20's catch-rate mandate is
scoped to P0 never/always *safety* invariants enforced by a classifier, which this
is not. See LOW-1 for the one soft edge.

**Cross-cutting reconciliation (verified against live text, LRN-19 discipline).**
(a) INTS-2 "single gap model" — ONBS-3 owns the taxonomy ("ONB-3 OWNS / INT
CONSUMES / MEMS-6 KEYS"), MEMS-6 keys it, "no second question list" holds. OK.
(b) INTS-2 free-remark write path — MEMS-1 v2 enumerates "interview answer (INT)"
as a write trigger, and MEMS-5 explicitly lists "interview answers" among the FREE
remark channels taking the narrower default + AssumedNote. INT is genuinely a FREE
channel, NOT an explicit-correction channel — the spec's claim is exact. OK.
(c) INTS-4 open-questions list as a FILTERED VIEW of the gap model (after asked-set
+ shouldAsk), not a stored list — matches ONBS-3's derived-view discipline and the
data section; no collision with ONB (gap model) or CHT (enrichment loop). OK.
(d) SKILL-vs-SURFACE: CHT-5 owns the enrichment loop + surface; INTS scopes INT to
the questioning behavior and defers the disposition entry to CHT-5 in interfaces.
Overlapping acceptance at the seam (both test skip→question) is each spec testing
its own half — clean, not double-claimed.

**Cheaper-alternative / over-structure.** Nothing over-built: the open-questions
list as a derived view (not stored) and the gap model / asked-set as derived
indexes are the cheapest single-source choices. No new register kind/prefix/
itemization. Resumability is structurally robust — "place" is the recomputed gap
model (derived from Memory), so resume survives even without session state; DM-6/7
only hold the transcript.

## Findings

- [medium] INTS-3 acceptance cannot fail on the property that is INT-3's entire
  reason to exist. Its acceptance tests only per-event de-dup ("at most one probe
  tied to it", "not raised again" — both MEMS-6), never the aggregate
  "rate-limited / never spammy" cadence (VAL-6, R-10). An org with many upcoming
  calendar events could receive one probe *per event* and pass every clause while
  spamming the founder — precisely the R-10 churn INT-3 guards. Survives scrutiny
  because the sibling TOPS-3 (same P1a batch, already approved) carries the correct
  clause and INTS-3 is the straggler below the project's own bar. One-line fix
  (apply in the approving change, per the convergence rule): add to INTS-3
  acceptance an aggregate-cadence clause mirroring TOPS-3 — e.g. "probe cadence
  stays within the rate limit even when many calendar events exist" — and, in the
  statement, name that the periodic-probe cadence is a distinct deterministic
  budget (not the INTS-2 per-turn cap, which governs only in-interview turns).

- [low] INTS-1's eval is named but not operationalized. Unlike MEMS-3's catch-rate
  ("at or above the target catch rate" against a labeled set), INTS-1 says only
  "held by an acceptance/eval" with a subjective "reads as a colleague's curiosity"
  clause. Does not block (the criteria can fail in review and the honesty split is
  correct; a hard catch-rate is not required for a quality property), but naming a
  labeled good/bad question-sequence set + a target pass rate would give the eval
  teeth, matching the LRN-20 pattern the project set.

- [low] INTS-3 does not disambiguate from PRO-1 (material requests) — both are
  proactive, event-from-Memory, reason-carrying pushes with near-identical examples
  ("beach cleanup Saturday…" vs "well drilling Monday…"). Content double-ask is
  mitigated (both consult the MEMS-6 asked-set), but aggregate proactive-push
  cadence is unbudgeted *across* INT-3 / PRO-1 / TOP-3 — three per-capability rate
  limits can still stack into a spammy week (R-10). A shared proactive-cadence
  concern is cross-cutting (belongs in PRO/architecture, not INT), so it does not
  block INT; noting so it is not lost — a one-line acknowledgement of the PRO-1
  boundary in INTS-3 would help.

None of the above is a high; per the convergence rule (no surviving high; the one
medium is a one-line fix with a copy-paste sibling precedent) this is a pass, with
the medium applied in the same change that records the verdict.

## Resolution (applied in the approving change)

- **[medium] INTS-3 aggregate cadence.** Statement now names the periodic-probe
  cadence as a DISTINCT deterministic per-org budget (not the INTS-2 per-turn
  cap), and the acceptance gains the aggregate clause mirroring TOPS-3 — probe
  cadence stays within the per-org rate limit even when many events exist (no
  per-event spam). INTS-3 also notes the PRO-1 boundary (low #2 acknowledgement).
- **[low] INTS-1 eval teeth.** Left as-is by design — the LRN-20 honesty split is
  correct and a hard catch-rate is not required for a quality (non-safety)
  property; the criteria remain review-falsifiable.
- **[low] cross-capability proactive cadence (INT-3 / PRO-1 / TOP-3).** Recorded
  as a FUTURE reconciliation for the PRO spec: a shared proactive-push budget so
  three per-capability rate limits cannot stack into a spammy week (R-10). Not an
  INT defect; to be settled when the PRO spec is authored (like the NWS-4↔TOP-4
  note for NWS).
