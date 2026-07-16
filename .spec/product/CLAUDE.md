# product/ — Business Truth

Everything the product must be and why — decomposed from PRD v0.3 (deleted; see git history) and Vision v0.2 into single-source layered files. Per the representation rule ([../CLAUDE.md](../CLAUDE.md)): ID-bearing registers are pure YAML; narrative documents are markdown.

| File | Owns | IDs |
|---|---|---|
| [vision.yaml](vision.yaml) | Mission + north star — governed, deliberately inert | `VIS-*` |
| [vision.md](vision.md) | Narrative WHY: problem, insight, positioning (**non-normative** companion) | — |
| [overview.md](overview.md) | System concept and the core loop (narrative) | — |
| [goals.yaml](goals.yaml) | Goals, success metrics, north star | `G-*` |
| [values.yaml](values.yaml) | Product values — the soft decision compass (tiebreakers) | `VAL-*` |
| [guardrails.yaml](guardrails.yaml) | Platform guardrails — hard, near-immovable rules | `GR-*` |
| [glossary.yaml](glossary.yaml) | Authoritative domain vocabulary (`terms:` map) | — |
| [scope.md](scope.md) | Non-goals, deferral order, boundary cases | — |
| [users.md](users.md) | Personas and go-to-market | — |
| [assumptions.yaml](assumptions.yaml) | Assumptions and external dependencies | `A-*` |
| [risks.yaml](risks.yaml) | Risks and mitigations | `R-*` |
| [roadmap.md](roadmap.md) | Delivery phases and exit criteria | — |
| [open-questions.yaml](open-questions.yaml) | Pending decisions queue | `Q-*` |
| [inconsistencies.yaml](inconsistencies.yaml) | Detected contradictions with lifecycle | `INC-*` |
| [requirements/](requirements/) | Capability requirement registers | capability prefixes |

Rules of this layer: requirements serve goals (`serves:` fields); guardrails hard-constrain everything below them and values guide where no hard rule dictates; contradictions become `INC-*` entries, never silent edits. See [../CLAUDE.md](../CLAUDE.md) for the change protocol.
