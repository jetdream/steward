# backend/src/ports/ — domain-defined ports (ADR-0003)

**Purpose.** The narrow, domain-defined interfaces every external/infra
dependency is reached through (ports & adapters, ADR-0003). No vendor type
leaks past a port; the active adapter is selected by configuration per
environment (see `../adapters/`).

**Ports here.**

| File | Port | Adapters | Justifies |
|---|---|---|---|
| `llm.ts` | LLM/search — extraction + embeddings | `../adapters/llm/` (Vertex/Gemini, dev-stub) | ADR-0003, ADR-0008 |

More ports (job/queue, blob, email, publishing, messaging) land here as their
verticals arrive — same principle, one interface each.
