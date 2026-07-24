# backend/src/adapters/ — port adapters (ADR-0003)

**Purpose.** Concrete implementations of the `../ports/` interfaces, selected by
configuration per environment (ADR-0003). Adapters are DUMB: they translate
to/from a vendor and return plain domain data; all policy lives in the modules.

**Adapters here.**

| Folder | Port | Adapters | Selection |
|---|---|---|---|
| `llm/` | `../ports/llm.ts` | `vertex.ts` (Google Vertex/Gemini, ADR-0008), `dev-stub.ts` (deterministic, keyless) | `createLlmPort()` — Vertex when `VERTEX_AI_KEY` is set, else the keyless dev stub (self-contained dev + CI, ADR-0003). `STEWARD_LLM=dev-stub` overrides and pins the stub even with a key present. |
| `sources/` | `../ports/sources.ts` | `fetch.ts` (`fetch`-based website scraper IG-7 + `htmlToText`; Meta harvest IG-1 stub) | `createSourceFetch()` — one real adapter (no credential needed for public website scrape; the Meta path stubs until ChannelConnection + OAuth, ONBS-4). |

**Gotcha.** The keyed Vertex path is exercised by the keyed tier only —
`npm run eval` + the per-increment smokes (they leave `STEWARD_LLM` unset). The
DETERMINISTIC test tier (`npm test`) sets `STEWARD_LLM=dev-stub` so it stays
hermetic even though `.env` now carries `VERTEX_AI_KEY` — otherwise every test
calling `createLlmPort()` would silently hit real Gemini (non-deterministic, slow,
flaky; LRN-27). Tests asserting deterministic dev-stub behavior must never depend
on the mere ABSENCE of an ambient key.
