# Documentation System — Router and Change Protocol

This file is the entry point to all project documentation. Read it before creating or modifying **any** artifact — docs or code. The constitution ([/CLAUDE.md](../CLAUDE.md)) mandates spec-first development; this file defines how that works in practice.

## Representation rule

**Normative content is pure YAML; narrative content is markdown.** Registers (goals, principles, requirements, …), specs, and architecture files are `.yaml` — structured records with prose in block scalars, machine-parseable without heuristics. Markdown is reserved for documents meant to be *read as documents*: [product/vision.md](product/vision.md), [product/overview.md](product/overview.md), ADRs, and these `CLAUDE.md` routers. **IDs are defined only in YAML; markdown only references them.**

## Layer model

Each layer owns exactly one question. A layer references neighbors by ID or link — it never restates their content (single source of truth).

```mermaid
graph TD
  V[vision.md — narrative WHY, non-normative] --> G[goals.yaml — G-*]
  G --> REQ[requirements/*.yaml — WHAT, priority, acceptance]
  P[principles.yaml — P-* / GR-*] -.constrains.-> REQ
  P -.constrains.-> SPEC
  SC[scope.md / assumptions.yaml A-* / risks.yaml R-*] -.bounds.-> REQ
  REQ --> SPEC[specs/*.yaml — exact behavior]
  ADR[adr/ — ADR-*] -.justifies.-> ARCH[architecture/*.yaml]
  ARCH -.constrains.-> SPEC
  SPEC --> CODE["code: @implements STR-3 v1 headers + module CLAUDE.md"]
  SPEC --> TEST[tests: titles carry requirement IDs]
```

| Question | Single source | IDs |
|---|---|---|
| Why does this product exist? | [product/vision.md](product/vision.md) (narrative, non-normative) | — |
| What are the goals and success metrics? | [product/goals.yaml](product/goals.yaml) | `G-*` |
| What principles and guardrails govern everything? | [product/principles.yaml](product/principles.yaml) | `P-*`, `GR-*` |
| What is in/out of scope? | [product/scope.md](product/scope.md) | — |
| Who are the users? | [product/users.md](product/users.md) | — |
| What do we assume/depend on? | [product/assumptions.yaml](product/assumptions.yaml) | `A-*` |
| What can go wrong? | [product/risks.yaml](product/risks.yaml) | `R-*` |
| What ships when? | [product/roadmap.md](product/roadmap.md) | — |
| What decisions are pending? | [product/open-questions.yaml](product/open-questions.yaml) | `Q-*` |
| What contradictions were detected? | [product/inconsistencies.yaml](product/inconsistencies.yaml) | `INC-*` |
| What does each domain term mean? | [product/glossary.yaml](product/glossary.yaml) | — |
| WHAT must each capability do? | [product/requirements/](product/requirements/) `*.yaml` | capability prefixes |
| EXACTLY how must it behave? | [specs/](specs/) `*.yaml` | `behavior:` keyed by requirement IDs |
| Cross-cutting technical truth | [architecture/](architecture/) `*.yaml` | — |
| Why this technical choice? | [adr/](adr/) | `ADR-*` |
| Where is X implemented? | each `src` module's `CLAUDE.md` + code headers | — |

**Precedence (conflict resolution):** `GR-*` > `P-*` > requirements > specs. A lower layer may only *tighten* an upper layer, never loosen it. A conflict that cannot be resolved by precedence becomes an `INC-*` entry.

## ID grammar

An ID matches `^[A-Z]{1,4}-\d+$` and is **defined exactly once** — as a key of an `items:` map in its prefix's owning YAML file (`v:` is the item's version), or by an ADR filename `adr/NNNN-slug.md`. Everything else that mentions an ID is a *reference*; `grep -rn "STR-3" docs src` returns the full trace: definition → spec behavior → implementation → tests.

Register shape (see any file under [product/requirements/](product/requirements/) as the example):

```yaml
kind: requirements          # goals | principles | … | requirements
prefix: STR                 # ID namespace(s) this file owns
title: Posting Strategy
status: approved            # draft | approved | superseded
serves: [G-2]               # file-level default; items may override
intent: >-
  Why this capability exists, in one paragraph.
items:
  STR-3:
    v: 1                    # item version — bump on any semantic change
    priority: P0            # requirement items only (P0 | P1 | P2)
    flexibility: hard       # optional: hard | preference
    serves: [G-2]           # optional override of the file default
    depends: [GEN-5]        # optional explicit dependency edges
    source: PRD v0.3 §7     # optional provenance
    title: Enforcement
    statement: >-
      The requirement text. EARS-style where natural.
    acceptance: Optional testable criterion.
```

`Q-*`/`INC-*` items carry `status: open | resolved` instead of `priority`. Spec files reference requirement IDs as keys of a `behavior:` map (no `v` there — the definition lives in the register); pin a version inside text as `STR-3 v1` when it matters.

## Versioning and immutability

An item is immutable per version. Any **semantic** change bumps `v` (typo fixes don't). Bumping starts a **cascade**: every artifact, code header, or test citing the old pin is stale and must be revisited before commit — `scripts/docs-check.mjs` prints the cascade list and fails on stale pins. History lives in git; files hold only the active version. Unpinned references always mean "current version".

## Prefix registry

New prefixes are registered here **before** first use (`docs-check` rejects unregistered ones).

| Prefix | Owns | Defined in |
|---|---|---|
| `G` | Goals | product/goals.yaml |
| `P` | Product principles | product/principles.yaml |
| `GR` | Platform guardrails | product/principles.yaml |
| `A` | Assumptions | product/assumptions.yaml |
| `R` | Risks | product/risks.yaml |
| `Q` | Open questions | product/open-questions.yaml |
| `INC` | Inconsistencies | product/inconsistencies.yaml |
| `ONB` | Lazy onboarding | product/requirements/onb-onboarding.yaml |
| `MEM` | Org Memory | product/requirements/mem-org-memory.yaml |
| `CHT` | Agentic chat | product/requirements/cht-agentic-chat.yaml |
| `INT` | Interviewer | product/requirements/int-interviewer.yaml |
| `STR` | Posting Strategy | product/requirements/str-posting-strategy.yaml |
| `GEN` | Content generation | product/requirements/gen-content-generation.yaml |
| `EXT` | External radar | product/requirements/ext-external-radar.yaml |
| `APR` | Approval inbox & composer | product/requirements/apr-approval-inbox.yaml |
| `PUB` | Publishing | product/requirements/pub-publishing.yaml |
| `PRO` | Proactive manager | product/requirements/pro-proactive-manager.yaml |
| `STW` | Stewardship loop | product/requirements/stw-stewardship.yaml |
| `AUT` | Autonomy system | product/requirements/aut-autonomy.yaml |
| `BIL` | Billing & account | product/requirements/bil-billing.yaml |
| `OPS` | Operations console | product/requirements/ops-console.yaml |
| `UX` | App shell & navigation | product/requirements/ux-app-shell.yaml |
| `DCX` | docs-check tool | specs/dcx-docs-check.yaml |
| `CTX` | Context hooks | specs/ctx-context-hooks.yaml |
| `ADR` | Decision records | adr/NNNN-slug.md (ID from filename) |

## Semantic clarity rule

[product/glossary.yaml](product/glossary.yaml) is the authoritative vocabulary. Never use one word for two concepts; when a term is overloaded, qualify it (`auth token`, not `token`). New domain concepts are added to the glossary in the same change that introduces them.

## The change protocol

1. **Behavior change (new or modified):** edit the requirement/spec **first**. Semantic edit ⇒ `v` bump ⇒ spec status regresses to `draft` until re-approved. Spec + code + tests land in the same commit.
2. **Cascade analysis:** after a version bump, `docs-check` lists every citing site; each must be revisited (updated or consciously re-pinned).
3. **Contradiction check:** before writing, load the target file's `depends-on` set, every file referencing the edited IDs (one grep), applicable principles, and open `INC-*` entries touching those IDs. A contradiction you cannot resolve in this change becomes a new `INC-*` entry — contradictions are never silently dropped.
4. **New technical decision with alternatives:** write an ADR. Never overturn an `accepted` ADR silently — supersede it. A `rejected` ADR is a binding constraint; do not re-propose without new information.
5. **Bug triage — fix at the layer that failed:** every bug is a *spec gap* (amend spec, then code), a *spec violation* (fix code, cite spec), or a *wrong spec* (supersede via this protocol). Never silently patch code around a wrong or missing spec.
6. **Unspecified case hit during implementation:** derive the answer from a principle (record the derivation in a code comment citing `P-x`), or raise a spec amendment. Never invent silently.
7. **Altitude rule:** spec an item only if a reasonable implementation could plausibly get it wrong. If any reasonable implementation is acceptable, cite the governing principle instead of enumerating cases. If being wrong would be invisible in review, spec it with an acceptance criterion. Priorities live only on requirements.
8. **Refactor with no behavior change:** no spec edit; update the affected module `CLAUDE.md` if structure moved.
9. **Every change ends with:** `node scripts/docs-check.mjs` green (plus typecheck and biome once code exists).

## Enforcement stages

- **Stage 0 (live):** this protocol + `docs-check` + **Claude Code hooks** ([specs/ctx-context-hooks.yaml](specs/ctx-context-hooks.yaml)): every docs edit is linted at the moment it happens (CTX-1); IDs mentioned in prompts resolve into context automatically (CTX-2, bounded by CTX-3).
- **Stage 1 (repo skeleton):** `docs-check` in CI; a spec may claim `implemented` only with ≥1 code citation and ≥1 test citation of its IDs.
- **Stage 2:** stale-pin detection extends over `src/` code headers (`@implements STR-3 v1`) and test titles — drift cannot pass CI.
- **Stage 3 (optional):** on spec diffs, an adversarial agent review of the edited file against everything referencing its IDs.

## Folder map

- [product/](product/) — business truth: vision, goals, principles, scope, requirements
- [specs/](specs/) — behavior specs, written just-in-time before a capability's code starts
- [architecture/](architecture/) — cross-cutting technical truth (sketch status until code lands)
- [adr/](adr/) — decision journal (markdown)
- `../scripts/` — `docs-check.mjs` (lint), `lib/docs-graph.mjs` (shared parser), `hooks/` (Claude Code hooks)
