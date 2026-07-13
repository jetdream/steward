---
kind: challenge-record
spec: docs/specs/dcx-docs-check.yaml
round: 9
date: 2026-07-13
verdict: pass
by: architect-challenger (via general-purpose agent, delta-scoped)
---

# Verbatim verdict

All mutations restored (docs-check.mjs byte-identical to session start; the git diff is the increment-under-review vs HEAD, not my edits). No scratch leaked; lint green. The r3 file and ctx edits are from a concurrent CTX challenge, not mine.

VERDICT: pass
SPEC: docs/specs/dcx-docs-check.yaml
FINDINGS:
- [severity: medium] DCX-16 "dishonest baseline" bypass: a brand-new v1 requirement/goal/principle tagged `origin: baseline` with no DEC passes the lint with zero errors (verified: added STR-99 v1 origin:baseline → exit 0) — survives scrutiny because it directly contradicts the rule text's own claim that "a requirement/goal/principle cannot be added to or changed in an approved register without a recorded human decision" and that "the new-addition bypass ... is closed"; only the *no-markers* addition is closed, the *false-marker* addition is open, and `origin: baseline` is exactly the LRN-13 defect class (an exemption keyed on a self-declarable property the writer can cheaply fake) with no compensating challenger gate (challenger is mandatory only at spec approval, DCX-13, not on requirement-register edits). It does NOT block: this is the same accepted greppable-conscious-claim tradeoff the project already ratified for DCX-11 `design-scope: local` (a dishonest "local" claim likewise passes lint), and no cheap pure-lint structural binding exists — "existed at the founding baseline" is not a lint-visible signal without git history or a rejected per-item manifest (LRN-6). Fix (one-line, spec text): stop claiming the addition-with-DEC guarantee is absolute / the bypass is "closed"; reframe `origin: baseline` as a conscious, greppable, diff-reviewable claim with its residual explicitly acknowledged, mirroring the DCX-11 `design-scope: local` wording.
- [severity: medium] Two new DCX-16/DCX-4 branches have no executable acceptance case: `decidedByWrongKind` (a `decided-by` citing a defined-but-wrong-kind id) and `invalidOrigin` (a non-`baseline` origin value) — survives scrutiny as the round-6 defect class recurring (DCX-15 requires the spec's mutations to be executable; the acceptance section lists "decided-by citing an undefined DEC" but omits the wrong-kind case, and lists no invalid-origin-value case). It does NOT block because both checks are verified live-functional by mutation (`decided-by: CON-1` and `decided-by: INC-1` both emit "…is not a decision record"; `origin: bogus` emits the invalid-origin error) — there is no live gate hole, only a missing regression backstop for the LRN-4 provenance-kind guard (the highest-value DCX-16 branch). Fix (one-line each): add a `decided-by`-wrong-kind CASES entry asserting `MSG.decidedByWrongKind` and an invalid-origin-value CASES entry asserting `MSG.invalidOrigin`, and list both in the spec's acceptance section.

What was attacked and held (all mutations on a frozen tree copy; real repo `scripts/docs-check.mjs` byte-identical afterwards, sha256 66ffc38…, no scratch leaked into the repo):
- Teeth of the 7 new harness cases: disabling each of `needsProvenance`, `provenanceNotBoth`, `baselineNotAtV1`, `decidedByUndefined`, `itemNeedsDecisionMeta`, `itemNeedsCategory` fails exactly its one corresponding case — 6/7 have teeth; only `decidedByWrongKind` lacked a case (finding 2).
- Gate-bypass hunt: new v1 with no provenance → error; both markers → error; origin at v≥2 → error; `decided-by` to undefined DEC → error; `decided-by` to ADR/CON/INC (wrong kind) → error (LRN-4 provenance-kind check verified working, just untested).
- GOVERNED_KINDS = {requirements, goals, principles} is complete: it matches DCX-16's text and the G/P·GR/requirements normative-product layers; principles.yaml (kind principles) covers both P-* and GR-* so guardrails are gated; assumptions/risks/constraints/decisions are correctly excluded (external-fact/authorization registers, not product-normative behavior, and not DEC-required by the HITL policy).
- New DCX-4 kinds (`decisions`, `constraints`) and fields (`origin`, `decided-by`, `binds`) validate as specified; decisions date/by and constraints category checks have teeth.
- Note (not a finding): a concurrent CTX-spec round-3 challenge running in parallel repointed `ctx-context-hooks.yaml`'s challenge record to r3 and added the r3 file mid-session, which transiently breaks the two DCX-13 harness cases (they hardcode the r2 fixture) — orthogonal to this DCX increment and to my mutations; on a fixture-consistent tree the harness is a clean 41/41. Spec `status: draft` is the expected re-challenge regression, not a finding.

Convergence: no surviving high; both mediums are one-line fixes ⇒ pass, with the two fixes to be applied in the change that records this verdict.

# Resolution (applied in the recording change)

- Finding 1: DCX-16 rule text (and docs/CLAUDE.md HITL policy) reframed — the `origin: baseline` residual is now explicitly acknowledged as an LRN-13-class self-declarable claim with a diff-review compensating control, mirroring DCX-11 `design-scope: local`; the "bypass is closed" / absolute-guarantee overclaim is removed.
- Finding 2: harness cases added for `decidedByWrongKind` (via `decided-by: INC-1`) and `invalidOrigin` (`origin: bogus`); both listed in the acceptance section. Also the two DCX-13 cases were de-hardcoded from the r2 fixture (they now derive the spec's current `record:` path), fixing the parallel-challenge coupling the note flagged. Harness 43/43.
