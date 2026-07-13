# specs/ — Behavior Specifications (the exact HOW-it-behaves)

A spec defines exact behavior for one capability: rules, states, edge cases, failure modes, acceptance criteria. Pure YAML per the representation rule ([../CLAUDE.md](../CLAUDE.md)): file-level keys (kind/prefix/status/implements/governed-by/depends-on/modules/purpose), a `behavior:` map **keyed by the requirement IDs it implements** (references to the register definitions — no `v` here; pin as `STR-3 v1` inside text when a version matters), and closing sections (data / interfaces / edge-cases / acceptance / defaults-and-assumptions / non-goals / open-questions). Mermaid goes in as raw text where a diagram says it better.

Specs are written **just-in-time**: a capability's spec must reach `approved` before its code starts (first batch per roadmap P1a: ONB, MEM, CHT, INT, STR, GEN, APR, UX). Use [TEMPLATE.yaml](TEMPLATE.yaml).

Internal tooling exception: specs like [dcx-docs-check.yaml](dcx-docs-check.yaml) define their own items via an `items:` map (no separate register).

## Lifecycle

`draft` → `approved` (implementation may start) → `implemented` (≥1 code citation and ≥1 test citation exist for its IDs) → `superseded`. Any semantic change regresses status to `draft` and bumps affected item versions — see the change protocol in [../CLAUDE.md](../CLAUDE.md).

**Approval prerequisites (the design gate, lint-enforced):** `design-scope` declared, `constrained-by` valid (accepted ADRs / approved architecture docs; DCX-11), `design` section filled (DCX-12), and a recorded pass verdict from the mandatory **Architect Challenger** run with its verbatim evidence record in [challenges/](challenges/) (DCX-13) — invoke the `architect-challenger` agent, store its full verdict as a challenge-record file, and write the `challenge:` block pointing at it. A fail verdict keeps the spec in `draft`.

## Challenge policy

- **First challenge** of a cross-cutting spec or a P0-capability spec runs a **panel of three parallel challengers with distinct lenses**: design-conformance (does behavior violate the constrained-by set in meaning), implementation-divergence (does named code contradict the spec — read it, mutate it), and cheaper-alternative + hidden-assumptions. Serial single-lens rounds converge slowly — the DCX spec took five rounds because each round surfaced a different high a panel would have found at once. Tooling specs and P1/P2 capability specs may use a single challenger.
- **Re-challenges are delta-scoped:** verify each prior finding's fix (by running `scripts/test-docs-check.mjs` and targeted mutations), then attack only the changed sections fresh. Full-fresh re-attack is for major rewrites.
- **Convergence rule:** a round with no high finding and only one-line-fix mediums/lows is a pass; the fixes are applied and the verdict recorded in the same change (the precedent set by both existing specs).
- Challengers consult [../learnings.yaml](../learnings.yaml) (scope-matched) before attacking — known failure classes are the first mutations to try.

## The altitude rule

Spec an item only if a reasonable implementation could plausibly get it wrong. If any reasonable implementation is acceptable, cite the governing principle (`governed-by:`) instead of enumerating cases. If being wrong would be invisible in review, spec it with an acceptance criterion. Priorities live only on requirements. `defaults-and-assumptions` and `open-questions` make intentional under-specification explicit.

## Index

Status lives in each file's `status:` field (single source — not duplicated here; `docs-check --json` reports it per file).

| Spec | Covers |
|---|---|
| [dcx-docs-check.yaml](dcx-docs-check.yaml) | `DCX-*` — documentation graph lint |
| [ctx-context-hooks.yaml](ctx-context-hooks.yaml) | `CTX-*` — instant lint + ID resolution + write-guard hooks |
| *(capability specs arrive just-in-time per roadmap)* | |
