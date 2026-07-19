---
kind: challenge-record
spec: specs/mem-org-memory.yaml (MEMS-1..6 — Org Memory behavior; the first buildable spec)
round: 1
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (3-lens panel — design-conformance / implementation-divergence / cheaper-alternative + hidden-assumptions)
---

# MEM spec — round 1 (3-lens panel)

First challenge of a cross-cutting P0 spec → mandatory panel of three parallel
challengers. Verdict **2 fail / 1 pass** → spec stays `draft`; convergence
carried out in the same change-set (rounds r2/r3, DEC-21/DEC-22).

## Lens verdicts

- **Design-conformance — PASS.** No high survived. Explicitly cleared the GR-3
  question: a founder-taboo *block* is not a sensitive-topic *escalate* — GR-3
  is homed outside Memory (guardrails/VAL escalate/SEC-5/EXT-2/DEC-14), so
  folding it into MEMS-3 would itself be an altitude violation. Mediums: the
  STR-3 citation read as if STR-3 enforces Memory taboos (it validates the
  Strategy doc); BIL-2 deletion + SEC-4 unacknowledged; positive-styleRule
  enforcement ambiguous; bare-approval had no natural entry type.
- **Implementation-divergence — FAIL (HIGH-A).** PIPE-2's VAL stage did not
  model taboo enforcement at all — "taboo" appeared zero times in
  llm-pipeline.yaml; the grounded package routed RET→GEN only, never to VAL;
  and org prohibitions had an unreconciled dual home (Strategy §c per STR-4 vs
  a Memory overlay per MEMS-3; CHT-2 wrote to "Memory or Strategy"). MEMS-3's
  central "blocked at the VAL stage" asserted architecture that did not exist.
- **Cheaper-alternative + hidden-assumptions — FAIL (HIGH-B, HIGH-C).**
  HIGH-B: MEMS-3 overclaimed "deterministic … independent of retrieval chance"
  while semantic taboo *detection* at VAL is a probabilistic LLM check with no
  Trust-Level backstop → a silent MEM-1 breach at TL1/TL2. HIGH-C: MEMS-6's
  embedding-keyed asked-set (and MEMS-2's merge) could silently suppress a
  genuinely-different question / merge a distinct fact via a false match.

## Resolution (HITL + cascade — see r2/r3)

Two decisions taken with the founder via AskUserQuestion:
- **DEC-21** — an unconfident taboo check forces human approval regardless of
  Trust Level → new guardrail **GR-8**; PIPE-2 v2 escalation.
- **DEC-22** — Memory is the single source for founder rules/taboos; the
  Strategy §c is a rendered view; the overlay is enforced as a distinct VAL
  gate → PIPE-1/PIPE-2 v2, STR-4 v2, CHT-2 v2.

Spec reworked: "deterministic" scoped to load/inject/route (detection conceded
as a probabilistic LLM check, backstopped by GR-8); MEMS-6 asked-set + MEMS-2
dedup re-keyed deterministically with bias-to-ask / bias-to-not-merge; BIL-2
purge + SEC-4; MEMS-1/MEMS-5 rule-vs-fact conflict resolved.

VERDICT: fail (2 highs: HIGH-A architecture-divergence, HIGH-B/HIGH-C
hidden-assumptions) — resolved by the DEC-21/DEC-22 cascade, re-challenged in r2.
