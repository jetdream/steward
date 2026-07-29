---
kind: challenge-record
spec: .spec/specs/gen-content-generation.yaml
round: 6
date: 2026-07-26
verdict: fail
by: cortex:architect-challenger (delta rounds 5-6 — scope reduction, bound restatement, rebound-hunting)
---

# Challenge record — job-runner delta, rounds 5–6

Continues `job-runner-2026-07-26-r1.md` (r1) and `-r4.md` (r2–r4). Append-only;
both earlier records stand unedited.

| Round | Verdict | High | Med | Low |
|---|---|---|---|---|
| r1–r4 | fail | 8 total | 19 | 10 |
| r5 | fail | 3 | 6 | 2 |
| r6 | fail | 3 | 3 | 1 |

## Round 5 — fail (3 high)

**HIGH · the ceiling bounded the item count, never the horizon's length.** Two
date rules contradicted, and both branches were wrong: the planner spreads N
slots across 28 days (~1.5 posts/week at a ceiling of 5, thinner than G-4's
metronome), while GENS-8's "next date carrying no item" back-fills earliest-first
and collapses the forward calendar, so every card is dated in the past when the
founder arrives at the weekly visit.

**HIGH · the first batch had no agenda.** `TOPS-1` opens "a scheduled run derives
and maintains the org's topic set" and **nothing scheduled it**. A fresh org's
once-only batch would find an empty agenda, `planCalendar` returns `[]`, zero
drafts persist — and the job SUCCEEDS. Claim spent, narration neither landing nor
visibly failing, sweeper repeating the no-op forever. **`INC-12` reproduced one
link upstream by the element written to close it**, against its own thesis about
accountable invokers.

**HIGH · `DEC-45`'s "no cascade" was false.** `STWS-1` is an approved P0 spec
whose sole acceptance names the deleted four-week plan; `GEN-1`'s title, the GENS
register's intent and interfaces, `XG-4`, `XG-8` and `G-4`'s coverage all still
assert it. Bumping `GEN-1` printed *"revisit 75 citing sites"*, 3 stale pins and
five dirtied coverage assertions including `STW-1`.

*Resolution:* the third high went to the founder and returned as **`DEC-46` —
split the delta**: ship the trigger, defer the metering (retained as an open
question). That dissolved highs 1 and 3 by removing the mechanism, and high 2
came into scope as a trigger-half fix.

## Round 6 — fail (3 high), against the reduced delta

All three are the same shape: **the excision removed bounds and did not restate
them.** None is a design flaw.

**HIGH · the first batch lost its size.** The surviving per-run cap named only
the refill; the deleted ceiling had bound both. The wired call defaults to twelve
(`slotCount ?? 12`). *Applied:* the cap binds both producers explicitly, with
acceptance (g).

**HIGH · "a date that carries no item" is not a bound.** Empty dates always
exist and the planner's spread shifts as `startDate` advances, so the refill
would generate at its cap forever — unbounded in total, several times the planned
density. *Applied:* the refill's target is `GENS-1`'s rolling four-week calendar
SHAPE, generating only for MISSING slots — an approved contract named, not a new
dial. The per-date key stays as the de-dup guard.

**HIGH · the bounded re-arm did not bind.** At the bound the claim's state was
unspecified, so the level trigger stayed armed and the next interview answer
would start a fresh chain. *Applied:* at the bound the claim STAYS SET
(dead-letter, no release), and claim + attempt count are durable `DM-1` fields —
a payload counter resets per chain.

Mediums applied: `GEN-1`'s coverage no longer credits a deleted gate; `TOP-1`
joined `ARC-28`'s consumer list and rides the daily sweeper (so the agenda is
MAINTAINED, not frozen at day-one topics); the deferred metering retained as an
open question per Phase C; the per-run cap given a value (three) and a home.
Low: the `DEC-45` citation now notes `DEC-46`'s supersession.

## Held in round 6 — the reduction is clean

- **Over-structure survives the changed premise.** `GENS-8` earns its ID at half
  the size: referenced by `ONBS-6` (×3), `ARC-28` (×2), `DM-5`, `INC-13` and two
  coverage pins. Neither `GENS-1` nor `ONBS-6` is the right home for "who calls
  the chain" — folding would put job scheduling inside a planner element or
  steady-state refill inside onboarding.
- **Excision hygiene:** no ceiling / disposable-count / three-dials / PROS-4
  language survives anywhere in the four artifacts.
- **The deferral is NOT a high.** The per-org ceiling never existed in any
  approved contract; `UX-3`/`G-3` were assessed complete without it.
- **The reduction repaired a conflict** it did not cause: leaving `GEN-1` at four
  weeks restores coherence with `STWS-1`'s acceptance, which `DEC-45`'s shortened
  horizon would have falsified.
- Verified against code, not prose: the empty-agenda diagnosis, the `scheduledFor`
  discriminator, the dropped `topicId`, and `approval.redirect` discarding its
  item id.

## The pattern, recorded because it is the lesson

Six rounds, six fails, ~50 findings. **The trigger half was fixed in r1 and held
in every round since; every high in r2–r5 was the metering half.** That is what
justified the split, and it is the transferable lesson: when successive
challenge rounds keep failing on the same seam while the rest holds, the seam is
the scope error, not the wording.
