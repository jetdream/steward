---
kind: challenge-record
spec: specs/mem-org-memory.yaml (MEMS-1..6 — Org Memory behavior; post-DEC-21/DEC-22 cascade)
round: 2
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (delta-scoped — verify r1 fixes + attack the reconciliation)
---

# MEM spec — round 2 (delta: verify the DEC-21/DEC-22 cascade)

Delta re-challenge after the architecture cascade. Confirmed the spec-layer
reconciliation is real and correct, but found the propagation incomplete.

## r1 findings — verification

- **HIGH-A (dual-home / VAL routing) — PARTIALLY RESOLVED → the surviving high.**
  PIPE-2 v2 routes the overlay to VAL and names GR-8 (llm-pipeline.yaml); STR-4
  v2 reframes §c as a view; CHT-2 v2 writes to a single source; DEC-22 records
  it; G-2/G-3 coverage re-affirmed. BUT the contradiction sweep missed two live
  approved artifacts still asserting "Memory or Strategy" — see NEW-1.
- **HIGH-B (probabilistic-detection overclaim) — RESOLVED.** MEMS-3 scopes
  determinism to load/inject/route, concedes the detection residual, adds the
  GR-8 backstop (parallel to GR-3, additive/non-short-circuiting), and replaces
  the untestable absolute with a labeled catch-rate + escalation acceptance.
- **HIGH-C (embedding false-match) — RESOLVED for MEMS-6, PARTIAL for MEMS-2.**
  MEMS-6 keys structured gaps deterministically (zero false-match) + bias-to-ask
  on free-form; MEMS-2 gained the deterministic key + bias-to-not-merge but left
  the free-form key undefined — see NEW-2.
- Mediums/lows (BIL-2+SEC-4, MEMS-1/5 rule-vs-fact, bare-approval, assumptions
  in `design`) — RESOLVED.

## New findings (fixed in the change recording r3)

- **[high] NEW-1 — incomplete DEC-22 sweep:** `glossary.yaml` term **Redirect**
  and `experience/spine.yaml` **EXP-19** still wrote a redirect "to Memory or
  Strategy". In an AI-implemented project the glossary is read first, so this
  revived the exact dual-home enforcement ambiguity. Fixed: both reworded to
  Memory-as-single-source (Strategy projects it, DEC-22); EXP-19 → v2; an
  exhaustive re-sweep confirmed no third live artifact remained.
- **[medium] NEW-2 — MEMS-2 free-form merge key undefined:** an entity-level key
  would false-merge "founder is Jane" vs "founder is retiring". Fixed: free-form
  fact/story keyed by the full normalized ASSERTION; acceptance tests it.
- **[low] NEW-3 — bare-approval reinforcement on unmodelled state.** Fixed: named
  a `reinforcedAt` touch on the retrieveContext grounding set, in `data`.
- **[low] NEW-4 — §c-edit path unstated (StrategyDoc vs Memory).** Fixed: STR-4
  v2 routes a direct §c edit to a Memory write (supersession).

VERDICT: fail (one surviving high — an incomplete propagation of DEC-22, not a
design defect) — fixed and re-verified in r3.
