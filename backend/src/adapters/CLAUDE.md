# backend/src/adapters/ — port adapters (ADR-0003)

**Purpose.** Concrete implementations of the `../ports/` interfaces, selected by
configuration per environment (ADR-0003). Adapters are DUMB: they translate
to/from a vendor and return plain domain data; all policy lives in the modules.

**Adapters here.**

| Folder | Port | Adapters | Selection |
|---|---|---|---|
| `llm/` | `../ports/llm.ts` | `vertex.ts` (Google Vertex/Gemini, ADR-0008), `dev-stub.ts` (deterministic, keyless) | `createLlmPort()` — Vertex when `VERTEX_AI_KEY` is set, else the keyless dev stub (self-contained dev + CI, ADR-0003) |

**Gotcha.** The keyed Vertex path is intentionally UNTESTED until the founder
supplies real GCP creds (like Google OAuth); smoke + CI exercise the dev stub.
