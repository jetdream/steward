---
kind: challenge-record
spec: docs/specs/dcx-docs-check.yaml
round: 1
date: 2026-07-13
verdict: fail
by: architect-challenger (via general-purpose agent)
---

# Verbatim verdict

VERDICT: fail
SPEC: docs/specs/dcx-docs-check.yaml
FINDINGS:
- [severity: high] DCX-8 v2's clause "aggregate spec open-questions sections" has no implementation at all in scripts/docs-check.mjs, yet the module header claims "Implements: … DCX-8 v2" — add an open question to any spec today and no report mentions it; the failure is invisible (both current specs have `open-questions: []`, no acceptance criterion covers DCX-8, and no test exists), which is precisely the drift this spec-first constitution exists to forbid, in the tool that enforces it. I tried to refute it as "trivially satisfied while all open-questions are empty" — no: there is zero aggregation logic, so the item is violated the moment any spec records a question. Fix: implement the aggregation in the registers report (a few lines next to the openInc block) or bump DCX-8 to v3 dropping the clause; either way land it in this same change and correct the header pin.
- [severity: medium] The acceptance section still covers only DCX-1/3/4/5/9; the four new gate items DCX-11–14 (and DCX-8) have no criterion, though a gate check that silently never fires is exactly the "invisible in review" case the altitude rule says must carry acceptance. Fix: extend acceptance — missing challenge block, sketch-status constrained-by entry, cross-cutting spec with empty constrained-by, and missing pre-commit hook each produce exit 1. Not independently blocking, but it must accompany the DCX-8 fix.
- [severity: medium] DCX-14 promises "the gate cannot silently disappear" but the check (scripts/docs-check.mjs:127-132) only verifies a file exists containing the substring "docs-check"; a `.husky/pre-commit` can exist while git never executes it (husky needs `core.hooksPath`, wired by a `prepare` script in a package.json that is currently untracked; `--no-verify` bypasses regardless). The rule's stated guarantee exceeds what the check delivers. Fix: also assert activation (e.g. `git config core.hooksPath` when `.husky` is used) or temper the rule text to "presence" and name Stage 1 CI as the real backstop. Note the hook does not exist in the tree at all yet — the lint is correctly red on it and the hook must land with this change. Doesn't block alone: the check as written still catches deletion, the commonest failure.
- [severity: low] docs/CLAUDE.md folder map still says "architecture/ — … (sketch status until code lands)", contradicting DCX-11 and architecture/CLAUDE.md (approving sketches is the *first* task of the design pass, a hard predecessor of spec approval). One-line router fix; low because the more specific router already states the correct semantics.
- [severity: low] DCX-1 gap in scripts/lib/docs-graph.mjs (~line 172): ADR filename definitions call `defs.set` without the duplicate check, and no YAML file owns the ADR prefix in the owners map, so a register item keyed `ADR-0001` would collide with a real ADR silently instead of erroring on "defined more than once". Route ADR defs through the same duplicate check.
- [severity: low] DCX-9 says `--json` emits "items with effective metadata, references, file data"; the JSON contains items/references/reports/errors but no per-file data. Align the rule text or the output (wording is ambiguous enough that either direction is fine).

What I attacked that held: design-scope local claim (genuinely local — reads docs, writes nothing, no product architecture touched); DCX-13 bootstrap circularity (this very run is the resolution; a fail block on a draft spec is legal since the check gates only approved/implemented); the "per the change protocol" citation in DCX-13 (the updated docs/CLAUDE.md step 2 now contains the design gate, so it resolves); strict-token DCX-3 friction (UTF-8/SHA-256-style tokens erroring is a conscious, edge-cases-acknowledged tradeoff); cheaper alternative (a real YAML library is pre-empted by the zero-dep constraint and an explicit supersession path in the design section); DCX-11 ADR-status mechanics (frontmatter parsing landed in docs-graph.mjs, so `accepted` is actually checkable).
