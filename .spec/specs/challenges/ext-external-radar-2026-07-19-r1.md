---
kind: challenge-record
spec: .spec/specs/ext-external-radar.yaml
round: 1
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (single thorough pass — design-conformance / implementation-divergence + hidden-assumptions / cheaper-alternative + cross-cutting reconciliation lenses)
---

# Challenge record — EXT (External Content Radar) behavior, r1

Scope: EXTS-1..5 (draft) implementing EXT-1..5. design-scope cross-cutting;
constrained-by [ADR-0002, ADR-0003, DM-8, PIPE-1, ARC-16, IG-3, EXP-6, EXP-44];
depends-on [MEMS, TOPS]; governed-by [GR-3, GR-5]. Graph green at review
(npx cortex-docs-check: 437 IDs, 0 errors, 0 warnings).

## Findings

### HIGH — PIPE-3 (the dedicated "External Drafts" architecture stage) is uncited AND contradicts the pinned external autonomy model (DEC-26 straggler)

llm-pipeline.yaml carries PIPE-3 (v1, approved), titled "External Drafts":
"External drafts (EXT-2) enter the same chain with mandatory citation (GR-5)
and forced human approval routing (EXT-3)." This is the on-point governing
architecture element for exactly the behavior EXTS-2/EXTS-3 pin, yet:

1. EXTS constrained-by lists PIPE-1 only — not PIPE-3, and not PIPE-2 (the VAL
   stage). `grep -rn PIPE-3 .spec` returns only its own definition: NO spec
   cites it. Every sibling that runs on the VAL chain (MEMS/STRS/GENS/AUTS)
   cites PIPE-2; EXTS-2's own prose says citation/GR-3 are "enforced at the
   PIPE-2 VAL stage" while PIPE-2 is absent from constrained-by. The dedicated
   External-Drafts stage is an orphan.
2. PIPE-3's "forced human approval routing (EXT-3)" is now FALSE. EXT-3/EXTS-3
   is the permanent TL1 cap; under DEC-26/AUTS-1, TL1's default is
   PUBLISH-THEN-TAKEDOWN (auto-publish at the optimal slot, 24h veto) — the
   opposite of "forced human approval" (which is the hold-then-publish reading
   DEC-26 demoted to opt-in). So external content at its permanent cap
   auto-publishes; PIPE-3 says it is routed for human approval. This is a live
   approved-spec-vs-approved-architecture contradiction.

Survives scrutiny: PIPE-3 is titled and bodied for EXT-2 specifically, so it is
not "optional context" the spec may skip — the design gate requires the
governing architecture cited and reconciled. The mischaracterization is not
merely stale post-DEC-26: TL1 never meant forced-approval (AUT-1), so PIPE-3
conflated the TL1 cap with approval-first from the start; DEC-26's
publish-then-takedown default only sharpens the error. Per LRN-22 a
spec-vs-architecture conflict must be resolved (conform the spec, or fix the
architecture via a design pass + cascade), never left silent; per LRN-19 the EXT
spec approval is exactly where this DEC-26 straggler should be caught.

Fix: bump PIPE-3 -> v2, dropping "forced human approval routing" and instead
stating external drafts are cited (GR-5), sensitive-gated (GR-3), and autonomy
permanently TL1-capped (EXT-3 / AUTS-2), enter the same VAL chain (PIPE-2), and
publish per the TL veto model (DEC-26); add PIPE-2 and PIPE-3 to EXTS
constrained-by; re-run the graph and cascade any citers.

### MEDIUM — EXTS-1's "resolvable source" deterministic guard is underspecified against R-4/GR-5 (hallucinated-URL risk)

EXTS-1: "no candidate is emitted without a resolvable source (for the GR-5
citation downstream)"; acceptance "no candidate lacks a resolvable source." The
v0 engine is Gemini + Google-Search grounding, which can emit a well-formed URL
that does not actually support the claim (or is model-fabricated in text vs the
grounding metadata). A reasonable impl reads "resolvable" as "a source URL field
is present" (non-empty string) and passes a hallucinated/dead link — which then
becomes the mandatory GR-5 citation, i.e. the exact R-4 reputation failure the
spec claims to mitigate. This is the LRN-20 honesty test: the deterministic part
must be honestly strong. Non-blocking on its own; a one-line tightening.

Fix: define "resolvable" as bound to the search-grounding provenance (a URL the
grounding actually returned/dereferenced), not a model-emitted string, and make
the acceptance assert a hallucinated/non-dereferenceable-source candidate is
dropped.

### LOW — EXTS-4 restates the EXT-4 feed/engine enumeration (altitude/reference smell)

EXTS-4 re-lists Google News RSS + newsdata.io + GDELT + arXiv + Perplexity +
Tavily/Exa verbatim from EXT-4/A-3. The spec's load-bearing content is the
invariant ("same ADR-0003 port, same agenda-driven query model, never a bespoke
path"; "a banned topic suppresses its discovery"). The enumeration could
reference EXT-4/A-3 rather than restate. Minor; P1/deferred.

### LOW — depends-on / interface seam for the worth-a-post drafting handoff

depends-on is [MEMS, TOPS]; EXTS-2 hands drafting to GENS (toDraft) and EXTS-3
defers cap enforcement to AUTS-2. Omitting GENS/AUTS is consistent with the loose
house convention (GENS reads EXT but omits it too), so not a defect on its own —
but note GENS's interface list has no explicit external-item draft entry point
for the EXTS "worth a post" (time-sensitive, prioritized) immediate handoff,
which reads distinct from GENS-1's scheduled rolling planner. Confirm the seam is
covered (a prioritized external slot vs an ad-hoc draft path) when GEN code lands.

## Attacked and held (no finding)

- DM-5 <-> DM-8 "sourced from" link (EXTS-2): REAL — present in the data-model
  ERD (CONTENT_ITEM }o--o| EXTERNAL_ITEM : "sourced from"). Refuted.
- EXTS-1 agenda/strategy consumption vs TOPS: getAgenda + strategyFor match
  TOPS interfaces; "discover against per-topic strategy, never a static cause
  seed" matches TOPS-2; cold-start cause-level bootstrap matches TOPS-1 thin-
  Memory + the TOP-1<->EXT-1 bootstrap loop. Held.
- EXTS-2 ownership (content engine drafts, EXT does not, LRN-22): GENS-1 owns
  external-type taxonomy slots + saved-pool reserve; matches. Held.
- EXTS-3 permanent TL1 cap: no double-ownership — explicitly defers enforcement
  to AUTS-2 ("the same cap AUTS-2 enforces"); AUTS-2 owns it (EXT-3, SEC-5).
  Held.
- EXTS-5 saved pool / triage-refines-TOPS-2 / pull-only: matches GENS-1 reserve
  + freshness rule, TOPS-2 refinement, and UXS-8/EXP-44/EXP-6 pull-only-no-badge
  (never badged/counted/nudged). Held.
- LRN-20 splits (scheduling/grounding/TL1-cap/pull-only deterministic; candidate
  selection LLM+precision review) are honestly stated, no un-failable "never".
  Held (except the resolvable-source precision, medium above).
- Requirement coverage: EXT-1..5 each implemented with a checkable acceptance;
  EXT-4/EXT-5 P1 deferrals honestly scoped (Q-4 open). Held.

A single surviving HIGH forces fail.

VERDICT: fail
