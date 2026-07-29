---
kind: challenge-record
spec: .spec/specs/onb-onboarding.yaml
round: 3
date: 2026-07-29
verdict: fail
by: "cortex:challenge — three-lens panel (re-challenge/design-conformance · implementation-divergence · reachability+hidden-assumptions), merged by the invoker"
findings:
  r3-h1:
    severity: high
    status: open
    summary: >-
      The conjunction still has no producer that can run before its own gate — ONBS-6 delegates
      producing the seed Strategy to GENS-8, which places it downstream of the readiness check.
      r2-h2 relocated, not applied.
  r3-h2:
    severity: high
    status: open
    summary: >-
      Quiescence starves the interview path: every interview answer is a predicate-feeding Memory
      write, so an engaged founder's org is never settled and receives nothing during the session
      ONBS-2 names as the primary thin-sources path.
  r3-h3:
    severity: high
    status: open
    summary: >-
      The observation channel has no owner, no tier and no schedule; ONBS-6 carries no reach: and no
      story serves ONB-6, so `satisfied` quantifies vacuously over stories and ONB-6 can reach
      satisfied with zero founder-seat evidence while the day-one home stays empty.
  r3-h4:
    severity: high
    status: open
    summary: >-
      ONBS-6 (f)'s recovery branch is unimplementable — GENS-8 stops attempting a snagged org, so
      "when it later succeeds the snag state is replaced" can only go green through a direct
      counter write in a fixture.
  r3-m1:
    severity: medium
    status: open
    summary: >-
      ONBS-7 (b)'s trigger ("a founder correction") is broader than the statement's predicate (a
      founder-originated styleRule or taboo), so no implementation satisfies both — an ONB-5 factual
      correction supersedes a fact and is neither.
  r3-m2:
    severity: medium
    status: open
    summary: >-
      UNCALIBRATED never terminates for the success case. A founder who approves without edits —
      G-2's own target — produces no styleRule or taboo, so at week 40 every card still reads
      "here's my first go", and clause (a) is green on that behaviour.
  r3-m3:
    severity: medium
    status: open
    summary: >-
      The predicate has no persisted discriminator: correctionChannel is a call-time parameter the
      write path never stores, only source.trigger is durable, and the demo seed writes a taboo with
      trigger dev-seed — so every fixture-built org reads as calibrated and clause (a) has no
      reachable subject.
  r3-m4:
    severity: medium
    status: open
    summary: >-
      SPLIT ONBS-6 again — the MVC predicate (a backend computation) and the narration bound plus its
      delivery channel (the home's shape and a realtime channel, owned jointly with INC-13/XH-12)
      fail independently in different code; one realization assertion cannot honestly cover both.
  r3-m5:
    severity: medium
    status: open
    summary: >-
      ONBS-6 (d) is vacuous — "driving ingestion with the Strategy seed suppressed" tests that
      INGESTION does not generate, which is true by construction now the producer is a sweep. It must
      drive the sweep.
  r3-m6:
    severity: medium
    status: open
    summary: >-
      The v-bump to ONBS-6 v3 cannot cascade to code — mutation-proven that the engine reads marker
      IDs and not marker versions, so four @implements/@verifies ONBS-6 v1 pins stay silently stale.
  r3-l1:
    severity: low
    status: open
    summary: >-
      ONBS-7's frame renders on the Ready-spine card (DSS-19, on the weekly-visit journey's stack
      flow) and none of those are in ONBS's constrained-by, which cites XH-12 only. Lint stays green
      because citing a screen is a "may".
  r3-l2:
    severity: low
    status: open
    summary: >-
      backend/src/memory/retrieve.ts still attributes THIN_THRESHOLD to (ONBS-6); the new glossary
      entry assigns that meaning to MEMS-4.
---

# Challenge record — the single-producer design, round 3 of this chain

Continues `onb-onboarding-2026-07-29-r2.md`. Append-only.

VERDICT: fail

Companion record for the same panel: `.spec/specs/challenges/gen-content-generation-2026-07-29-r8.md`.
The panel ran once over both specs; finding ids are per-chain, so `r3-h1` here is the defect keyed
`r8-h1` there, and `r3-h2` is `r8-h11`.

## Disposition of round 2

**applied:** r2-h1 — `ONBS-7` v1 now defines `Uncalibrated` against `MEMS-1` v2's enumerated
correction channels, the negative clause is restored, `DM-5` is re-keyed and the glossary
disambiguates. Mutation-verified: the new predicate is provably **independent** of
`readyForFirstDrafts` (`ready` keys on `computeGaps` identity + program/story against
`THIN_THRESHOLD = 2`; `uncalibrated` keys on correction-channel `styleRule`/`taboo`), so the
"can never fire" vacuity is genuinely gone. Residuals are new and different defects: `r3-m1`,
`r3-m2`, `r3-m3`.

**relocated, not applied:** r2-h2 → `r3-h1`. The rule was stated (`LRN-37`, and in this element's
own statement in capitals) and then violated in the same change: the producer of the seed-Strategy
conjunct is *named*, and placed downstream of the gate it feeds.

**applied:** r2-m2 at the spec layer only → `r3-m6`. r2-m3 — the arithmetically impossible "nine
unframed cards" argument is gone from both specs. r2-m4 → the requirement for a channel is stated,
but its owner is not → `r3-h3`. r2-m5 → the clearing condition was added and its exit was not →
`r3-h4`.

**applied in part:** r2-m1 → `ONBS-7` extracted, but `ONBS-6` still carries two concerns → `r3-m4`.
r2-m6 → quiescence added, and it starves the primary path → `r3-h2`.

## The two that matter most

**`r3-h2` — the engaged founder gets nothing.** `ONBS-6` names the interview as the path when
sources are thin, and `ONBS-2` makes it the primary path when sources are absent. Every interview
answer is a `MEMS-1` write (`backend/src/interviewer/index.ts:87`), `INT-1` asks a few at a time, and
a founder answers well inside five minutes. So for the whole time the founder is engaged the org is
never SETTLED, and the org goes quiet exactly when the session ends. Clause (a) still passes in any
test that ingests, goes quiet, then sweeps.

The fix is **simpler than what is written**, which is the useful part: the entire rationale for
quiescence is that ingestion commits per artifact. `ingestSources` is a single call whose return is
the natural quiescence point. Define SETTLED as **"no ingestion run in flight for this org"** — one
job/row state — rather than "no predicate-feeding write in the last interval". That keeps the
anti-mid-ingest guarantee the rule exists for, fixes the interview path, and removes a per-org
timestamp scan every five minutes.

**`r3-h3` — the founder cannot see it, and the roll-up cannot tell.** This element now requires the
transition to be observable without a manual reload, then hands the mechanism to nobody: it defers
the condition to `XH-12` (still unamended), blocks its own landing on that, and no element in any
register owns a client subscription or poll. Verified: the only tRPC subscription in the backend is
`ping.stream`; the Ready-stack query has no `refetchInterval`; `refreshKnowledge` invalidates
gaps/profile/ready/openQuestions and not `approval.readyStack`; there are zero `refetchInterval`
declarations in `client/src`.

The roll-up cannot catch it because **no story serves `ONB-6`** — verified against all nineteen
`US-*` — so `satisfied`'s story quantifier is vacuously true, and this element carries no `reach:`
(the only `reach: required` in `.spec` is on `GENS-8`). `ONB-6` therefore reaches `satisfied` on a
single `@implements` marker while the founder sits on the day-one home reading "your first drafts
follow" and nothing arrives. That is `INC-11` from the founder's seat: the delta adopted the
reachability tier and applied it to the producer, not to the observation — the half that was already
the recorded defect.

Three one-liners fix it: `reach: required` on `ONBS-6`; name the owning element for the push or poll
(a `UXS-*` or `APRS-*` element, since `ONBS` is a backend spec and cannot carry a client marker); and
add the `US-*` for *"a draft I never asked for appears while I am sitting here"* with its
`@validates` e2e — which `method/testing.md` requires to precede the code, and which is this delta's
central founder-visible flow.

## What held

- The MVC predicate is genuinely deterministic and checkable, as claimed — the LLM part really is
  downstream.
- `ONBS-7`'s per-item lifecycle is right, and it correctly identifies `approval.redirect`'s discarded
  item id as the missing carrier (verified: `backend/src/approval/index.ts:203`).
- `DSS-8` is the correct named DS element and prefixing inside its single reason slot invents no
  variant (`GR-7` v3).
- Routing the day-one→steady transition *condition* to `XH-12` via `INC-13` rather than claiming it
  is correct; `r3-h3` is about the missing channel owner, not the condition.
- Landing the narration rule *with* `XH-12`'s condition rather than before it is correct and holds.
- `ONBS-7` declines a further split on merit: predicate, keying, per-item retirement and rendering
  fail as one family.
