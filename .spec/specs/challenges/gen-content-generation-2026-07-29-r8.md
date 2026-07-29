---
kind: challenge-record
spec: .spec/specs/gen-content-generation.yaml
round: 8
date: 2026-07-29
verdict: fail
by: "cortex:challenge — three-lens panel (re-challenge/design-conformance · implementation-divergence · reachability+hidden-assumptions), merged by the invoker"
findings:
  r8-h1:
    severity: high
    status: open
    summary: >-
      The ensure for the gate's second conjunct sits INSIDE the branch that gate guards — an org
      with no seed Strategy is not READY, so the run never starts and the ensure never fires.
      r7-h6 relocated, not applied.
  r8-h2:
    severity: high
    status: open
    summary: >-
      Occupancy-to-N at the LATEST unfilled dates schedules a new org's first post on DAY 21 —
      three weeks of silence — while clauses (f)/(g) read 12/12 throughout. G-5's 48h live target
      and G-4's four-week streak are structurally impossible.
  r8-h3:
    severity: high
    status: open
    summary: >-
      The production bounds and the failure count collide: the only stated skip conditions are
      not-ready and not-settled, so a rate-exhausted org still runs, persists zero, and is counted
      a failure — every healthy org snags within minutes with all clauses green.
  r8-h4:
    severity: high
    status: open
    summary: >-
      The snag state has no reachable exit — "cleared by a successful run" is unreachable once the
      sweep stops attempting the org, and no element defines the alternative founder action.
  r8-h5:
    severity: high
    status: open
    summary: >-
      Nothing owns the ARC-28 registration that starts the sweep, and reach: required is
      satisfiable without it — mutation-proven with a probe file whose only entrypoint contact was
      an unused import. The fourth instance of the recursive-invoker class.
  r8-h6:
    severity: high
    status: open
    summary: >-
      The spec narrates a code change it did not make ("content.planAndDraft IS RETIRED in this
      change; the test is inverted") while the route and two asserting tests are untouched, and
      clause (k) is the only unimplemented clause not marked "Fails today".
  r8-h7:
    severity: high
    status: open
    summary: >-
      DM-1 — in this spec's constrained-by set — still mandates the two columns the delta deletes
      and declares no carrier for the consecutive-failure count it requires; DEC-48.binds omits
      DM-1 so no cascade fired.
  r8-h8:
    severity: high
    status: open
    summary: >-
      Clauses (f)/(g) are GREEN for the rejected zero-headroom N/4 rate (day-30 occupancy 11;
      "reaches ≈N" satisfied one day in seven), so the clause written to catch a missing rate still
      cannot catch it. Third failure of this same clause to discriminate.
  r8-h9:
    severity: high
    status: open
    summary: >-
      TOPS-1 v2's maintenance clause asserts set INEQUALITY, which additive-only persistence
      satisfies — persistTopics never writes supersededAt and the module records evolution as
      DEFERRED, so the agenda freeze survives and TOP-1 can still reach satisfied.
  r8-h10:
    severity: high
    status: open
    summary: >-
      The three-item count is unenforceable — (b) is vacuous on the keyless tier (the dev stub
      returns exactly `count` guard-passing pairings) and the claimed floor cites (d), which fires
      only at ZERO, so every org silently receiving two cards is green.
  r8-h11:
    severity: high
    status: open
    summary: >-
      Quiescence starves the interview path: every interview answer is a predicate-feeding Memory
      write and a founder answers inside 5 minutes, so an engaged org is never settled and receives
      nothing during the session ONBS-2 calls the primary thin-sources path.
  r8-h12:
    severity: high
    status: open
    summary: >-
      No element owns the observation channel and no story serves ONB-6 or GEN-1, so `satisfied`
      quantifies vacuously over stories — ONB-6 can reach satisfied with zero founder-seat evidence
      while nothing ever appears on the day-one home.
  r8-m1:
    severity: medium
    status: open
    summary: >-
      The stated convergence figures are true only under a POST-RUN measurement, which no clause
      names; measured before each run the same design reads 11/12/11.56, not 12/12/12.0.
  r8-m2:
    severity: medium
    status: open
    summary: >-
      The N-slot grid the occupancy math rests on has no interface — planCalendar derives dates from
      `pairings.length`, so a 3-slot ask yields a 3-point grid (steady-state occupancy 4.0, not 12).
      A missing interface, not a wording fix.
  r8-m3:
    severity: medium
    status: open
    summary: >-
      DM-5's body was semantically re-keyed with no v bump — mutation-proven to suppress a 105-site
      cascade and two hard stale-pin errors.
  r8-m4:
    severity: medium
    status: open
    summary: >-
      entrypoint-paths [client/src] de-rates the only test class that can satisfy the acceptance —
      mutation-proven: @reaches on the fixture-free real-signup e2e reads as entrypointless, because
      Playwright drives the browser rather than importing the app. The inverse of the tier's purpose.
  r8-m5:
    severity: medium
    status: open
    summary: >-
      ONBS-7's predicate has no persisted discriminator — correctionChannel is never written, only
      source.trigger is durable, and the demo seed writes a taboo with trigger dev-seed, so every
      fixture org reads as calibrated.
  r8-m6:
    severity: medium
    status: open
    summary: >-
      UNCALIBRATED never terminates for the success case: a founder who approves without edits —
      G-2's own target — produces no styleRule or taboo, so every card still reads "here's my first
      go" at week 40.
  r8-m7:
    severity: medium
    status: open
    summary: >-
      Quiescence is unbounded and a SKIP is not a FAILURE, so a continuously-written org is
      invisible in every direction — no count, no snag, no clause.
  r8-m8:
    severity: medium
    status: open
    summary: >-
      "A predicate-feeding write" is ambiguous across two predicates, and MEMS-1's bare-approval
      reinforcement bump would de-settle an org on every approval.
  r8-m9:
    severity: medium
    status: open
    summary: >-
      N is still an unexported inline literal (mutating 12 to 3 leaves 192/192 green) while three
      of the element's bounds are now expressed in N. r7-m8 unfixed and load-bearing.
  r8-m10:
    severity: medium
    status: open
    summary: >-
      The failure bound is "a fixed number" — the one bound left as a word, and the cadence change
      to 5 minutes made it critical: three failures would snag a whole cohort in fifteen minutes.
  r8-m11:
    severity: medium
    status: open
    summary: >-
      ONBS-6's v-bump cannot cascade to code — mutation-proven that marker versions are unreadable
      to the engine, so four @implements/@verifies ONBS-6 v1 pins must be revisited by hand.
  r8-m12:
    severity: medium
    status: open
    summary: >-
      ONBS-7 (b)'s trigger ("a founder correction") is broader than the statement's predicate (a
      styleRule or taboo), so no implementation satisfies both; and the clause set excludes only
      ingestion origins, not interview, bot, media-upload or dev-seed.
  r8-m13:
    severity: medium
    status: open
    summary: >-
      TOPS-1 v2 schedules a daily LLM-backed maintenance run against a rate that produces on ~4
      days in 7, and against a persistTopics that only adds — a deferred gap turned into a daily one.
  r8-m14:
    severity: medium
    status: open
    summary: >-
      ONBS-6 (d) is vacuous as written — driving INGESTION with the seed suppressed tests that
      ingestion does not generate, which is true by construction now the producer is a sweep.
  r8-m15:
    severity: medium
    status: open
    summary: >-
      SPLIT — GENS-8 is 12342 chars, 7% LARGER than the 11531 that triggered DEC-47's mandated scope
      review, and the stopping rule has fired again at four consecutive fails. ONBS-6 still carries
      two concerns.
  r8-l1:
    severity: low
    status: open
    summary: >-
      The registry comment introducing the reachability tier is garbled mid-sentence — a duplicated
      fragment in the one place an implementer reads about it.
  r8-l2:
    severity: low
    status: open
    summary: >-
      ARC-28 v2, edited in this same change, still says "the same daily sweeper" and "EACH TRIGGER
      ensures the agenda", and still justifies the transactional seam by the deleted first-batch claim.
  r8-l3:
    severity: low
    status: open
    summary: >-
      Q-18 still says a per-run cap for "both autonomous producers" (there is one) and never
      mentions the rate UX-3/G-3 now rest on. TOP-1 is left dirty — the only cascade this delta
      created is the one not re-affirmed.
  r8-l4:
    severity: low
    status: open
    summary: >-
      "The standing test" is singular; there are two asserting client-callability. And two further
      client-callable producers (strategy.autoDraft, topics.identify) survive under the heading "NO
      CLIENT-CALLABLE PRODUCER SURVIVES".
  r8-l5:
    severity: low
    status: open
    summary: >-
      The per-run cap of three is provably inert in steady state (caps 1,2,3,4,12 all yield
      12/12/12.00 at rate 4); and the rate is not scale-safe at the range Q-18's dial could reach.
  r8-l6:
    severity: low
    status: open
    summary: >-
      LRN-36 transmits the "three framed cards followed by nine unframed" argument that this round
      showed to be arithmetically impossible, without noting it.
---

# Challenge record — the single-producer design, round 8

Continues `gen-content-generation-2026-07-29-r7.md`. Append-only.

VERDICT: fail

| Round | Verdict | High | Med | Low | Lenses |
|---|---|---|---|---|---|
| r1–r6 | fail | 14 total | 25 | 13 | 1 each |
| r7 | fail | 8 | 12 | 5 | 4, parallel |
| r8 | fail | **12** | 15 | 6 | 3, parallel |

## The finding of the round is the pattern, not any single high

Three lenses ran independently. All three concluded fail, and all three independently located the
same region. Tabulating where every high has landed since r5:

| round | region |
|---|---|
| r5 | the bounds (ceiling vs horizon) |
| r6 | the bounds ×3 (batch size, convergence rule, re-arm) |
| r7 | the bounds ×3 (h2, h3, h4) + the producers ×3 (h1, h5, h6) |
| r8 | the bounds ×5 (h2, h3, h4, h8, h10) + the producers ×4 (h1, h5, h9, h11) |

**Four consecutive rounds of highs concentrated in the bounds / acceptance / failure-handling
region** — the region `Q-18` already defers. `method/challenge-policy.md`'s stopping rule names that
as a scope error rather than a wording error, and the precedent is measured: when `DEC-46` deferred
metering, five of eight findings from the preceding round disappeared with the region.

The implementation-divergence lens stated the mechanism precisely: three of its four highs are *the
same shape* — **a criterion that cannot fail for the implementation the code already has.** Each
round's repair moved the blindness one level rather than removing it:

- r6: the clause measured nothing about accumulation → fixed to measure total produced.
- r7: total produced is capped identically by the rate for every placement strategy → fixed to
  measure forward-window occupancy.
- r8: occupancy is blind to **distribution** — 12 of 12 with the first post on day 21 (`r8-h2`).

`GENS-8` is now **12342 chars, 7% larger than the 11531-char element the Cortex-mandated scope
review condemned** at `DEC-47`, while nominally shedding six mechanisms. That is the structural
tell (`r8-m15`).

## The two highs that falsify the delta's own thesis

**`r8-h1` — the ensure is inside the gate it must open.** The element gates the per-org run on "each
org that is READY and SETTLED", then says the sweep "ENSURES BOTH before planning". READY *includes*
having a seed Strategy. An org without one is not READY, is skipped, and its ensure never fires:
zero drafts forever, for every real org. `LRN-37` — deposited in this very change — states the rule
this violates. The producer was *named*, satisfying the letter of the rule, and placed downstream of
the gate it feeds. `STRS-2` is untouched at v1 and its auto-draft is still triggered by a founder
viewing XG-7, a page view `DEC-44` (1) rejects.

The reachability lens added the half that makes it invisible: `strategy.autoDraft` is a live
client-callable procedure with zero client callers, so a `@reaches` test can construct the missing
conjunct through a **genuine router call** — no fixture import, so the newly-adopted
`fixture-paths` control stays silent. `LRN-37`'s mechanism with a router call substituted for the
seed.

**`r8-h2` — three weeks of silence.** Occupancy-to-N at the LATEST unfilled dates places a new org's
first three items on days 22, 24 and 27. Weeks 1–3 carry **zero posts**. `XO-4` and `G-5` require a
live post inside 48 hours; `G-4` requires an unbroken four-week streak. Both structurally
impossible, with (f) and (g) green at 12/12 throughout. And the argument that chose LATEST
("earliest overshoots ~41") was measured **before** this delta added the rate: re-measured *with*
the rate, earliest yields 20 items over 30 days and 4 posts/week from week one, latest 17 and
0/0/0/4. **The justification for the rule evaporated when the rate was added, and was not
re-checked.**

## Verified by execution, not argument

The panel ran seven source mutations (all reverted, tree byte-identical) and three independent
simulations over the real planner grid.

- The convergence figures **are true** — post-run: `⌈N/3⌉` reaches exactly 12 by day 15 and holds
  12/12/12.00, healing a skipped sweep same-day; `N/4` settles 9/12/10.43. Measured **pre**-run the
  same design reads 11/12/11.56 (`r8-m1`).
- `dev-stub.ts:196-204` returns exactly `input.count` pairings, all guard-passing — so the keyless
  tier cannot produce the empty plan clause (b) is scoped against (`r8-h10`).
- `persistTopics` (`backend/src/topics/store.ts:59-91`) is additive-only and never writes
  `supersededAt`; the module header records evolution as DEFERRED (`r8-h9`).
- `planner.ts:149` `slotCount ?? 12` mutated to `?? 3` leaves **192/192 green** (`r8-m9`).
- `@implements ONBS-6 v1` mutated to `v99` leaves docs-check at **0 errors** — marker versions are
  unreadable to the engine (`r8-m11`).
- Bumping `DM-5` v2→v3 reveals a **105-site cascade** and two stale-pin errors that the un-bumped
  re-key suppressed (`r8-m3`).
- A probe file carrying `@reaches GENS-8` whose only entrypoint contact was an unused
  `client/src` import **cleared** the reachability signal (`r8-h5`); conversely `@reaches` on
  `client/e2e/day-one.spec.ts` — the fixture-free real-signup spec — reads as **entrypointless**,
  because Playwright drives the browser rather than importing the app (`r8-m4`).

## What held across all three lenses

1. **`DEC-48`'s architecture is right, and one lens went looking for a cheaper one and reported
   plainly that there isn't one.** One predicate-gated sweep is the correct shape; deleting the
   exactly-once apparatus was correct. A double-fire was attempted and could not be built —
   per-date idempotency plus the occupancy target plus the rate genuinely make the once-only claim,
   the level-vs-edge rule, the atomic claim, the bounded re-arm and two `DM-1` columns unnecessary.
2. **COGS survives** — ≈$5–12/org/month against `<$25`. `computeGaps` is a single grouped SQL count,
   so the 5-minute gate is DB-only and LLM work is capped per org per day. The cadence attack failed.
3. **`ADR-0003`'s cron pre-rejection still does not bite** — it rejects a sweeper only as a
   substitute for durable per-item timers and lists per-org recurring runs as in-contract.
4. **`ARC-28` v2's `enumerate()` exception** is narrow, named, greppable and correctly reasoned.
5. **The rate arithmetic** — independently re-derived by two lenses. `⌈N/3⌉` = 4 against a 3.0/week
   drain; the headroom is real.
6. **`ONBS-7`'s predicate is provably independent of `readyForFirstDrafts`** — `ready` keys on
   `computeGaps` identity + program/story, `uncalibrated` on correction-channel styleRule/taboo. The
   `ready ⇒ not-thin` vacuity of `r7-h1` is genuinely repaired.
7. **`GR-7` / `DSS-8`** — prefixing the frame inside DSS-8's single reason slot invents no component
   and no variant.
8. **The reachability tier's adoption is substantive** — declaring `fixture-paths` de-rated eight
   story evidences the moment it landed, and the signal was mutation-verified live (a typo raises
   `GRP-19`; removal makes it vanish silently).
9. **The guardrail chain and `VAL-6`** — untouched; the producer still routes through
   `GENS-7`/`PIPE-2`, and no founder-pressed control is reintroduced.

## Disposition of every r7 finding

**applied:** r7-h1 (residuals `r8-m5`, `r8-m6`) · r7-h2 (residual `r8-h2`, `r8-m1`) · r7-h4
(mirror defects `r8-h3`, `r8-h10`) · r7-m1 · r7-m3 · r7-m4 (residuals `r8-h11`, `r8-m7`, `r8-m8`) ·
r7-m5 (residual `r8-h12`) · r7-m6 · r7-m7 · r7-m10 · r7-l2.
**applied in form, the clause cannot fail:** r7-h3 → `r8-h8` · r7-h5 → `r8-h9`.
**relocated, not applied:** r7-h6 → `r8-h1`.
**not applied (spec narrates an unmade edit):** r7-h7 → `r8-h6`.
**applied in part:** r7-h8 → `r8-h5`, `r8-m4` · r7-m2 → `r8-m15` · r7-m11 → `r8-m3`, `r8-m11` ·
r7-m12 → `r8-h4`.
**still open:** r7-m8 → `r8-m9` · r7-l1 → `r8-m15` · r7-l3 → `r8-l3` · r7-l4 → `r8-m13`.
**deferred:** r7-l5 (records r1–r6 are frozen; no prior finding ids can be minted).

## What this round mandates

A second scope review, and this time the region is unambiguous and four rounds deep. The remedy
both the SPLIT lens and the reachability lens name independently: **ship the invoker — which is all
`INC-11` and `INC-12` require — under an explicitly crude interim bound, and make the
calendar-convergence rule, the production rate, the placement strategy and the failure/snag state
machine their own change with their own chain.** `r8-h2`, `r8-h3`, `r8-h4`, `r8-h8` and `r8-h10`
all leave with that region, and it is the region that genuinely needs a running system to
calibrate — which `Q-18` already says ("the number is a field observation").

Companion record: `.spec/specs/challenges/onb-onboarding-2026-07-29-r3.md`.
