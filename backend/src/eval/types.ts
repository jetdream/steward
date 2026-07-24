/**
 * @module @backend/eval/types
 *
 * Types for the AI evaluation & regression framework (EVS-2/EVS-3, ADR-0010).
 * A Skill's harness is scored against a dataset; runs are recorded keyed by the
 * ARC-27 harness-manifest hash so a harness change with no passing eval is caught.
 */
import type { LlmPort } from "../ports/llm.js";

/** The three scorer modes (ADR-0010 §2). `judge` is the keyed tier (deferred to real creds). */
export type ScorerKind = "deterministic" | "catch-rate" | "judge";

/** One case's input paired with the Skill's observed output. */
export interface Scored<C, O> {
  input: C;
  output: O;
}

/** A metric: reduces the scored cases to a passed/total, checked against a target. */
export interface Scorer<C, O> {
  name: string;
  kind: ScorerKind;
  /** Minimum acceptable rate in [0,1] (e.g. 1.0 = must always hold). */
  target: number;
  evaluate(scored: Scored<C, O>[]): { passed: number; total: number };
}

/** Provenance every in-repo dataset case must declare (SEC-4 — none org-sourced). */
export type CaseProvenance = "synthetic" | "curated" | "deidentified";

/** Regression-gate knobs (ADR-0010 §5 handed these to the eval spec). Runner defaults named. */
export interface EvalConfig {
  /** A challenger metric may drop at most this below the champion before it's a regression. */
  regressionTolerance: number;
  /** N-sample aggregation for the keyed tier (dampens LLM non-determinism). */
  samples: number;
  /** Minimum judge↔human agreement before the judge metric may gate (keyed tier). */
  judgeAgreementThreshold: number;
}

export const DEFAULT_EVAL_CONFIG: EvalConfig = {
  regressionTolerance: 0.02,
  samples: 3,
  judgeAgreementThreshold: 0.8,
};

/** One skill's eval definition: its versioned dataset, how to run a case, and its scorers. */
export interface SkillEvalDef<C, O> {
  skill: string;
  /** Bump when the dataset changes — it is part of the eval-run key (ADR-0010 §5). */
  datasetVersion: number;
  cases: C[];
  run(port: LlmPort, input: C): Promise<O>;
  scorers: Scorer<C, O>[];
  config?: Partial<EvalConfig>;
}

/** A metric's result within a scorecard. */
export interface MetricResult {
  name: string;
  kind: ScorerKind;
  passed: number;
  total: number;
  rate: number;
  target: number;
  ok: boolean;
}

/** The result of evaluating one skill against its dataset at a harness version. */
export interface Scorecard {
  skill: string;
  manifestHash: string;
  datasetVersion: number;
  cases: number;
  metrics: MetricResult[];
  ok: boolean;
}

/** A recorded eval run (the champion, once passing). */
export interface EvalRun {
  skill: string;
  manifestHash: string;
  datasetVersion: number;
  ok: boolean;
  /** The adapter that produced it — "dev-stub" is a MECHANISM record, NOT a quality pass. */
  adapter: string;
  metrics: MetricResult[];
  at: string;
}

/**
 * The runs store: skill → runKey → the recorded run, committed to git (in-repo,
 * self-contained per ADR-0003). `runKey` = `manifestHash#datasetVersion`, so a
 * dataset bump invalidates a recorded pass exactly as a harness bump does.
 */
export type RunsStore = Record<string, Record<string, EvalRun>>;

/** The eval-run record key (ADR-0010 §5): harness version AND dataset version. */
export function runKey(manifestHash: string, datasetVersion: number): string {
  return `${manifestHash}#${datasetVersion}`;
}
