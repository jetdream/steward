/**
 * Unit tests for the generate-draft Skill (GENS-7): the terminal outcomes over
 * the keyless dev-stub (whose guardrail judge is DORMANT — no content heuristic),
 * and the bounded VAL regenerate loop driven by a fake judge that keeps flagging
 * a fixable finding. No regex/keyword detection anywhere (LRN-20).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { devStubLlm } from "../adapters/llm/dev-stub.js";
import { createLlmPort } from "../adapters/llm/index.js";
import { HARNESS } from "../harness/manifest.js";
import { instrumentLlm } from "../observability/instrument.js";
import type { ContentSlot, GuardrailFinding, LlmPort } from "../ports/llm.js";
import { assembleGrounding, generateDraft } from "./generate.js";

const port = createLlmPort(); // keyless dev-stub (no VERTEX_AI_KEY)
const slot: ContentSlot = { type: "mission", subject: "our food bank", designation: "none" };
const maxRegenerate = HARNESS["generate-draft"]?.agentPolicy.maxRegenerate ?? 0;

test("a clean master passes in one attempt (dev-stub judge dormant, no overlay)", async () => {
  const r = await generateDraft(port, {
    orgId: "eval",
    slot,
    grounding: "Our food bank served 40 families this month.",
    overlay: [],
  });
  assert.equal(r.val.outcome, "pass");
  assert.equal(r.val.judged, false);
  assert.equal(r.attempts, 1);
});

test("an active taboo overlay escalates immediately (GR-8 backstop, terminal)", async () => {
  const r = await generateDraft(port, {
    orgId: "eval",
    slot: { ...slot, subject: "a thank-you" },
    grounding: "Thank you to everyone who supports our work.",
    overlay: ["never name individual donors"],
  });
  assert.equal(r.val.outcome, "escalate");
  assert.equal(r.attempts, 1);
  assert.equal(
    r.val.findings.some((f) => f.guardrail === "GR-8"),
    true,
  );
});

test("a persistently-flagged fixable finding regenerates to the cap, then escalates", async () => {
  // A judge that ALWAYS flags a fixable GR-1 finding — models a violation the
  // generator cannot fix, so the bounded loop exhausts and escalates (PIPE-4).
  const stubbornFinding: GuardrailFinding = {
    guardrail: "GR-1",
    severity: "fixable",
    reason: "promises an outcome",
  };
  const fakeAdapter = {
    ...devStubLlm,
    name: "fake",
    async judgeGuardrails(input: Parameters<typeof devStubLlm.judgeGuardrails>[0]) {
      const { usage } = await devStubLlm.judgeGuardrails(input);
      return { judgment: { findings: [stubbornFinding], judged: true }, usage };
    },
  };
  const fakePort: LlmPort = instrumentLlm(fakeAdapter);

  const r = await generateDraft(fakePort, {
    orgId: "eval",
    slot,
    grounding: "Give today.",
    overlay: [],
  });
  assert.equal(r.val.outcome, "escalate");
  assert.equal(r.attempts, maxRegenerate + 1);
  assert.match(r.val.note ?? "", /regenerate cap/i);
});

test("assembleGrounding flattens a package: taboos precede style rules", () => {
  const { grounding, overlay } = assembleGrounding({
    grounding: [
      { subject: "Program", content: "weekend food bank" },
      { subject: null, content: "40 families served" },
      // biome-ignore lint/suspicious/noExplicitAny: test fixture — only subject/content are read.
    ] as any,
    overlay: {
      // biome-ignore lint/suspicious/noExplicitAny: test fixture — only subject/content are read.
      taboos: [{ subject: null, content: "never name donors" }] as any,
      // biome-ignore lint/suspicious/noExplicitAny: test fixture — only subject/content are read.
      styleRules: [{ subject: null, content: "keep it warm" }] as any,
    },
    thin: false,
  });
  assert.match(grounding, /Program: weekend food bank/);
  assert.match(grounding, /40 families served/);
  assert.deepEqual(overlay, ["never name donors", "keep it warm"]);
});
