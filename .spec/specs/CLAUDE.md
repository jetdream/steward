# specs/ — Behavior Specifications (the exact HOW-it-behaves)

A spec defines exact behavior for one capability: rules, states, edge cases, failure modes, acceptance criteria. **A spec is a REGISTER of spec-elements with its OWN prefix** (`<requirement-prefix>S` — e.g. MEM→MEMS; register it in [registry.yaml](../registry.yaml) first, and never reuse the requirement's prefix, which its register owns). Pure YAML per the representation rule ([../CLAUDE.md](../CLAUDE.md)). File-level keys: `kind / prefix / title / status / intent / design-scope / constrained-by / depends-on / governed-by / assurance / challenge / design / data / interfaces / open-questions`. `items:` is a map of **spec-elements**, each carrying `implements: [<req-id>…]` (≥1) plus a `statement:` that folds in the behavior, edge cases, and an inline acceptance clause — there are **no** separate top-level `behavior` / `acceptance` / `edge-cases` / `non-goals` / `defaults-and-assumptions` fields (surface defaults/assumptions in `design`, genuinely-open items in `open-questions`). No `v` on requirement references (pin as `STR-3 v1` inside text when a version matters). `governed-by` cites **guardrails only** (values go in prose); `constrained-by` cites **design-element IDs** (architecture/experience) and/or **ADR IDs**, never file paths. `assurance` is `standard | verified` (verified additionally needs an `@verifies` test). A spec-element gains a `realization:` assertion when its code lands. Mermaid goes in as raw text where a diagram says it better. The engine's SPEC_SCHEMA is the authority; [mem-org-memory.yaml](mem-org-memory.yaml) (MEMS-1..6) is the worked example.

Specs are written **just-in-time**: a capability's spec must reach `approved` before its code starts (first batch per roadmap P1a: ONB, MEM, CHT, INT, STR, GEN, APR, UX). Use [TEMPLATE.yaml](TEMPLATE.yaml).

## Lifecycle

`draft` → `approved` (implementation may start) → `implemented` (≥1 code citation and ≥1 test citation exist for its IDs) → `superseded`. Any semantic change regresses status to `draft` and bumps affected item versions — see the change protocol in [../CLAUDE.md](../CLAUDE.md).

**Approval prerequisites (the design gate, lint-enforced):** `design-scope` declared, `constrained-by` valid (accepted ADRs / approved architecture docs), `design` section filled, and a recorded pass verdict from the mandatory **Architect Challenger** run with its verbatim evidence record in [challenges/](challenges/) — invoke the `architect-challenger` agent, store its full verdict as a challenge-record file, and write the `challenge:` block pointing at it. A fail verdict keeps the spec in `draft`.

## Challenge policy

- **First challenge** of a cross-cutting spec or a P0-capability spec runs a **panel of three parallel challengers with distinct lenses**: design-conformance (does behavior violate the constrained-by set in meaning), implementation-divergence (does named code contradict the spec — read it, mutate it), and cheaper-alternative + hidden-assumptions. Serial single-lens rounds converge slowly — a hard cross-cutting spec can take many rounds, each surfacing a different high a panel would have found at once. Tooling specs and P1/P2 capability specs may use a single challenger.
- **Re-challenges are delta-scoped:** verify each prior finding's fix (by running `scripts/test-docs-check.mjs` and targeted mutations), then attack only the changed sections fresh. Full-fresh re-attack is for major rewrites.
- **Convergence rule:** a round with no high finding and only one-line-fix mediums/lows is a pass; the fixes are applied and the verdict recorded in the same change (the precedent set by both existing specs).
- Challengers consult [../learnings.yaml](../learnings.yaml) (scope-matched) before attacking — known failure classes are the first mutations to try.

## The altitude rule

Spec an item only if a reasonable implementation could plausibly get it wrong. If any reasonable implementation is acceptable, cite the governing principle (`governed-by:`) instead of enumerating cases. If being wrong would be invisible in review, spec it with an acceptance criterion. Priorities live only on requirements. `defaults-and-assumptions` and `open-questions` make intentional under-specification explicit.

## Index

Status lives in each file's `status:` field (single source — not duplicated here; `docs-check --json` reports it per file).

| Spec | Covers |
|---|---|
| *(capability specs arrive just-in-time per roadmap)* | |
