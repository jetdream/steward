# architecture/ — Cross-Cutting Technical Truth

Technical design that spans capabilities, as pure-YAML docs (representation rule, [../CLAUDE.md](../CLAUDE.md)) with mermaid embedded as raw text. Decisions with considered alternatives get ADRs ([../adr/](../adr/)); these files record the *current* design and link the ADRs that justify it.

**Status semantics (lint-enforced):** `sketch` → `approved` → `superseded`. A spec may list an architecture doc in its `constrained-by` only when that doc is `approved` — so the design pass (firming sketches into approved docs, backed by ADRs) is a hard predecessor of spec approval, and design → spec → code is gated at every arrow. All files are currently at **sketch status** (seeded from PRD §9–§10); approving them is the first task of the P1a design pass.

| File | Owns |
|---|---|
| [overview.yaml](overview.yaml) | System map: module boundaries, how capabilities map to `src/{client,backend,shared}` |
| [data-model.yaml](data-model.yaml) | Entity semantics, ERD, state machines. Field lists move to `@shared` types once they exist — this file keeps diagrams + meaning only |
| [llm-pipeline.yaml](llm-pipeline.yaml) | Generation grounding, guardrail chain, one-brain/several-skills, model-call logging, COGS |
| [integrations.yaml](integrations.yaml) | External APIs: auth models, permissions, rate limits, failure modes |
| [security-privacy.yaml](security-privacy.yaml) | Compliance, privacy, safety posture |
| [ui.yaml](ui.yaml) | UX structure: journeys, flows, screens (design-elements per method/ui.md); artifacts live in `/design`, linked from element bodies |
