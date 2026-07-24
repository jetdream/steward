# backend/src/eval/ — AI evaluation & regression framework (EVS-2/EVS-3)

**Purpose.** Score a Skill's harness against a versioned dataset and gate harness
changes on non-regression. Realizes the behaviour spec **EVS** (EVS-2 runner +
datasets + scorers → EVAL-1; EVS-3 the champion-vs-challenger regression gate →
EVAL-2) over ADR-0010.

| File | Role |
|---|---|
| `types.ts` | Scorer/Scorecard/EvalRun/RunsStore + `runKey(hash, datasetVersion)` + `DEFAULT_EVAL_CONFIG` |
| `score.ts` | `runEval` (score a skill), `detectRegression` (champion↔challenger), `gateCheck` (the CI gate) — pure |
| `store.ts` | read/write `runs.json` (in-repo committed, self-contained — ADR-0003) |
| `skills/*.ts` | per-Skill eval defs (dataset + `run` + scorers); registered in `skills/index.ts` |
| `run.ts` | `npm run eval` — the keyed/on-demand tier; records a champion |
| `gate.ts` | `npm run eval:gate` — the keyless regression-gate check |

**Keying (ADR-0010 §5).** Runs are recorded by `(skill, manifestHash#datasetVersion)`
so a prompt/model/policy bump OR a dataset change invalidates a stale pass.

**Keyed-satisfies-the-gate.** Only a KEYED run (real provider) attests LLM
quality. The keyless dev-stub is prompt-insensitive, so a dev-stub champion is a
MECHANISM record — the QUALITY-regression teeth are DORMANT (the gate says so)
and activate on the keyed tier once creds land. The PROCESS teeth (a fresh eval
recorded for the current key) are active now.

**SEC-4.** In-repo dataset cases are synthetic/curated/de-identified only (each
carries a `provenance` tag); `runs.json` holds scores + metadata, no org content.

**Not yet wired as a hard CI blocker** — the gate is available on demand; it
becomes a required CI step when the keyed tier (VERTEX_AI_KEY) is configured.
EVAL-3 (trajectory scoring) lands with GEN (the first multi-step Skill).
