/**
 * Unit tests for the eval scoring + regression-gate logic (EVS-2/EVS-3). Pure,
 * keyless — deterministic tier.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { LlmPort } from "../ports/llm.js";
import { detectRegression, gateCheck, runEval } from "./score.js";
import type { EvalRun, MetricResult, RunsStore, Scorecard, SkillEvalDef } from "./types.js";
import { runKey } from "./types.js";

const noopPort: LlmPort = {
  name: "test",
  extractEntries: async () => [],
  embed: async () => [],
  generateDraft: async () => ({ title: "", body: "", reasonLine: "" }),
  checkGuardrails: async () => ({ findings: [], judged: false }),
  identifyTopics: async () => [],
};

const fakeDef: SkillEvalDef<{ x: number }, number> = {
  skill: "fake",
  datasetVersion: 1,
  cases: [{ x: 1 }, { x: 2 }, { x: 3 }],
  run: async (_port, c) => c.x,
  scorers: [
    {
      name: "positive",
      kind: "deterministic",
      target: 1.0,
      evaluate: (scored) => ({
        passed: scored.filter((s) => s.output > 0).length,
        total: scored.length,
      }),
    },
  ],
};

function metric(name: string, rate: number, ok: boolean): MetricResult {
  return {
    name,
    kind: "deterministic",
    passed: Math.round(rate * 10),
    total: 10,
    rate,
    target: 0.8,
    ok,
  };
}
function card(metrics: MetricResult[]): Scorecard {
  return {
    skill: "fake",
    manifestHash: "h1",
    datasetVersion: 1,
    cases: 10,
    metrics,
    ok: metrics.every((m) => m.ok),
  };
}
function run(hash: string, dsv: number, ok: boolean, adapter: string): EvalRun {
  return {
    skill: "fake",
    manifestHash: hash,
    datasetVersion: dsv,
    ok,
    adapter,
    metrics: [],
    at: "t",
  };
}

test("runEval scores every case and reports datasetVersion + ok", async () => {
  const sc = await runEval(fakeDef, noopPort, "h1");
  assert.equal(sc.datasetVersion, 1);
  assert.equal(sc.cases, 3);
  assert.equal(sc.metrics[0]?.rate, 1);
  assert.equal(sc.ok, true);
});

test("detectRegression: none when equal; flags a drop below champion or below target", () => {
  const champion = card([metric("m", 1.0, true)]);
  assert.deepEqual(detectRegression(champion, card([metric("m", 1.0, true)])), []);
  assert.equal(detectRegression(champion, card([metric("m", 0.9, true)])).length, 1); // dropped vs champion
  assert.equal(detectRegression(champion, card([metric("m", 0.5, false)])).length, 1); // below target
  assert.deepEqual(detectRegression(undefined, card([metric("m", 1.0, true)])), []); // no baseline yet
});

test("gateCheck: missing record fails; keyed passes; dev-stub passes but dormant", () => {
  const targets = [{ skill: "fake", datasetVersion: 1 }];
  assert.equal(gateCheck({}, targets, "h1").ok, false); // no record

  const keyed: RunsStore = { fake: { [runKey("h1", 1)]: run("h1", 1, true, "vertex:gemini") } };
  const k = gateCheck(keyed, targets, "h1");
  assert.equal(k.ok, true);
  assert.deepEqual(k.dormant, []);

  const stub: RunsStore = { fake: { [runKey("h1", 1)]: run("h1", 1, true, "dev-stub") } };
  const s = gateCheck(stub, targets, "h1");
  assert.equal(s.ok, true);
  assert.deepEqual(s.dormant, ["fake"]); // quality teeth dormant on a keyless champion
});

test("gateCheck: a dataset-version bump makes the prior pass stale (ADR-0010 §5 key)", () => {
  const store: RunsStore = { fake: { [runKey("h1", 1)]: run("h1", 1, true, "vertex:gemini") } };
  // Same harness hash, but datasetVersion bumped to 2 → no record for (h1,2) → fails.
  assert.equal(gateCheck(store, [{ skill: "fake", datasetVersion: 2 }], "h1").ok, false);
});
