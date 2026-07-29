---
kind: challenge-record
spec: .spec/specs/gen-content-generation.yaml
round: 5
date: 2026-07-26
verdict: fail
by: cortex:architect-challenger (delta rounds 2-4 — rebound-hunting, acceptance quality, element ownership, data-carrier existence)
---

# Challenge record — job-runner delta, rounds 2–4

Rounds 2, 3 and 4 in one record (r1 is `job-runner-2026-07-26-r1.md`). The r1
record forward-referenced an `-r2.md` that was never written — the challenger
caught that as a low in r4 ("the challenge evidence chain is broken"), and this
file discharges it. Append-only: r1 stands unedited.

| Round | Verdict | High | Med | Low |
|---|---|---|---|---|
| r1 | fail | 3 | 8 | 4 |
| r2 | fail | 1 | 6 | 2 |
| r3 | fail | 2 | 5 | 4 |
| r4 | fail | 2 | 6 | 2 |

**The dominant pattern, stated plainly: the fixes kept rebounding.** r2's high
was created by r1's fixes; both r3 highs by r2's; and r4's first high is r3's
own finding returning through the same clause a third time. That is the finding
about this delta, not an aside — see the escalation at the end.

## Round 2 — fail (1 high)

**HIGH · the refill's lifecycle was unspecified, and the at-enqueue claim made a
failed first batch permanent.** r1's atomicity fix (claim committed with the
enqueue) converted *enqueued-once* into *attempted-at-most-once-ever*; nothing
specified the refill's start condition or cadence, and ONBS-6's narration had no
bound. Three readings existed and no acceptance clause distinguished them; one
of them left an org silently stuck forever — INC-11's class, one layer down.
*Applied:* standing predicate-gated refill, claim released on terminal failure,
bounded narration, new acceptance clauses.

Mediums: the observer watched only the Memory conjunct of a two-conjunct
predicate; "no founder-authorship marker" was un-failable (the field does not
exist); the calibration marker had no DM-5 carrier and "redirected" is not a DM-5
state; "pending count" collided with the live `pending` delivery-state enum
meaning the opposite; the ceiling had no exclusion for undisposable items;
DSS-22/DS-5 named a family rather than an element. Lows: "due slot" undefined;
G-5 re-affirmation honesty.

## Round 3 — fail (2 high)

**HIGH · the disposable-draft count was structurally 0.** r2's fix excluded
`awaiting_picture` — but GEN-3 is hard and there is no autonomous picture source,
so `persistDraft` lands *every* generated master there. The gate could never
bind; the refill would generate forever between visits. Acceptance (d)
*mandated* the broken behaviour.
**HIGH · the first batch had no size and no ceiling** — only "the refill" was
gated, and the one wired call defaults to a month (`slotCount ?? 12`), landing
twelve cards on day one against DEC-18's "a few posts a week".

Mediums: the banned term survived in the operative sentence; QA-withheld drafts
counted but were not disposable; "two independent recovery paths" was one and 24h
late; "scheduled at org creation" stranded every existing org; the calibration
flag's retirement was inert in the branches with carriers and unimplementable in
the one without. Lows: the TOPS-4 half of the discriminator had no carrier;
INC-13 bound UX-1 instead of UX-3; nothing was accountable for SETTING the flag;
INC-13 sequencing.

## Round 4 — fail (2 high)

**HIGH · acceptance (d) still encoded the rule r3 removed.** The r3 fix landed in
the statement and never reached the criterion — `git diff` proved (d)
byte-identical. Since this project writes tests from acceptance sentences
(LRN-30, DEC-43), the defective half is the one that would have been encoded.
*Applied:* (d) rewritten; escalated holds now COUNT toward the ceiling rather
than being exempted (PROS-4 refuses to *suppress* a safety escalation — a
different act from declining to pile more work on top of one).

**HIGH · the generation gate requires a durable un-drafted plan slot, and no
carrier exists.** Splitting "plan a month" from "draft a few" makes four clauses
depend on a persisted slot that is not a draft. `data-model.yaml` models no plan
entity, DM-5 has no pre-draft state, and the calendar lives only as
`content_item.scheduled_for`. Both escapes are closed: persisting slots as
ContentItems puts them inside the very count that gates generation (a four-week
plan saturates the ceiling and generation never runs); recomputing on read is
non-deterministic (LLM pairing), voids acceptance (c), and blinds GENS-1's
quota seeding, degrading the STW-1 impact rhythm this spec calls its honest
LRN-20 split. **NOT APPLIED — escalated to the founder** (below).

Mediums applied: the ceiling now binds every AUTONOMOUS producer only (the
APRS-5 composer and EXTS-2 "draft this" are pulled, never gated); the retry
re-performs the conditional claim at execution and no-ops on rowcount 0, closing
the race the release re-opened; acceptance (b) rewritten for the sequential case
the level-trigger makes dominant; GEN named a PROS-4 consumer with a
one-request-per-stall HIGH-tier shape, so the message that breaks the pause is
not throttled by the budget; the count defined over GENS's own entity rather than
by reference to `readyStack`, restoring the dependency direction. Lows applied:
the ceiling declared a per-org tuning value with a documented default; the
calibration frame stated to PREFIX DSS-8's single slot rather than requiring a
new variant.

## Verified across rounds and holding

Recorded so they are not re-litigated: ARC-28's four ADR-0003 contract items,
org-scoped handle and ADR-0007 citation; the C4 altitude (component under ARC-3,
not folded into ARC-27/ARC-19); the transactional conditional claim itself (row
locking makes it genuinely exactly-once for concurrent claimants); the meter as a
generation gate rather than a surfacing filter, which dissolves the APRS-1 v3
acceptance conflict; the refill's per-slot-date idempotency; the single daily
sweeper substituting for per-org cron rows; the `scheduledFor` discriminator,
verified true of `planAndDraftCalendar` and false of both founder-initiated
producers; the per-item calibration flag on DM-5 and its redirect-clears rule;
GENS-8's over-structure (referenced by ONBS-6, ARC-28 and DM-5, rolls up through
GEN-1/ONB-6 — it earns its ID); ONBS-6's "lands with XH-12" sequencing.

## Escalation, and its resolution

r4's second high was not a wording defect. **DEC-44 (3) "plan a month, surface a
few" could not be built without a data entity that does not exist**, and the ways
to supply it were a founder-level choice. Per SDLC Phase C the agent does not
pick; the question went up.

**Resolved 2026-07-26 as `DEC-45` (refining DEC-44 (3)): drop the plan/draft
split — plan and draft stay coupled, and the ceiling bounds the horizon itself.**
The fix therefore DELETES the unbuildable mechanism rather than patching around
it: no plan-slot entity, no migration, no cascade to GENS-1 or XG-8. GENS-1's
acceptance ("over scheduled + planned slots") was written when plan and draft
were one act and needs no bump — the split this delta introduced is what would
have invalidated it, and the split is gone. The recorded cost is that Plan &
Published shows the near horizon rather than a full month; the plan-slot entity
stays available as the upgrade path if cohort-1 founders want to see further.

`GENS-8` rewritten accordingly. A round 5 verifies the rewrite before either spec
leaves `draft`.
