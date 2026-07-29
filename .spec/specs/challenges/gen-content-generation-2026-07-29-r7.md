---
kind: challenge-record
spec: .spec/specs/gen-content-generation.yaml
round: 7
date: 2026-07-29
verdict: fail
by: "cortex:challenge — four-lens panel (design-conformance · implementation-divergence · SPLIT+over-structure · reachability+hidden-assumptions), merged by the invoker"
findings:
  r7-h1:
    severity: high
    status: open
    summary: >-
      The calibration flag is keyed to "still thin", which no element defines; the codebase's
      two ONBS-6-tagged carriers of "thin" are the exact complement of readyForFirstDrafts, and
      the falsifying negative half was deleted with nothing replacing it.
  r7-h2:
    severity: high
    status: open
    summary: >-
      The rolling-7-day rate is a per-ORG bound stated on one producer, and at N=12 it equals
      the calendar's own drain rate — zero headroom, occupancy converges to ~10 of 12 and cannot
      recover; the three-per-run burst guard is provably inert.
  r7-h3:
    severity: high
    status: open
    summary: >-
      GENS-9 (b) measures total-produced, not forward-window occupancy, so under the element's
      own rate bound date-identity, earliest and latest placement all yield 15 — the clause
      catches one of the three defects it names.
  r7-h4:
    severity: high
    status: open
    summary: >-
      Per-date idempotency went wholly to GENS-9, but GENS-8's bounded re-arm re-runs the whole
      plan-and-draft act against a per-item persist loop, so partial persistence multiplies
      DEC-47's three by the attempt bound while every clause stays green.
  r7-h5:
    severity: high
    status: open
    summary: >-
      TOP-1's scheduled MAINTENANCE run is claimed as an outcome by GENS-9 and stated as a rule
      by neither producer; TOPS-1 v1 is untouched and TOP-1's coverage is complete, so TOP-1 can
      reach satisfied with the agenda frozen at day-one topics.
  r7-h6:
    severity: high
    status: open
    summary: >-
      The gating predicate's SECOND conjunct — the STRS-2 seed Strategy — has no producer
      anywhere; ingestion writes Memory only and strategy.autoDraft has zero callers, so a
      faithful implementation of both producers yields zero drafts forever.
  r7-h7:
    severity: high
    status: open
    summary: >-
      content.planAndDraft is a live client-callable mutation minting up to 30 items per call,
      outside GENS-9's rate and contradicting GENS-8's "never by a page view or a button"; a
      green test asserts it must stay callable and the delta neither retires nor meters it.
  r7-h8:
    severity: high
    status: open
    summary: >-
      The delta closes a reachability defect while declining every reachability control the
      pinned toolchain provides — no reach:, no @reaches, no fixture-paths, no entrypoint-paths
      — so the cheapest test passing every clause signs into a seed that fabricates both ends.
  r7-m1:
    severity: medium
    status: open
    summary: >-
      DM-5, the flag's named carrier and in this spec's constrained-by set, still defines it as
      "marking a draft as part of the org's FIRST batch" — producer-keyed in its own title.
  r7-m2:
    severity: medium
    status: open
    summary: >-
      ONBS-6 (7983 chars, now the largest element in the project) carries three independently
      failing units of HOW; the flag's homelessness inside it is what makes r7-h1 unfixable in place.
  r7-m3:
    severity: medium
    status: open
    summary: >-
      GENS-8 (g) asserts the exact invariant GENS-8 (f) declares unentailed — against a
      conforming pairing guard that empties the plan, (g) is red while (f) is green.
  r7-m4:
    severity: medium
    status: open
    summary: >-
      The level trigger fires MID-INGEST — ingest commits per artifact, so the batch plans on
      the first two facts while nineteen more are still being scraped.
  r7-m5:
    severity: medium
    status: open
    summary: >-
      Nothing owns delivering "the batch landed" to an open session; there is no polling and no
      subscription, so INC-13's condition has no observation channel.
  r7-m6:
    severity: medium
    status: open
    summary: >-
      The daily fan-out is the one job that must run UNSCOPED and ARC-28's port contract has no
      such mode; GENS-9 (c) asserts isolation of the per-org handler, exempting the component
      where cross-tenant risk actually lives.
  r7-m7:
    severity: medium
    status: open
    summary: >-
      A materially cheaper conforming alternative — ONE predicate-gated producer on a short
      cadence — was never considered by DEC-44/46/47 and deletes the entire exactly-once
      apparatus; it must be taken or recorded as rejected with a reason.
  r7-m8:
    severity: medium
    status: open
    summary: >-
      N is an unexported inline literal (slotCount ?? 12); mutating it to 3 leaves 192/192 green,
      so GENS-1 v2's "N is a code constant" is false and GENS-9 will carry a drifting second copy.
  r7-m9:
    severity: medium
    status: open
    summary: >-
      GENS-8 (c) bounds the batch only ABOVE, so a one-card batch passes every clause against
      DEC-47's founder call of three.
  r7-m10:
    severity: medium
    status: open
    summary: >-
      GENS-9 (e) welds two behaviours needing opposite fixtures (an org below the threshold, an
      org above it) into one clause, in an element declaring each clause independently falsifiable.
  r7-m11:
    severity: medium
    status: open
    summary: >-
      ONBS-6's acceptance (f) was semantically inverted with no v bump, so no cascade fired and
      every @2 pin stayed green.
  r7-m12:
    severity: medium
    status: open
    summary: >-
      GENS-8 lost the org-scoped-handle assertion and the snag state gained no clearing
      condition once GENS-9's safety net delivers.
  r7-l1:
    severity: low
    status: open
    summary: >-
      The residual 3-4x over-size is rationale duplicated from DEC-46/DEC-47/the r6 record, not
      concern count — cite rather than restate.
  r7-l2:
    severity: low
    status: open
    summary: >-
      GENS-9 (c) is not marked "Fails today" although ARC-28 has zero implementation, exactly as (e) is.
  r7-l3:
    severity: low
    status: open
    summary: >-
      INC-13's binds was not extended to GENS-9; Q-18 still says the per-run cap is what ships,
      never mentioning the rolling-7-day rate GENS-9 now rests UX-3/G-3 on.
  r7-l4:
    severity: low
    status: open
    summary: >-
      GENS-8 (d) duplicates GENS-9 (f); each element should assert only what it can honour. The
      daily agenda-ensure also burns an LLM call on the ~6 days in 7 the rate guarantees produce nothing.
  r7-l5:
    severity: low
    status: open
    summary: >-
      Records r1-r6 carry no findings map, so no prior finding has an id and no caused-by edge in
      this round can point at its true ancestor.
---

# Challenge record — the DEC-47 scope-review split, round 7

Continues `gen-content-generation-2026-07-26-r6.md`. Append-only; every earlier record stands
unedited. **This round is the output of the scope review Cortex mandated at three consecutive
fails**, not a fourth round of the same shape — `DEC-47` split `GENS-8` v1 (11531 chars, both
autonomous producers) into `GENS-8` v2 (the once-only first batch) and `GENS-9` (the standing
daily refill).

VERDICT: fail

| Round | Verdict | High | Med | Low | Lenses |
|---|---|---|---|---|---|
| r1–r4 | fail | 8 total | 19 | 10 | 1 |
| r5 | fail | 3 | 6 | 2 | 1 |
| r6 | fail | 3 | 3 | 1 | 1 |
| r7 | fail | 8 | 12 | 5 | **4, parallel** |

**Read the count against the lens count.** r7 is the first round with a four-lens panel, two of
which executed code — simulations over the real planner grid and two applied-and-reverted source
mutations. The rise from 3 highs to 8 measures review depth, not a spec that got worse. The
evidence for that reading is the carry-forward below: **every r6 high is verified applied and none
rebounded into its own region.**

## Did the split work? Yes on its own axis, and that is the finding

All four lenses independently declined to split `GENS-8` or `GENS-9` further, and both
over-structure checks confirmed `GENS-9` earns its ID (a coverage `against` pin, `ARC-28`'s
consumer list, `ONBS-6` ×2, `GENS-8` ×4, its own `implements: [GEN-1]` edge). The seam is on the
right axis.

The SPLIT lens then named what the axis could not reach, and it is the round's organising insight:

> **The producer axis cut in half everything keyed to the ORG.**

| org-keyed concern | where it landed | finding |
|---|---|---|
| is this org still thin enough to frame its drafts as a first attempt | asserted on both halves, defined by neither | `r7-h1` |
| how many items this org may receive per week | stated on `GENS-9` only | `r7-h2` |
| who keeps this org's agenda fresh | duplicated into both, homed in neither | `r7-h5` |

Three of the eight highs are one defect class: a per-org quantity has no per-org owner. `r7-m2`
is the structural remedy — `ONBS-6` is now the largest element in the project (7983 chars) and
carries the predicate, the flag and the narration bound as three independently failing concerns.
Giving the flag its own `ONBS` element is simultaneously the fix for `r7-h1` and the right split
for `ONBS-6`.

## The two findings that make the delta's own thesis false

**`r7-h6` — the predicate can never become true.** `readyForFirstDrafts` is a conjunction:
grounded Memory **AND** a seed Strategy (`onb-onboarding.yaml:212-213`). `INC-12` named three
orphans — `content.planAndDraft`, `topics.identify`, `strategy.autoDraft`. This delta gives
invokers to the first two and leaves the third unowned *while making it a hard conjunct of the
gate*. `backend/src/onboarding/ingest.ts:59-84` writes Memory only; the two writers of
`strategy_doc` are a mutation with zero client callers and a founder-typed edit. The asymmetry is
the tell: `GENS-8` goes out of its way to make the `TOPS-1` agenda a named precondition — which is
*not* part of the predicate — and says nothing about the seed Strategy, which *is*. Implement both
producers faithfully and the founder receives nothing, behind a green gate. **This is `INC-12`
verbatim, one link upstream, in the elements written to close it — and it is the third instance of
the same class** (planner → agenda run → seed Strategy).

The general rule the panel extracted, which is worth more than the instance:
**every conjunct of a gating predicate needs a named producer, not just a named observer.**

**`r7-h8` — the countermeasure was declined in the change premised on needing it.** `assurance:
standard`, no `reach:` field anywhere in `.spec`, no `@reaches` marker in the repo, and
`registry.yaml` declares neither `fixture-paths` nor `entrypoint-paths`. Cortex v0.25 ships all of
it and is pinned. Meanwhile `backend/src/demo/seed.ts` writes `memory_entry` (:159), `strategy_doc`
(:357) and `content_item` (:243) with a published variant (:302) — the whole predicate *and* both
ends of the loop. So an `@validates` e2e signing into a demo org passes every clause of both new
elements while proving nothing, which is `INC-7`, still open.

## Highs r7-h2, r7-h3, r7-h4 — the bounds

**`r7-h2`.** With `N = 12`, the stated rate `N/4 per rolling 7 days` = 3, and the 28-day calendar
drains at `N/28 per day` = 3 per 7 days. The top-up rate equals the drain rate with zero headroom.
Measured over 365 days of the specified design: forward-window occupancy min 9 / max 11 / **avg
10.0** with the rate, versus 11 / 12 / 11.6 without. So `GENS-9` structurally cannot honour its own
"tops the occupancy of the next 28 days up to N", and cannot recover from a missed run. The
relation is scale-invariant, so `Q-18`'s deferred per-org dial will not fix it. At the same N the
three-per-run burst guard is provably inert (identical results with it present and absent).
Separately the bound's *scope* is unowned: nothing says whether `GENS-8`'s three count against it,
and the two readings differ by a factor of two in the founder's first week — 3 or 6 — which is
exactly the quantity `DEC-47` was recorded to settle. `ONBS-6`'s load-bearing "three framed cards
followed by **nine** unframed ones" is arithmetically impossible under either reading; nine more
cards is three weeks at this rate. The conclusion (context-keying) survives; the argument carrying
it does not.

**`r7-h3`.** Simulated over the real grid (`planner.ts:78-84`). Without the rate bound the
statement's figures are correct — date-identity 56, earliest 41, latest 25, and exactly **22** with
`GENS-8`'s three-item seed. **With** the rate bound, all three strategies yield **15**, because
`≤15 in 30 days` is a hard arithmetic ceiling. All three are "roughly N, not four times N", so
clause (b) is green for the mechanism the statement spends a paragraph forbidding. The products
differ sharply where the clause does not look: forward-window occupancy at day 30 is **2** items
for date-identity versus **11** for latest. The clause measures the one quantity that cannot see
the defect. The statement and its criterion also disagree on units — 22 (produced over 30 days)
versus "roughly N" (12, an occupancy figure) — for one scenario.

**`r7-h4`.** Per-date idempotency was re-homed wholly onto `GENS-9`, whose rationale localises it
("the idempotency lives here, in the caller — for a recurring job"). But `GENS-8`'s re-arm
re-performs the *whole* plan-and-draft act, and `engine.ts:66-83` persists inside the loop with one
LLM call per slot and no wrapping transaction, while `store.ts:55-79` `persistDraft` is a bare
insert. Attempt 1 persists two and throws on the third; attempt 2 re-claims and persists three
more. Five attempts, fifteen cards. Clause (b) is scoped "absent a terminal failure" so the
scenario is out of scope by construction; (c) is written on the happy path; (d) is *satisfied by*
the scenario. All green. **This is the split losing a bound** — the failure `DEC-47` exists to
prevent, committed by `DEC-47`.

## Carry-forward — every prior high, disposed

No prior finding carries an id (`r7-l5`), so these are keyed by description.

| Prior high | Status | Verification this round |
|---|---|---|
| r1 ×3 — ARC-28 dropped 2 of ADR-0003's 4 contract items · refill had no output/idempotency · the meter as a surfacing filter | **applied** | all four contract items present (`overview.yaml:426-433`); per-date idempotency on `GENS-9:432-437`; meter excised by `DEC-46` |
| r2 — refill lifecycle unspecified; at-enqueue claim made a failed batch permanent | **applied** | re-verified on `GENS-8:341-353` |
| r3–r4 ×4 | **applied** | no regression found in the changed sections |
| r5 — the ceiling bounded the item count, never the horizon | **applied** | dissolved by `DEC-46`; no ceiling/horizon language survives anywhere |
| r5 — the first batch had no agenda; TOPS-1 had no invoker | **applied in part → re-raised as `r7-h5`** | the *bootstrap* is now stated on both producers; the *maintenance* half still has no owner and `TOPS-1` is untouched at v1 |
| r5 — DEC-45's "no cascade" was false | **applied** | `DEC-46`; `GEN-1` left at four weeks; `STWS-1` coherent |
| r6 — the first batch lost its size | **applied** | three is a number in both the statement (`:324`) and the criterion (`:383`), authorized by `DEC-47`. Successor `r7-m9` concerns the missing *floor*, `r7-h4` the bound's *scope* — neither is the original defect |
| r6 — "a date that carries no item" is not a bound | **applied** | occupancy + N + latest landed and the arithmetic converges; the fix's own convergence *figure* is mis-calibrated → `r7-h3` |
| r6 — the bounded re-arm did not bind | **applied and verified** | at-bound claim retention (`:354-362`) coherent with `DM-1` v2's durable claim + attempt count, count never reset |

**None of the three r6 highs rebounded into its own region.** That is the first time in this chain,
and it is the evidence that the scope review's diagnosis was correct even though the round failed.

## What held — attacked across four lenses, unbroken

1. **ADR-0003's cron pre-rejection** — it rejects a cron sweeper only as a substitute for durable
   *per-item* timers and explicitly lists per-org recurring runs as an in-contract capability. A
   daily fan-out is inside the contract; the "not a per-org cron row, it would strand existing
   orgs" reasoning is sound and needs no backfill.
2. **The transactional-enqueue seam.** Level-not-edge + `WHERE claim IS NULL` rowcount-1 + retry
   re-performing the claim is a correct exactly-once construction; no lens found a race it admits,
   including the release-window case the element calls out itself.
3. **`DM-1`'s carriers** — claim timestamp + attempt count, one per Org, durable on the row, count
   never reset, claim retained at the bound. `DM-1` v2 and `GENS-8` agree on all four.
4. **`GENS-1` v2 as the convergence target** — "an item occupies its date regardless of editorial
   state" is exactly what occupancy-not-date-identity needs, and it is an existing approved
   contract rather than a new dial. No `GEN-1` cascade.
5. **The occupancy convergence math itself** — sound, and the strongest part of the delta. Two
   lenses independently re-derived it; a starvation case was attempted and could not be built.
6. **The guardrail chain** — both producers route through `GENS-7`/`PIPE-2`, so `GR-1`/`GR-2`/
   `GR-3`/`GR-5`/`GR-8`, escalate-on-uncertainty, the regenerate cap and the `GEN-3` picture gate
   are untouched by the split.
7. **`VAL-6`** — both producers are jobs; the split re-introduces no founder-pressed control.
8. **`GENS-8` (a)'s `scheduledFor` discriminator** — mutation-proven live: removing it from
   `engine.ts:80` turns two integration tests red. Not set by `approval.compose`, by
   `content/external.ts`, or by the demo seed.
9. **`GENS-8` (f)'s refusal to assert an unentailed invariant** — `applyPairingGuard` really does
   drop off-agenda and external pairings, so "agenda ensured ⇒ non-empty plan" would have been
   false. Asserting the outcome is right. (See `r7-m3` for (g) contradicting it.)
10. **`G-5`'s 48h target against a daily sweep** — holds; day one is the immediate trigger, and even
    the dead-letter path lands inside 48h.
11. **COGS** — a fully-loaded org lands near $6-15/month against the `<$25` target.
12. **The single MEMS-1 write path** — only `memory/write.ts:165` inserts outside the seed, so the
    observer's "every predicate-feeding write path" rule has one production target as stated.

## SPLIT-lens verdicts (silence would read as a considered decline)

- **`GENS-8` (7568) — decline.** Observer, atomic claim, bounded re-arm and at-bound retention are
  one state machine over one carrier; the at-bound rule is *stated in terms of* the level trigger,
  so separating them would force both halves to restate level-trigger semantics — recreating the
  shared-bound hazard `DEC-47` just removed. **Remove instead:** the agenda paragraph (`r7-h5`) and
  the duplicated rationale (`r7-l1`).
- **`GENS-9` (5980) — decline.** Convergence rule, cadence and per-date key are three bounds on one
  production act and fail as a family. **Extract instead:** the rate (`r7-h2`), which is not a
  `GENS-9` property at all, and the agenda-maintenance run (`r7-h5`), which answers to `TOP-1`.
- **`ONBS-6` (7983) — SPLIT.** `r7-m2`. Three units of HOW, and the flag's homelessness is what
  makes `r7-h1` unfixable in place.
- **`GENS-1` (3053), `GENS-7` (2986) — decline.** One planning act and one write act respectively;
  clauses fail as families.

## Verified against code, not prose

True: `planCalendar` returns `[]` on an empty agenda (`planner.ts:148`); the grid offsets and their
disjointness; 56 / 41 / 22 for date-identity / earliest / latest; `applyPairingGuard`'s drops;
`slotCount ?? 12`; the engine dropping `topicId` and `content_item` having no topic column;
`approval.redirect` discarding its item id (`approval/index.ts:203`); `TOPS-1` having no invoker;
`ARC-28` having zero implementation (no `ports/jobs.ts`, zero references, `db.transaction` appearing
exactly once in the whole backend).

False: `GENS-1` v2's "N is a code constant" (`r7-m8` — an unexported literal; mutating 12 → 3 leaves
192/192 green); `GENS-8`'s "never by a page view or a button" (`r7-h7`).

Baseline integrity: `npm test` 192/192 before and after; `docs-check` 620 IDs / 0 errors / 0
warnings; two source mutations applied and reverted, byte-identity confirmed.

## The escalation this round forces

`r7-m7` is not a defect in what is written — it is a cheaper design the decision chain never
considered. `DEC-44`, `DEC-46` and `DEC-47` weighed button-vs-job, plan-vs-draft and
trigger-vs-refill; **none weighed cadence-vs-observer.** Collapsing both producers into one
predicate-gated sweeper on a short cadence deletes the once-only claim, the level-vs-edge
subtlety, the atomic conditional claim, the bounded re-arm, the at-bound retention and two `DM-1`
columns — and dissolves `r7-h4` and `r7-m4` outright, because a poll runs *after* the ingest burst
rather than during it. It also makes `r7-h1` easier, since with no "first batch" producer the flag
*must* be context-keyed.

`DEC-47` is a same-day human decision. Per SDLC Phase C an agent may not overturn it: the
alternative is escalated, not adopted. Paired with this record.

Companion record for the same round in the sibling chain:
`.spec/specs/challenges/onb-onboarding-2026-07-29-r2.md`.
