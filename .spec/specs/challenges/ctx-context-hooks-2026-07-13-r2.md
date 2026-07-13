---
kind: challenge-record
spec: .spec/specs/ctx-context-hooks.yaml
round: 2
date: 2026-07-13
verdict: pass
by: architect-challenger (via general-purpose agent)
---

# Verbatim verdict

VERDICT: pass
SPEC: .spec/specs/ctx-context-hooks.yaml
FINDINGS:
- [medium] .spec/specs/CLAUDE.md:24 index still lists ctx-context-hooks.yaml as `approved` while the spec is `draft` — the prior status-regression fix (#2) was applied to the spec file but its citing site was not cascaded, so the repo currently asserts the very design-gate state DCX-13 exists to guard, and no lint checks markdown tables (exactly the silent-drift class the single-source rule forbids) — fix: set the row to `draft` now, or to `approved` in the same commit that records this challenge block and flips status.
- [medium] .spec/CLAUDE.md:135 (Stage 0) still claims "no change touches a contract the session never loaded (CTX-4, CTX-5)" — the exact overclaim fix #3 narrowed in the spec's purpose survives verbatim in the highest-precedence router every agent reads first; shell/heredoc/git-apply writes bypass the guard (spec's own edge-cases say so) — fix: narrow to "no Edit/Write tool call touches a contract the session never loaded".
- [low] CTX-5's rationale "IDs not defined anywhere (the lint catches those instead)" is false for two of the three trees CTX-5 guards: docs-check scans only .spec/** (docFiles in scripts/lib/docs-graph.mjs) and CTX-1 never fires on src/ edits, so a dangling `@implements STR-999` in src/ is caught by nothing at Stage 0 (verified live: guard exits 0, lint silent) — the exemption behavior itself is still correct (an undefined ID has no contract to inject), so this is a justification inaccuracy, not a behavioral defect — fix: reword to "the docs lint catches those under .spec/; dangling IDs in code are a Stage 2 concern".
- [low] CTX-1 says exit 2 delivers "the error listing", but scripts/hooks/docs-lint-hook.mjs feeds docs-check's entire stderr, which includes ~60 lines of informational coverage report per failure (verified live) — noisy feedback that cuts against the spec's own anti-pollution stance — fix: filter stderr to `ERROR` lines (plus cascade lists) before echoing.

Why the mediums don't block: both are one-line cascade edits in neighboring markdown left over from otherwise-real prior fixes; the spec under review is internally consistent, honest about its limits, and its implementation matches it — nothing in the design needs to change.

Prior-fix verification (all confirmed against code and by piping payloads): (1) CTX-2 v2 matches resolve-ids-hook.mjs exactly — MEM-999 (registered, undefined) is noted and re-noted without being marked seen; UTF-8/GPT-4 (unregistered) are silently ignored; hook header pins CTX-2 v2. (2) status is draft, no challenge block — but see finding 1. (3) purpose narrowed to the Edit/Write channel; edge-cases names the shell bypass with pre-commit + Stage 1 CI as backstop — but see finding 2. (4) steward-ctx-default.json fallback specified in data and matches ledgerPath(). (5) re-noting recorded in defaults-and-assumptions and matches implementation.

Attacks that held: every acceptance criterion executed live and passed (CTX-1 dangling-ref exit 2 with pointing errors; MEM-1 injected once then deduplicated; STR-3 write blocked once with excerpt, retry passed, never blocked after Reading the register; self-defined-ID and undefined-ID exemptions); CTX-3 cap of 8 with ID-only overflow verified; all four hooks fail open on garbage stdin (exit 0); latency ~110 ms; defs/path comparisons are absolute-to-absolute so the self-exemption and read-ledger matching are sound; ledger write race costs at worst one extra deny-once, which the spec already prices in; `design-scope: local` holds (agent tooling, DCX precedent); no cheaper conforming alternative — removing the ledger either spams injection (violates CTX-3) or blinds CTX-5; governed-by P-6 is a legitimate tiebreaker citation, not smuggled design.
