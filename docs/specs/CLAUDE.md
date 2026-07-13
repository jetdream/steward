# specs/ — Behavior Specifications (the exact HOW-it-behaves)

A spec defines exact behavior for one capability: rules, states, edge cases, failure modes, acceptance criteria. Pure YAML per the representation rule ([../CLAUDE.md](../CLAUDE.md)): file-level keys (kind/prefix/status/implements/governed-by/depends-on/modules/purpose), a `behavior:` map **keyed by the requirement IDs it implements** (references to the register definitions — no `v` here; pin as `STR-3 v1` inside text when a version matters), and closing sections (data / interfaces / edge-cases / acceptance / defaults-and-assumptions / non-goals / open-questions). Mermaid goes in as raw text where a diagram says it better.

Specs are written **just-in-time**: a capability's spec must reach `approved` before its code starts (first batch per roadmap P1a: ONB, MEM, CHT, INT, STR, GEN, APR, UX). Use [TEMPLATE.yaml](TEMPLATE.yaml).

Internal tooling exception: specs like [dcx-docs-check.yaml](dcx-docs-check.yaml) define their own items via an `items:` map (no separate register).

## Lifecycle

`draft` → `approved` (implementation may start) → `implemented` (≥1 code citation and ≥1 test citation exist for its IDs) → `superseded`. Any semantic change regresses status to `draft` and bumps affected item versions — see the change protocol in [../CLAUDE.md](../CLAUDE.md).

## The altitude rule

Spec an item only if a reasonable implementation could plausibly get it wrong. If any reasonable implementation is acceptable, cite the governing principle (`governed-by:`) instead of enumerating cases. If being wrong would be invisible in review, spec it with an acceptance criterion. Priorities live only on requirements. `defaults-and-assumptions` and `open-questions` make intentional under-specification explicit.

## Index

| Spec | Covers | Status |
|---|---|---|
| [dcx-docs-check.yaml](dcx-docs-check.yaml) | `DCX-*` — documentation graph lint | approved |
| [ctx-context-hooks.yaml](ctx-context-hooks.yaml) | `CTX-*` — instant lint + ID resolution hooks | approved |
| *(capability specs arrive just-in-time per roadmap)* | | |
