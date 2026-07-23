/**
 * Unit tests for the keyless dev-stub LLM adapter (ADR-0008 fallback). Pure,
 * keyless, no I/O — the every-commit deterministic tier (EVS-1). Verifies the
 * two properties the brain spine relies on: deterministic 1536-dim embeddings
 * that rank by shared vocabulary, and rule-based extraction.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { EMBEDDING_DIM } from "../../ports/llm.js";
import { devStubLlm } from "./dev-stub.js";

const cosine = (a: number[], b: number[]): number => a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);

test("embed: deterministic, EMBEDDING_DIM long, L2-normalized", async () => {
  const a = await devStubLlm.embed("we run a weekend food bank", "RETRIEVAL_DOCUMENT");
  const b = await devStubLlm.embed("we run a weekend food bank", "RETRIEVAL_DOCUMENT");
  assert.equal(a.length, EMBEDDING_DIM);
  assert.deepEqual(a, b); // deterministic
  assert.ok(Math.abs(cosine(a, a) - 1) < 1e-9); // unit length
});

test("embed: shared vocabulary ranks closer than unrelated text (feature hashing)", async () => {
  const q = await devStubLlm.embed("food assistance program", "RETRIEVAL_QUERY");
  const near = await devStubLlm.embed("we run a weekend food program", "RETRIEVAL_DOCUMENT");
  const far = await devStubLlm.embed("annual gala ticket pricing", "RETRIEVAL_DOCUMENT");
  assert.ok(cosine(q, near) > cosine(q, far), "shared-token text must be nearer");
});

test("extractEntries: rule/taboo cues classify; plain statements are facts", async () => {
  const [taboo] = await devStubLlm.extractEntries("never name individual donors", {
    correctionChannel: false,
  });
  assert.equal(taboo?.kind, "taboo");
  const [rule] = await devStubLlm.extractEntries("always keep it warm", {
    correctionChannel: false,
  });
  assert.equal(rule?.kind, "styleRule");
  const [fact] = await devStubLlm.extractEntries("we serve 200 families a week", {
    correctionChannel: false,
  });
  assert.equal(fact?.kind, "fact");
  assert.deepEqual(await devStubLlm.extractEntries("   ", { correctionChannel: false }), []);
});
