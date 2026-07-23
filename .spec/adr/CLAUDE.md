# adr/ — Architecture Decision Records

The append-only decision journal. ADRs answer *why this technical choice* — the one place ordinal numbering survives in this project (append-only, never reordered, short citation handles). ID comes from the filename: `NNNN-slug.md` defines `ADR-NNNN`.

**Statuses:** `proposed` → `accepted` | `rejected` → `superseded` (by a later ADR).

Rules:
- Never overturn an `accepted` ADR silently — write a superseding ADR.
- A **`rejected` ADR is a binding constraint**: it records why an option was turned down, and agents must not re-propose it without new information (cite the ADR when declining to revisit).
- Architecture docs ([../architecture/](../architecture/)) describe the *current* design and link the ADRs justifying it; the ADR holds the alternatives and rationale (single source of truth for the "why").
- **Only `accepted` ADRs may appear in a spec's `constrained-by` list.** Superseding an ADR therefore cascades: every citing spec goes red until consciously re-pointed at the successor — architecture evolves loudly, never silently.

Use [TEMPLATE.md](TEMPLATE.md).

## Index

| ADR | Title | Status |
|---|---|---|
| [ADR-0001](0001-design-system-substrate.md) | Design-system substrate — re-themed Airbnb open-design fork | accepted |
| [ADR-0002](0002-stack-baseline.md) | Consolidated stack baseline | accepted |
| [ADR-0003](0003-deployment-portability.md) | Deployment portability via ports & adapters | accepted |
| [ADR-0004](0004-news-site-rendering.md) | Public news-site rendering & hosting | accepted |
| [ADR-0005](0005-operator-access-model.md) | Operator access & audit model | superseded |
| [ADR-0006](0006-identity-impersonation-model.md) | Accounts, identity, impersonation & activity-ledger model | accepted |
| [ADR-0007](0007-deployment-topology.md) | Deployment topology & environments | accepted |
| [ADR-0008](0008-llm-model-selection.md) | LLM & embedding model selection — Google Vertex AI (Gemini) | accepted |
| [ADR-0009](0009-agent-runtime.md) | Agent runtime & harness model (amends ADR-0003 orchestration clause) | accepted |
| [ADR-0010](0010-ai-evaluation-framework.md) | AI evaluation & regression-testing framework | accepted |
