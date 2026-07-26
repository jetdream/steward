# backend/src/ports/ — domain-defined ports (ADR-0003)

**Purpose.** The narrow, domain-defined interfaces every external/infra
dependency is reached through (ports & adapters, ADR-0003). No vendor type
leaks past a port; the active adapter is selected by configuration per
environment (see `../adapters/`).

**Ports here.**

| File | Port | Adapters | Justifies |
|---|---|---|---|
| `llm.ts` | LLM/search — extraction + embeddings | `../adapters/llm/` (Vertex/Gemini, dev-stub) | ADR-0003, ADR-0008 |
| `sources.ts` | Source fetch — read an org's public presence for ONBS-2 ingestion (website IG-7, Meta IG-1) | `../adapters/sources/` (`fetch` scraper; Meta stub) | ADR-0003, IG-1, IG-7 |
| `blob.ts` | Blob store — media bytes for the DM-4 library | `../adapters/blob/` (MinIO/R2, in-memory) | ADR-0003, ADR-0007 |
| `oauth.ts` | Channel OAuth — the ONBS-4 connect/reconnect handshake | `../adapters/oauth/` | ADR-0003, IG-1, IG-2 |
| `publishing.ts` | Social publishing — official platform APIs only | `../adapters/publishing/` | ADR-0003, GR-6 |

More ports (job/queue, email, messaging) land here as their verticals arrive —
same principle, one interface each.
