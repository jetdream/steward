---
kind: adr
title: AI evaluation & regression-testing framework
status: accepted
supersedes: ~
---

# ADR-0010 — AI evaluation & regression-testing framework

<!--
Design gate: cortex:architect-challenger, 2026-07-23. r1 FAIL → all 6 findings
fixed → r2 delta PASS. r1 HIGHs (SEC-4 dataset storage split; the champion/
challenger gate's statistical discipline + judge calibration, LRN-20 at the eval
layer) resolved in §1/§2/§4/§5/§6.
-->


## Context

Steward's value depends on AI OUTPUT QUALITY (G-2: ≥70% of drafts approved
without edits by an org's week 8), and the whole subsystem will be iterated by
changing the **agentic harness** — prompts, tools, and models (ADR-0008/ADR-0009).
The founder's explicit requirement: *a harness change must not silently degrade
agent performance.*

Today the project has a mature **vocabulary** for AI quality but **no system**:
the specs assert "a labeled adversarial catch-rate test" per capability (MEMS-3,
CHTS-1, TOPS-1, ONBS-2, INTS-1, the LRN-20 pattern) and the goals define the
outcome metrics (G-2..G-5), but there is **no eval dataset defined anywhere, no
scorer, no runner, no version-comparison, zero `assurance: verified` specs, no
`@verifies`/`@validates` markers, and no test runner installed at all**. Worse,
`.spec/CLAUDE.md` and DEC-3 claim an "acceptance harness" runs on pre-push — it
**does not exist** (pre-push runs only docs-check + typecheck + lint). Regression
today means only docs-graph freshness (stale pins, broken unit tests), which
cannot detect AI-quality degradation.

DEC-41 records the founder's choices: a **bespoke in-repo** eval harness (no
external SaaS — ADR-0003 self-contained dev) and a **tiered** regression gate.
Because ADR-0009 adopts a bounded multi-step agent, evaluation must score
**trajectories**, not only final output.

## Options considered

1. **Bespoke in-repo runner (chosen, DEC-41).** Dataset files + a scorer in the
   repo, executing a Skill's exact harness config through the ADR-0009 runtime.
   No vendor, runs locally + in CI, full control over trajectory scoring and the
   cortex assurance integration. Con: more code to own.
2. **Adopt an OSS eval lib run locally** (promptfoo/evalite-style). Less code;
   adds a dependency and an impedance mismatch with our Skill/port model and the
   cortex `@verifies` evidence markers. Not chosen now; revisitable behind the
   runner's interface.
3. **Hosted eval platform** (Braintrust/Langsmith-style). Best UX; but external
   SaaS — org data leaves the self-contained boundary (SEC-4), and lock-in — in
   direct tension with ADR-0003. Rejected.

## Decision

Build a bespoke, in-repo **AI evaluation & regression framework**, and make
passing it a **gate on any agentic-harness change**.

**1. Eval datasets are versioned, first-class artifacts.** Per Skill: a **golden
set** (representative inputs with expected-good properties) and **labeled
adversarial sets** (the taboo-violating, fabricated-extraction, sensitive-topic,
off-mission cases the specs already reference), versioned, each case carrying
inputs + expected signals + provenance. Every catch-rate acceptance in a spec
(MEMS-3, CHTS-1, TOPS-1, ONBS-2) names its dataset + a **numeric target** (today
all placeholders).
- **Storage split (SEC-4, hard).** The versioned in-repo dataset
  (`eval/datasets/<skill>.jsonl`) holds ONLY **synthetic / curated / fully
  de-identified** cases — a git-committed, repo-distributed artifact cannot honor
  a per-org hard-delete (BIL-2) and is not org-scoped, so real org-confidential
  content (interview/chat/draft text, SEC-4) may **never** be committed to it.
  Any case sourced from a real org lives in the **org-scoped, deletable store**
  (the same Memory/DB confinement, purged on BIL-2), never in git. The flywheel
  (item 6) curates *de-identified* cases from org signal into the in-repo set;
  raw org content stays in the deletable store.

**2. A three-mode scorer.** Each Skill's output is scored by:
- **Deterministic checks** — hard styleRules (char limits, mandatory citation
  GR-5, no-picture gate), structural conformance. Cheap, keyless, exact.
- **Catch-rate** — guardrail/taboo/sensitive-topic/no-fabrication detection over
  the adversarial sets, reported as a rate against the spec's target (the LRN-20
  measurement, plus the GR-8/GR-3 escalation-fired check).
- **LLM-as-judge** — subjective quality (voice/tone VAL-5, grounding/no-invention
  VAL-4, on-mission) against a rubric, via the same LLM port (a distinct judge
  model/config), used only where a deterministic check can't decide. The judge is
  itself an LLM check with a residual error rate (LRN-20): it MUST be **calibrated
  against the human-labeled sets** (its agreement with human labels measured and
  tracked), and it is **never a sole, uncalibrated blocking authority** — see the
  gate discipline in item 5.

**3. Trajectory scoring (ADR-0009 consequence).** For multi-step skills the
runner captures the full trajectory (tool calls, steps, tokens, cost, latency)
and scores **tool-choice correctness, step efficiency, termination safety, and
cost-per-task** — so a change that makes the agent wander (more steps/cost, same
answer) is a detectable regression even when the final output looks fine.

**4. Metrics tie to the goals.** An offline **approve-without-edit proxy** (a
judge estimate), grounding/no-fabrication rate (VAL-4), and the per-guardrail
catch-rates. The proxy is a **leading indicator only** — it informs harness
iteration but **never satisfies the G-2 `validated`/`achieved` outcome tier**,
which `goals.yaml` gates on a real cohort-measurement record computed on the
honest pre-QA basis (OPSS-1 / LRN-24). Offline proxy and the online G-2 field
metric stay orthogonal; the offline suite is calibrated against the online
outcome over time (item 6), not substituted for it.

**5. The regression gate — tiered (DEC-41).**
- **Every commit (CI, keyless) — this IS the pre-push acceptance harness:** the
  deterministic + dev-stub tests run — free, self-contained, no live model calls.
  This tier is what `.spec/CLAUDE.md`/DEC-3 mean by the pre-push "acceptance
  harness" (reconciled here); the keyed eval below is NOT a pre-push gate (a live
  eval on every push would break self-contained CI, ADR-0003).
- **On any harness-artifact change** (a prompt/tool/model/agentPolicy version
  bump) **and on demand:** the full LLM eval runs against a keyed env as a
  **champion-vs-challenger** comparison — the new harness vs. the recorded
  baseline.
- **Repeatability discipline (so the gate has teeth, not noise — LRN-20 at the
  eval layer):** live eval runs are repeatability-controlled (pinned decode
  params + N-sample aggregation), and the **judge/proxy tier is never a sole,
  uncalibrated blocking authority** — the hard blocking authority is the
  deterministic + catch-rate tiers (and the GR-3/GR-8 escalation-fired checks);
  a judge/proxy regression is gated only on a **calibrated** score moving beyond
  a statistically-meaningful tolerance. Exact tolerances, sample counts, and the
  judge-agreement threshold are set in the eval spec, not here.
- **Enforcement seam (not prose discipline):** CI records each passing eval keyed
  by `(skill, prompt-version, model, dataset-version)`; a check **diffs the
  ADR-0009 harness-manifest hash** against those records and **fails if a harness
  change has no passing keyed eval on record** — so a prompt/tool/model bump
  cannot merge un-evaluated. (The cortex docs-graph cascade tracks YAML `v:` pins
  and code markers; it does NOT see prompt-file changes — hence this explicit
  manifest-hash check rather than relying on the graph cascade.) A new champion
  is promoted explicitly.

**6. The flywheel.** OPSS-1 operator-QA judgments and real approve/edit/skip
outcomes (the G-2 signal) feed back to grow the labeled datasets, so offline eval
tracks online reality and coverage compounds. Per §1's hard storage split, the
flywheel curates only de-identified cases into the in-repo set; raw org content
stays in the org-scoped deletable store (SEC-4/BIL-2), never in git.

**7. Integration with cortex assurance.** Eval-backed acceptance becomes real
evidence: a Skill spec-element raised to `assurance: verified` is backed by an
`@verifies` eval test, and the framework makes MEMS-3's deferred promise ("raise
to verified with an @verifies test when code lands") concrete. This also requires
standing up the missing **test substrate** — a real runner (vitest), the
`@verifies`/`@validates` markers, and the acceptance-harness that DEC-3 already
claims exists — closing that doc-vs-reality gap.

## Consequences

- **Makes "harness changes never degrade the agent" operational** — the champion/
  challenger gate is the enforcement, not discipline.
- **Turns the specs' placeholder catch-rates into real, numeric, dataset-backed
  acceptances**, and activates the dormant `verified`/`@verifies`/`@validates`
  assurance rungs.
- **Cost is bounded**: CI stays keyless/free; live evals run only on harness
  change / on demand, and trajectory cost is itself a scored budget.
- **New artifacts**: an `eval/` tree (datasets + runner + scorers), a test runner,
  and a new cross-cutting **AI-evaluation requirement register** scoped as
  **verification/assurance** (traceable to the DEC-3 governance lineage + the
  goals' outcome tier) — NOT a product capability on the G-2 approval-rate path
  (G-2 coverage is already `complete` in `goals.yaml`; eval *tests that we produce
  good drafts*, it does not *produce* them), so it adds no coverage double-count.
  Each artifact is challenger-gated. `.spec/CLAUDE.md`/DEC-3's acceptance-harness
  claim gets a real implementation.
- **Depends on ADR-0009** (the Skill/harness object is what an eval run executes
  and compares) and on the ADR-0008 keyed provider for live runs; the keyless dev
  stub backs the deterministic tier.
- Revisit the bespoke-vs-adopt choice if the runner's maintenance cost outgrows
  its value — swap the engine behind its interface, a superseding ADR.
