/**
 * @module @backend/eval/store
 *
 * Read/write the eval-runs store (EVS-3) — `backend/src/eval/runs.json`, COMMITTED
 * to git. It records the passing champion per (skill, harness-manifest hash) so
 * the CI gate can verify a harness change was evaluated. Holds only scores +
 * metadata (no org content, SEC-4).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { EvalRun, RunsStore } from "./types.js";
import { runKey } from "./types.js";

const STORE_PATH = fileURLToPath(new URL("./runs.json", import.meta.url));

/** Load the runs store (empty object if the file is absent). */
export function loadRuns(): RunsStore {
  try {
    return JSON.parse(readFileSync(STORE_PATH, "utf8")) as RunsStore;
  } catch {
    return {};
  }
}

/** Persist the runs store with stable 2-space formatting (diff-friendly). */
export function saveRuns(store: RunsStore): void {
  writeFileSync(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`);
}

/** Record a run as the champion for its (skill, manifestHash#datasetVersion). */
export function recordRun(store: RunsStore, run: EvalRun): RunsStore {
  const bySkill = store[run.skill] ?? {};
  bySkill[runKey(run.manifestHash, run.datasetVersion)] = run;
  store[run.skill] = bySkill;
  return store;
}
