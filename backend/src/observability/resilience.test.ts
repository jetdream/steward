/**
 * Unit tests for LLM-call reliability (PIPE-6). Pure, keyless — deterministic
 * tier. An injected clock (instant sleep + controllable now) makes retry/backoff
 * and the circuit-breaker testable without real delays.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CircuitOpenError, type Clock, createResilience } from "./resilience.js";

function fakeClock(): Clock & { advance: (ms: number) => void } {
  let t = 0;
  return {
    now: () => t,
    sleep: async () => {},
    advance: (ms) => {
      t += ms;
    },
  };
}

const policy = {
  retries: 2,
  baseDelayMs: 1,
  timeoutMs: 10_000,
  breakerThreshold: 3,
  breakerCooldownMs: 1000,
};

test("retry: succeeds after transient failures within the retry budget", async () => {
  const r = createResilience(policy, fakeClock());
  let calls = 0;
  const out = await r.run("p", async () => {
    calls++;
    if (calls < 3) throw new Error("transient");
    return "ok";
  });
  assert.equal(out, "ok");
  assert.equal(calls, 3); // 1 + 2 retries
});

test("retry: exhausts and rethrows the last error", async () => {
  const r = createResilience(policy, fakeClock());
  await assert.rejects(
    r.run("p2", async () => {
      throw new Error("always");
    }),
    /always/,
  );
});

test("circuit-breaker: opens after threshold consecutive failures, then sheds", async () => {
  const clock = fakeClock();
  const r = createResilience({ ...policy, retries: 0 }, clock);
  const boom = () =>
    r.run("p3", async () => {
      throw new Error("down");
    });
  for (let i = 0; i < policy.breakerThreshold; i++) await assert.rejects(boom(), /down/);
  // Breaker now open → the next call is shed immediately (no provider hit).
  await assert.rejects(boom(), (e) => e instanceof CircuitOpenError);
});

test("circuit-breaker: half-opens after the cooldown and closes on success", async () => {
  const clock = fakeClock();
  const r = createResilience({ ...policy, retries: 0 }, clock);
  for (let i = 0; i < policy.breakerThreshold; i++) {
    await assert.rejects(
      r.run("p4", async () => {
        throw new Error("down");
      }),
      /down/,
    );
  }
  await assert.rejects(
    r.run("p4", async () => "x"),
    (e) => e instanceof CircuitOpenError,
  );
  clock.advance(policy.breakerCooldownMs + 1); // cooldown elapsed → half-open trial allowed
  assert.equal(await r.run("p4", async () => "recovered"), "recovered");
  assert.equal(r.failures("p4"), 0);
});
