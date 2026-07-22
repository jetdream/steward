# THE MOST IMPORTANT DOCUMENT IN THE PROJECT

## Project Constitution
This project is fully written by AI agents.
This is spec-driven, spec-first project, nothing can be implemented without being in sync with specification.
Project design and structure is to be done to achieve the best Agentic Experience (AX) possible, all the decisions on how to document and comment the code must be with clear focus on future usage by AI coding agents.

**Before acting on any request, follow the SDLC protocol in [.spec/CLAUDE.md](.spec/CLAUDE.md):** evaluate the request against the docs *first* (Phase A intake), push back on contradictions and surface flexibility-limiting decisions rather than proceeding silently, capture missing information as documentation, and escalate blockers up the layers (Phase C). Requirement/goal/principle changes require a recorded human decision (`DEC-*`, HITL policy). The `/change-request` skill is the runnable form of intake.

## Tech Stack
NodeJS 24
TypeScript 7 - (types always must be checked before commit)
biome linting - (always must be checked before commit)
Vite + React 
Tailwind + ShadCN
Postgres + pgvector with Drizzle
tRPC
WebSocket for realtime updates with light payloads
BetterAuth - Google Sign-in + Dev login by entering email only (no password shortcut)
Vercel AI SDK 7
OpenTelemetry (for dev - LGTM) 

## Code Standards
Shared package to defined types for all crossboundary objects

Follow strict type hygiene, including:
- Strict Typing (no `any`), no exceptions
- Strictly branded types only for IDs
- Never redefine essentially same fields - use Property Selection utility types Pick<>, Omit<> and Union<>
- Use type inference from Drizzle types
- Use Zod type definition with inference for key entities
- No unsafe json/yaml parsing - use Zod for type checking

## Project structure
Four top level src folders:
- client - TS alias @client
- backend - TS alias @backend
- shared - TS alias @shared
- news - TS alias @news (the public news SSR renderer — Astro + React islands, a separate deployable; ADR-0004/ADR-0007/DEC-36)

Folder-module general structure with dedicated shared folder for cross-modules.

## Architectural principles
Do not over-abstract where is not necessary and project will not benefit from such abstraction.
Always maintain DRY (Do not Repeat Yourself) principle and separation of concerns.

### Client
All the calls from client to backend only through domain-specific API React hooks.

## Documentation and code commenting

The documentation lives in `docs` folder.

Focus on the main consumer of the documentation and comments - AI coding agents.
The architecture and documentation must be written for AI to provide the context.

Each folder MUST have CLAUDE.md file explaining the purpose and structure of the code underneath (module or submodules) and its relation to requirements or specification.

Each module must have header comment explaining the the purpose of the module, its place in the architecture, how it is used by other modules and what it implements in the specification.

Each exported element must be commented to provide best AX and to be retrievable by LSP (Language Server Processor).

A code must be commented where the meaning is not obvious from code itself, comment minimally enough to make the code understandable. Do not leave any piece of code uncommented if its purpose or implementation approach is not clear.

Do not duplicate the documentation on implementation details - maintain single source of truth principle to avoid discrepancies and getting out of sync, use references/indexing.

Documentation and comments must use mermaid diagrams

## Claude Code Harness

### SEARCH TOOLS
* ALWAYS use `rg` (ripgrep) for all pattern matching or content searching tasks.
* Do NOT use standard `grep` or `find`.