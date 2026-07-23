/**
 * Observability context (PIPE-5) — carries the org + skill (+ trajectory) of the
 * in-flight AI work down to the LLM port without threading it through every
 * signature, via AsyncLocalStorage. The instrumenting wrapper reads it to
 * attribute a ModelCall (DM-19) to its org/skill; the ARC-27 runtime (B5) sets
 * it per Skill invocation. Absent context ⇒ the call is un-attributed and the
 * ModelCall row is skipped (e.g. unit tests, or calls outside an org scope).
 */
import { AsyncLocalStorage } from "node:async_hooks";

/** The ambient AI-work context for the current async chain. */
export interface ObsContext {
  orgId: string;
  /** The ARC-27 Skill id (e.g. "extract-memory", "embed-memory"). */
  skill: string;
  /** Trajectory run id for a bounded multi-step Skill (ADR-0010), when applicable. */
  runId?: string;
  stepIndex?: number;
  /** The versioned prompt template in use, when applicable. */
  promptVersion?: string;
}

const storage = new AsyncLocalStorage<ObsContext>();

/** Run `fn` with an observability context bound for its whole async subtree. */
export function withObsContext<T>(ctx: ObsContext, fn: () => Promise<T>): Promise<T> {
  return storage.run(ctx, fn);
}

/** The current observability context, or undefined outside any bound scope. */
export function currentObsContext(): ObsContext | undefined {
  return storage.getStore();
}
