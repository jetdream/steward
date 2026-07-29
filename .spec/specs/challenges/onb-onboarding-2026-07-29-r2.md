---
kind: challenge-record
spec: .spec/specs/onb-onboarding.yaml
round: 2
date: 2026-07-29
verdict: fail
by: "cortex:challenge — four-lens panel (design-conformance · implementation-divergence · SPLIT+over-structure · reachability+hidden-assumptions), merged by the invoker"
findings:
  r2-h1:
    severity: high
    status: open
    summary: >-
      ONBS-6 keys the calibration flag to the org's context state and never defines the
      threshold; the codebase's two ONBS-6-tagged carriers of "thin" are the exact complement of
      readyForFirstDrafts, so under the graph's only definition no item can ever carry the flag.
  r2-h2:
    severity: high
    status: open
    summary: >-
      The predicate's second conjunct — the STRS-2 seed Strategy — has no producer anywhere, so
      readyForFirstDrafts can never become true and this element's own acceptance (a) is
      unsatisfiable in production.
  r2-m1:
    severity: medium
    status: open
    summary: >-
      ONBS-6 is now the largest element in the project (7983 chars) and carries three
      independently failing units of HOW — the MVC predicate, the calibration flag, and the
      day-one narration bound. The flag's homelessness inside it is what makes r2-h1 unfixable in place.
  r2-m2:
    severity: medium
    status: open
    summary: >-
      Acceptance (f) was semantically inverted this round with no v bump, so no cascade fired and
      every ONBS-6@2 pin plus three code-header pins stayed green.
  r2-m3:
    severity: medium
    status: open
    summary: >-
      The "three framed cards followed by nine unframed ones" argument is arithmetically
      impossible under GENS-9's rate — nine more cards is three weeks — so the load-bearing
      rationale for context-keying is false even though its conclusion is right.
  r2-m4:
    severity: medium
    status: open
    summary: >-
      "The day-one narration persists until the first batch lands or visibly fails" has no
      observation channel — no polling, no subscription, and refreshKnowledge does not invalidate
      the ready stack. INC-13 covers the condition, not the channel.
  r2-m5:
    severity: medium
    status: open
    summary: >-
      The snag state has no clearing condition: once GENS-8 dead-letters and GENS-9's safety net
      delivers, nothing states what the home says when cards land under "that didn't work".
  r2-m6:
    severity: medium
    status: open
    summary: >-
      The level trigger fires mid-ingest — ingest commits per artifact, so the first batch plans
      on the first two facts while nineteen more are still being scraped, gutting DEC-44 (4)'s premise.
  r2-l1:
    severity: low
    status: open
    summary: >-
      DM-5 still names the field "FIRST-BATCH CALIBRATION FLAG" and defines it as marking a draft
      as part of the org's first batch — producer-keyed in its own title, contradicting this element.
---

# Challenge record — the DEC-47 scope-review split, round 2 of this chain

VERDICT: fail

Continues `onb-onboarding-2026-07-19-r1.md`. Append-only; the earlier record stands unedited.

**Chain-hygiene note, recorded because it changes how this chain's history reads.** Rounds 2–6 of
the `job-runner` delta challenged `ONBS-6` alongside `GENS-8` but wrote their records into the
`gen-content-generation` chain **only**, and this spec's `challenge:` block pointed at
`gen-content-generation-2026-07-26-r6.md` — another chain's record. The consequence is exactly the
one the challenge policy warns about: this chain stayed a contiguous single round, its derived
consecutive-fail depth stayed 0 however many paired fails accrued, and `docs-check` raised no
convergence signal for this spec while raising one for its sibling. This record is the first
written into this chain since r1, and it is numbered r2 in **this** chain's own sequence. Finding
ids are per-chain: `r2-h1` here is the same defect as `r7-h1` in the sibling record.

Companion record for the same round:
`.spec/specs/challenges/gen-content-generation-2026-07-29-r7.md`. Read them together — the panel
ran once, over both specs.

## The two highs

**`r2-h1` — the calibration flag cannot fire.** This element's statement says in capitals that the
flag is keyed to the ORG'S CONTEXT STATE, NOT TO THE PRODUCER, and argues the case well: the
sweeper reaches the same thin org the next morning, so producer-keying would follow framed cards
with unframed ones presented as finished work. This round corrected acceptance (f), which had
carried the producer-keyed form and contradicted the statement it claimed to test — that is right
as far as it goes. What it exposed is that **the key itself is undefined.** `GENS-9` (d) explicitly
disclaims ownership ("the thinness threshold itself is ONBS-6's to define"), and this element does
not define it.

The codebase makes it worse rather than better. `backend/src/memory/retrieve.ts:24-25` sets
`THIN_THRESHOLD = 2` with the comment "Below this many grounding entries an org's Memory is treated
as thin (ONBS-6)", and `backend/src/onboarding/index.ts:165-167` returns the note "still thin" on
the `!ready` branch. But `readyForFirstDrafts` requires ≥1 identity fact **and** ≥1 program-or-story
fact — that is ≥2 grounding entries, so `ready ⟹ thin === false`, **exactly at the boundary**. Both
producers are predicate-gated. Under the only definition of "thin" the graph or the code offers, no
item can ever carry the flag, and both the clause here and `GENS-9` (d) are vacuously true over an
empty set.

The falsifying half also went missing: this round deleted "absent on refill items" from (f) and
`GENS-9` (d) explicitly declines to assert it, so **no clause anywhere now says any item lacks the
flag.** A conforming implementation may stamp every item forever — putting "here's my first go —
tell me what's off" on month-six cards — and nothing goes red.

Note the third meaning in play: `MEMS-4`'s thinness signal fires on *empty* Memory, a different
predicate again. "Thin" now carries three meanings across the graph, which is a
semantic-clarity-rule breach in its own right.

**Fix.** Define the predicate once, in the element that owns the flag, as a checkable boolean named
distinctly from `readyForFirstDrafts` and from `MEMS-4`'s retrieval thinness — and restore a
negative criterion, which is the only clause that can fail. See `r2-m1`: the flag needs to *be* an
element before it can own a predicate.

**`r2-h2` — the predicate can never become true.** `readyForFirstDrafts` is a conjunction: grounded
Memory **AND** a seed Strategy (`STR-2`). `INC-12` named three orphaned procedures; the sibling
delta gives invokers to two of them and leaves `strategy.autoDraft` unowned *while this element
makes it a hard conjunct of the gate*. `backend/src/onboarding/ingest.ts:59-84` writes Memory only
and never a StrategyDoc, despite `ONBS-2` claiming ingestion seeds `STR-2`; the deferral is
recorded only in a code comment (`backend/src/onboarding/index.ts:136-146`), not in `.spec`. The two
writers of `strategy_doc` are a mutation with zero client callers and a founder-typed edit — the
"tool they operate" that `DEC-44` (1) rejects.

So this element's acceptance (a) — "drafts are PRESENT inside the first-session window" — is
unsatisfiable in production while passing in test, because `backend/src/demo/seed.ts:357` inserts
the `strategy_doc` row. That is `INC-12` behind a green gate.

The transferable rule, which is the most valuable thing this round produced:
**every conjunct of a gating predicate needs a named producer, not just a named observer.**

## The structural finding

`r2-m1`. At 7983 chars this is the largest element in the project, and the scope review that split
its sibling did not touch it. It carries three units of HOW that can be realized, verified and
broken separately, in different code:

1. the minimum-viable-context predicate (an onboarding computation);
2. the calibration flag — framing rationale, keying rule, per-item retirement, redirect-clearing,
   `DSS-8` rendering (a `DM-5` field plus card rendering plus `approval.redirect`);
3. the day-one narration bound and its `INC-13` / `XH-12` landing condition (the home's shape).

One `realization:` assertion cannot honestly cover all three. This is not a "steady-state inside
onboarding" objection — the flag stays in ONB; it needs to be one *addressable* element so that
`GENS-8` (e) and `GENS-9` (d) can cite a single owner instead of both deferring to a statement that
defines nothing.

## What held

- The MVC predicate itself is genuinely deterministic and checkable, as the element claims — the
  LLM part really is downstream.
- The per-item (not surface-mode) lifecycle is right, and the redirect-clearing rule correctly
  identifies `approval.redirect`'s discarded item id as the missing carrier (verified:
  `approval/index.ts:203`).
- `DSS-8` ReasonLine is the correct named DS element, and prefixing the existing reason text inside
  its single slot avoids inventing a variant (`GR-7` v3).
- The narration's terminal branch — never a silent spinner, never a lie about timing — is right,
  and the element is correct to route the transition itself to `XH-12` via `INC-13` rather than
  claim it. `r2-m4` is about the missing *channel*, not the condition.
- The decision to land the narration rule *with* `XH-12`'s shape-transition condition rather than
  before it is correct and holds.
