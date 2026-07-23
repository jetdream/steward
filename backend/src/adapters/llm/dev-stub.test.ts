/**
 * Unit tests for the keyless dev-stub adapter (ADR-0008 fallback, a RawLlmAdapter).
 * Pure, keyless — deterministic tier. Verifies the properties the brain spine
 * relies on: deterministic 1536-dim embeddings that rank by shared vocabulary,
 * rule-based extraction, and synthetic (zero-cost) usage reporting.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { EMBEDDING_DIM } from "../../ports/llm.js";
import { devStubLlm } from "./dev-stub.js";

const cosine = (a: number[], b: number[]): number => a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);

test("embed: deterministic, EMBEDDING_DIM long, L2-normalized, reports usage", async () => {
  const a = await devStubLlm.embed("we run a weekend food bank", "RETRIEVAL_DOCUMENT");
  const b = await devStubLlm.embed("we run a weekend food bank", "RETRIEVAL_DOCUMENT");
  assert.equal(a.vector.length, EMBEDDING_DIM);
  assert.deepEqual(a.vector, b.vector); // deterministic
  assert.ok(Math.abs(cosine(a.vector, a.vector) - 1) < 1e-9); // unit length
  assert.equal(a.usage.model, "dev-stub");
  assert.ok(a.usage.tokensIn > 0);
});

test("embed: shared vocabulary ranks closer than unrelated text (feature hashing)", async () => {
  const q = (await devStubLlm.embed("food assistance program", "RETRIEVAL_QUERY")).vector;
  const near = (await devStubLlm.embed("we run a weekend food program", "RETRIEVAL_DOCUMENT"))
    .vector;
  const far = (await devStubLlm.embed("annual gala ticket pricing", "RETRIEVAL_DOCUMENT")).vector;
  assert.ok(cosine(q, near) > cosine(q, far), "shared-token text must be nearer");
});

test("extract: rule/taboo cues classify; plain statements are facts; usage reported", async () => {
  const taboo = await devStubLlm.extract("never name individual donors", {
    correctionChannel: false,
  });
  assert.equal(taboo.entries[0]?.kind, "taboo");
  assert.equal(taboo.usage.model, "dev-stub");
  const rule = await devStubLlm.extract("always keep it warm", { correctionChannel: false });
  assert.equal(rule.entries[0]?.kind, "styleRule");
  const fact = await devStubLlm.extract("we serve 200 families a week", {
    correctionChannel: false,
  });
  assert.equal(fact.entries[0]?.kind, "fact");
  assert.deepEqual((await devStubLlm.extract("   ", { correctionChannel: false })).entries, []);
});
