/**
 * LLM-call reliability (PIPE-6): retry-with-backoff on transient failure, a
 * per-call timeout, and a per-provider circuit-breaker. The LLM port is a network
 * dependency with no error handling of its own; this wraps every call. The
 * clock (now + sleep) is injectable so the retry/breaker logic is unit-testable
 * without real delays.
 */

/** Tuning for the resilience wrapper. */
export interface ResiliencePolicy {
  /** Extra attempts after the first (total attempts = retries + 1). */
  retries: number;
  /** Base backoff in ms; attempt N waits baseDelayMs * 2^(N-1). */
  baseDelayMs: number;
  /** Per-attempt timeout in ms. */
  timeoutMs: number;
  /** Consecutive failures that trip the breaker open. */
  breakerThreshold: number;
  /** How long the breaker stays open before a half-open trial. */
  breakerCooldownMs: number;
}

export const DEFAULT_POLICY: ResiliencePolicy = {
  retries: 2,
  baseDelayMs: 250,
  timeoutMs: 30_000,
  breakerThreshold: 5,
  breakerCooldownMs: 30_000,
};

/** Injectable clock — real by default; tests pass instant sleep + a fake now. */
export interface Clock {
  now(): number;
  sleep(ms: number): Promise<void>;
}

const realClock: Clock = {
  now: () => Date.now(),
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
};

/** Thrown when the breaker is open — the call is shed without hitting the provider. */
export class CircuitOpenError extends Error {
  constructor(key: string) {
    super(`circuit open for provider "${key}"`);
    this.name = "CircuitOpenError";
  }
}

/** Thrown when a single attempt exceeds the timeout. */
export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`llm call timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

interface BreakerState {
  consecutiveFailures: number;
  openedAt: number | null;
}

/** A retry + timeout + circuit-breaker runner shared across calls (per-key breakers). */
export function createResilience(
  policy: ResiliencePolicy = DEFAULT_POLICY,
  clock: Clock = realClock,
) {
  const breakers = new Map<string, BreakerState>();
  const breaker = (key: string): BreakerState => {
    let b = breakers.get(key);
    if (!b) {
      b = { consecutiveFailures: 0, openedAt: null };
      breakers.set(key, b);
    }
    return b;
  };

  async function withTimeout<T>(fn: () => Promise<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new TimeoutError(policy.timeoutMs)), policy.timeoutMs);
    });
    try {
      return await Promise.race([fn(), timeout]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  return {
    /** Run `fn` under the breaker for `key`, with timeout + retry/backoff. */
    async run<T>(key: string, fn: () => Promise<T>): Promise<T> {
      const b = breaker(key);
      if (b.openedAt !== null) {
        if (clock.now() - b.openedAt < policy.breakerCooldownMs) throw new CircuitOpenError(key);
        b.openedAt = null; // cooldown elapsed → half-open trial
      }
      let lastErr: unknown;
      for (let attempt = 0; attempt <= policy.retries; attempt++) {
        try {
          const out = await withTimeout(fn);
          b.consecutiveFailures = 0;
          b.openedAt = null;
          return out;
        } catch (err) {
          lastErr = err;
          b.consecutiveFailures++;
          if (b.consecutiveFailures >= policy.breakerThreshold) b.openedAt = clock.now();
          if (attempt < policy.retries) await clock.sleep(policy.baseDelayMs * 2 ** attempt);
        }
      }
      throw lastErr;
    },
    /** Test/introspection: consecutive-failure count for a key. */
    failures: (key: string) => breaker(key).consecutiveFailures,
  };
}
