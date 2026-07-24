/**
 * @module @backend/eval/score
 *
 * The scoring + regression-gate logic (EVS-2/EVS-3, ADR-0010). Pure functions —
 * no I/O, so they are unit-tested directly:
 * - `runEval` scores a Skill's harness against its dataset → a Scorecard.
 * - `detectRegression` compares a challenger scorecard to the recorded champion.
 * - `gateCheck` is the CI manifest-hash gate: is there a passing run on record
 *   for the current harness hash?
 */
import type { LlmPort } from "../ports/llm.js";
import type { EvalRun, MetricResult, RunsStore, Scorecard, Scored, SkillEvalDef } from "./types.js";
import { runKey } from "./types.js";

/** Score one skill's harness against its dataset (runs every case through `run`). */
export async function runEval<C, O>(
  def: SkillEvalDef<C, O>,
  port: LlmPort,
  manifestHash: string,
): Promise<Scorecard> {
  const scored: Scored<C, O>[] = [];
  for (const input of def.cases) {
    scored.push({ input, output: await def.run(port, input) });
  }
  const metrics: MetricResult[] = def.scorers.map((s) => {
    const { passed, total } = s.evaluate(scored);
    const rate = total === 0 ? 1 : passed / total;
    return {
      name: s.name,
      kind: s.kind,
      passed,
      total,
      rate,
      target: s.target,
      ok: rate >= s.target,
    };
  });
  return {
    skill: def.skill,
    manifestHash,
    datasetVersion: def.datasetVersion,
    cases: def.cases.length,
    metrics,
    ok: metrics.every((m) => m.ok),
  };
}

/**
 * Champion-vs-challenger (EVS-3): return the names of metrics that REGRESSED —
 * dropped below the champion's rate by more than `tolerance`, or fell below their
 * own target. An empty list ⇒ no regression. A missing champion ⇒ no regression
 * (first run establishes the baseline), but the challenger must still meet targets.
 */
export function detectRegression(
  champion: Scorecard | EvalRun | undefined,
  challenger: Scorecard,
  tolerance = 0,
): string[] {
  const regressed: string[] = [];
  const priorRate = new Map((champion?.metrics ?? []).map((m) => [m.name, m.rate]));
  for (const m of challenger.metrics) {
    if (!m.ok) {
      regressed.push(`${m.name} (below target ${m.target})`);
      continue;
    }
    const prior = priorRate.get(m.name);
    if (prior !== undefined && m.rate < prior - tolerance) {
      regressed.push(`${m.name} (${prior.toFixed(3)} → ${m.rate.toFixed(3)})`);
    }
  }
  return regressed;
}

/**
 * The regression gate (EVS-3): every skill must have a PASSING run recorded for
 * the CURRENT `(manifestHash, datasetVersion)` — so a harness OR dataset bump
 * invalidates a stale pass and forces a fresh eval. `failures` = missing/failed
 * records (the PROCESS teeth, active now). `dormant` = skills whose champion is a
 * keyless dev-stub record: the QUALITY-regression teeth are NOT active for them
 * (a keyless run does not attest LLM quality — ADR-0010; activates on the keyed
 * tier once creds land).
 */
export function gateCheck(
  store: RunsStore,
  targets: Array<{ skill: string; datasetVersion: number }>,
  currentHash: string,
): { ok: boolean; failures: string[]; dormant: string[] } {
  const failures: string[] = [];
  const dormant: string[] = [];
  for (const { skill, datasetVersion } of targets) {
    const key = runKey(currentHash, datasetVersion);
    const run = store[skill]?.[key];
    if (!run) failures.push(`${skill}: no eval on record for ${key} — run \`npm run eval\``);
    else if (!run.ok) failures.push(`${skill}: recorded eval for ${key} did not pass`);
    else if (run.adapter === "dev-stub") dormant.push(skill);
  }
  return { ok: failures.length === 0, failures, dormant };
}
