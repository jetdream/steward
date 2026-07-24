/**
 * Unit tests for the EXTS-1 R-4 source guard: a candidate survives only if its URL
 * is provenance-bound (in the grounding sources) AND dereferenceable — a
 * hallucinated (not-in-sources) or dead link is dropped before the GR-5 citation.
 * Pure, deterministic, no network (deref is injected) — LRN-20.
 *
 * @verifies EXTS-1 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { SearchCandidate } from "../ports/llm.js";
import { applyR4Guard, provenanceBound } from "./guard.js";

const cand = (url: string): SearchCandidate => ({
  source: "Example News",
  url,
  title: "t",
  summary: "s",
  relevanceRationale: "r",
  topicId: "m1",
});

const GROUNDED = "https://a.org/live";
const DEAD = "https://a.org/dead";
const HALLUCINATED = "https://not-grounded.org/made-up";
const sources = [GROUNDED, DEAD]; // both cited by grounding; DEAD does not resolve
const deref = async (u: string) => u !== DEAD;

test("provenanceBound is true only for a URL in the grounding sources set", () => {
  const set = new Set(sources);
  assert.equal(provenanceBound(cand(GROUNDED), set), true);
  assert.equal(provenanceBound(cand(HALLUCINATED), set), false);
});

test("the R-4 guard keeps only provenance-bound + dereferenceable candidates", async () => {
  const kept = await applyR4Guard([cand(GROUNDED), cand(DEAD), cand(HALLUCINATED)], sources, deref);
  assert.deepEqual(
    kept.map((c) => c.url),
    [GROUNDED],
  );
});

test("with no grounding sources, every candidate is dropped (never cite the ungrounded)", async () => {
  const kept = await applyR4Guard([cand(GROUNDED), cand(HALLUCINATED)], [], async () => true);
  assert.equal(kept.length, 0);
});
