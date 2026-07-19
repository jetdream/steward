---
kind: challenge-record
spec: .spec/specs/ext-external-radar.yaml
round: 2
date: 2026-07-19
verdict: pass
by: "cortex:architect-challenger (delta re-challenge — verify r1 fixes + fresh attack on changed sections — PIPE-3 v2, EXTS-1 provenance guard, EXTS-4 reference, depends-on)"
---

# Challenge record — EXT (External Content Radar) behavior, r2 (delta re-challenge)

Scope: verify the four r1 fixes against live text (no new contradiction), then
attack only the changed sections fresh. r1-held checks (DM-5<->DM-8 link,
agenda/cold-start match, EXTS-3 no double-ownership, EXTS-5 pull-only) not
re-litigated. Graph green at review (npx cortex-docs-check: 437 IDs, 4531 refs,
0 errors, 0 warnings).

## Prior findings — fix verification

### HIGH (r1) — PIPE-3 stale + uncited — FIXED (verified real)

PIPE-3 bumped to v2 in llm-pipeline.yaml (status: approved). New body: external
drafts enter the SAME chain, drafted by the content engine (GENS), pass the
PIPE-2 VAL stage with mandatory GR-5 citation + GR-3 sensitive gating, are
PERMANENTLY TL1-capped (EXT-3, AUTS-2), and publish per the DEC-26 TL1 veto
model (default publish-then-takedown, opt-in hold-then-publish). "forced human
approval routing" is gone from the normative body; the only surviving mention is
a parenthetical v2 note annotating what DEC-26 + AUT-2 replaced — honest history,
not a live rule. Consistency confirmed pairwise: PIPE-3 v2 <-> EXTS-2 (GR-5/GR-3
enforced at PIPE-2 VAL, sensitive held for founder), <-> EXTS-3/AUTS-2 (external
never exceeds TL1), <-> DEC-26 (veto model). EXTS constrained-by now carries
PIPE-2 + PIPE-3 (both approved architecture — design gate valid). PIPE-3 had zero
prior citers (orphan), so the v2 bump cascades only to EXTS (unpinned ref); graph
green confirms no stale pin. No residual contradiction.

### MEDIUM (r1) — hallucinated-source guard — FIXED (verified real)

EXTS-1 now binds "resolvable source" to search-grounding PROVENANCE (the grounded
retrieval's cited document) AND verified dereferenceability; a candidate whose URL
is absent, dead, or not backed by grounding provenance (a hallucinated link) is
DROPPED, never passed into the mandatory GR-5 citation. Explicitly: "'Resolvable'
means provenance-bound + dereferenceable, not merely 'a URL field is present'."
Acceptance asserts a dead/hallucinated-source candidate is dropped, never cited.
This closes the R-4/GR-5 hole honestly (LRN-20): the check is deterministic
(provenance-bind + dereference), sits inside the honestly-non-deterministic
selection step, and the "never cited" claim is now failable.

### LOW (r1) — EXTS-4 duplication — FIXED

EXTS-4 now references EXT-4's enumeration ("the structured feeds and discovery
engines enumerated in EXT-4") instead of re-listing the feed/engine names
verbatim, and keeps the load-bearing "same ADR-0003 port, no bespoke path"
invariant + the banned-topic suppression (TOP-4 / STRS-1).

### LOW (r1) — depends-on seam — FIXED

depends-on is now [MEMS, TOPS, GENS, AUTS]. GENS = drafting handoff (EXTS-2
toDraft), AUTS = cap enforcer (EXTS-3). Accurate. GENS-1 confirms the seam from
its side (consumes "EXT-1 candidates + the EXT-5 saved pool", reads ExternalItem
DM-8) and EXTS interfaces name toDraft(item) -> content engine.

## Fresh attack on changed sections (held, no new finding)

- PIPE-3 v2 vs EXTS/AUTS/DEC-26: no contradiction in meaning; "forced" fully
  demoted to annotation. Held.
- EXTS-1 dereferenceability guard as a hidden cost/rate assumption: a per-run
  discovery check, not high-frequency; provenance metadata is available for the
  v0 Gemini+Search engine and the EXT-4 shared-port engines. Not a defect.
- EXTS-1 determinism honesty: the provenance/dereference guard is deterministic
  and correctly kept OUT of the non-deterministic selection claim. Held.
- constrained-by PIPE-2/PIPE-3 both approved; depends-on GENS/AUTS valid spec
  prefixes. Graph green.

## Improvement note (non-blocking)

- [low] The worth-a-post "time-sensitive, prioritized" immediate handoff vs
  GENS-1's scheduled rolling planner remains a code-time seam detail. Now better
  covered than r1 (depends-on + interfaces name it, GENS-1 reads DM-8), so it
  does not block: it is a confirm-when-code-lands note, not a design defect.

No surviving high; the single low is a code-time confirmation, one-line at most.
Per the convergence rule this is a pass.

VERDICT: pass
