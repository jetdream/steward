# scripts/ — Repo Tooling

Zero-dependency Node 24. All tooling obeys spec-first — specs in [docs/specs/](../docs/specs/).

| Path | Purpose | Spec |
|---|---|---|
| `docs-check.mjs` | Documentation graph lint: ID uniqueness, referential integrity, stale version pins (cascade lists), schema validity, coverage/registers reports. `node scripts/docs-check.mjs [--json]`; `--json` emits the canonical per-item registry. Run before every commit; joins CI with the week-1 skeleton. | [dcx-docs-check.yaml](../docs/specs/dcx-docs-check.yaml) |
| `lib/docs-graph.mjs` | Shared YAML-subset parser + graph builder (strict subset: parse errors are the guard against silent indentation accidents). Used by the lint and the hooks. | [dcx-docs-check.yaml](../docs/specs/dcx-docs-check.yaml) |
| `test-docs-check.mjs` | Executable acceptance for the lint: materializes a mutated copy of the tree per case (via `DOCS_CHECK_ROOT`), asserts exit codes and pointing messages. Run by pre-push; challenge re-rounds verify fixes with it. | [dcx-docs-check.yaml](../docs/specs/dcx-docs-check.yaml) |
| `lib/session-ledger.mjs` | Per-session record of which contract IDs the agent has loaded (temp-dir JSON). | [ctx-context-hooks.yaml](../docs/specs/ctx-context-hooks.yaml) |
| `hooks/docs-lint-hook.mjs` | PostToolUse (Edit\|Write): lints on every docs/scripts edit, feeds errors back to the agent immediately (exit 2). | [ctx-context-hooks.yaml](../docs/specs/ctx-context-hooks.yaml) |
| `hooks/resolve-ids-hook.mjs` | UserPromptSubmit: resolves IDs mentioned in prompts into a labeled context block; bounded, ledger-deduplicated. | [ctx-context-hooks.yaml](../docs/specs/ctx-context-hooks.yaml) |
| `hooks/read-ledger-hook.mjs` | PostToolUse (Read): marks IDs defined in the read file as seen in the session ledger. | [ctx-context-hooks.yaml](../docs/specs/ctx-context-hooks.yaml) |
| `hooks/write-guard-hook.mjs` | PreToolUse (Edit\|Write): deny-once guard — blocks a change touching contracts the session never loaded, injecting their excerpts; the retried edit passes. | [ctx-context-hooks.yaml](../docs/specs/ctx-context-hooks.yaml) |

Hooks are wired in `.claude/settings.json` (project-scoped).
