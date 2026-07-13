# architecture/ — Cross-Cutting Technical Truth

Technical design that spans capabilities, as pure-YAML docs (representation rule, [../CLAUDE.md](../CLAUDE.md)) with mermaid embedded as raw text. All files are at **sketch status** (seeded from PRD §9–§10) until the repo skeleton lands; they firm up alongside the first specs. Decisions with considered alternatives get ADRs ([../adr/](../adr/)); these files record the *current* design and link the ADRs that justify it.

| File | Owns |
|---|---|
| [overview.yaml](overview.yaml) | System map: module boundaries, how capabilities map to `src/{client,backend,shared}` |
| [data-model.yaml](data-model.yaml) | Entity semantics, ERD, state machines. Field lists move to `@shared` types once they exist — this file keeps diagrams + meaning only |
| [llm-pipeline.yaml](llm-pipeline.yaml) | Generation grounding, guardrail chain, one-brain/several-skills, model-call logging, COGS |
| [integrations.yaml](integrations.yaml) | External APIs: auth models, permissions, rate limits, failure modes |
| [security-privacy.yaml](security-privacy.yaml) | Compliance, privacy, safety posture |
