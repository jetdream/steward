/**
 * `npm run eval` — the KEYED / on-demand eval tier (EVS-2/EVS-3). Scores every
 * registered Skill's harness against its dataset, compares the challenger to the
 * recorded champion (regression detection), and records a passing run keyed by
 * the current harness-manifest hash. NOT run on every push (EVS-1 tier split).
 *
 * Uses the env-selected LLM adapter: real Vertex/Gemini when VERTEX_AI_KEY is
 * set, else the keyless dev stub (which exercises the framework + the
 * deterministic write-path policy, not real LLM quality).
 */
import { createLlmPort } from "../adapters/llm/index.js";
import { harnessManifestHash } from "../harness/manifest.js";
import { detectRegression, runEval } from "./score.js";
import { EVAL_SKILLS } from "./skills/index.js";
import { loadRuns, recordRun, saveRuns } from "./store.js";
import { runKey } from "./types.js";

async function main(): Promise<void> {
  const hash = harnessManifestHash();
  const port = createLlmPort();
  const store = loadRuns();
  let failed = false;

  console.log(`eval: harness ${hash} · adapter ${port.name}\n`);
  for (const def of EVAL_SKILLS) {
    const card = await runEval(def, port, hash);
    const prior =
      store[def.skill]?.[runKey(hash, def.datasetVersion)] ??
      Object.values(store[def.skill] ?? {}).at(-1);
    const tolerance = def.config?.regressionTolerance ?? 0;
    const regressions = detectRegression(prior, card, tolerance);
    for (const m of card.metrics) {
      console.log(
        `  [${m.ok ? "ok " : "FAIL"}] ${def.skill}/${m.name}: ${(m.rate * 100).toFixed(0)}% (target ${(m.target * 100).toFixed(0)}%)`,
      );
    }
    if (regressions.length) console.log(`  REGRESSION vs champion: ${regressions.join("; ")}`);

    if (card.ok && regressions.length === 0) {
      recordRun(store, {
        skill: def.skill,
        manifestHash: hash,
        datasetVersion: def.datasetVersion,
        ok: true,
        adapter: port.name,
        metrics: card.metrics,
        at: new Date().toISOString(),
      });
    } else {
      failed = true;
    }
  }

  saveRuns(store);
  console.log(
    failed
      ? "\neval: FAIL (blocked — fix before the harness change ships)"
      : "\neval: PASS (champion recorded)",
  );
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
