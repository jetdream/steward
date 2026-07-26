# F2–F5 — Findings and triage

Consolidated register for Phase F. Evidence: [reachability.md](reachability.md),
[cold-start.md](cold-start.md), [story-intent.md](story-intent.md); yardstick:
[intent-baseline.md](intent-baseline.md), [personas.md](personas.md).

Routed per the SDLC's B7 triage — **fix at the layer that failed.**

| Class | Meaning | Count |
|---|---|---|
| 1 · Copy defect | Spec right, string wrong | 7 |
| 2 · Spec violation | Build diverges from approved text | 11 |
| 3 · Missing implementation | Spec right, nothing implements it | 6 |
| 4 · Spec gap | Never specified, should have been | 3 |
| 6 · Wrong spec / to decide | Approved text may itself be wrong | 3 |
| 7 · Requirement/goal | Intent itself changes | 2 |
| P · Process | How the evidence system failed | 3 |

---

## Class 3 — Missing implementation *(the root cause)*

**F-1 · No UI trigger for generation.** Zero client callers of
`content.planAndDraft`, `topics.identify`, `strategy.autoDraft`. The chain
no-ops anyway (`content/planner.ts:148`). Violates `VAL-6`, `VIS-1`, and
`ONBS-6`'s own acceptance. → **New increments.**

**F-2 · No job/queue substrate.** `ADR-0003` provisions a Job/Queue port; nothing
implements it (`rg "JobPort|scheduler|cron|setInterval" backend/src shared/src` →
0). Steward cannot act between visits, so "an employee who shows up" is
structurally impossible and `PRO-*` is unbuildable. → **`DEC-*` (D1) + new
increments.**

**F-3 · The loop never closes.** Nothing writes `deliveryState: "published"`
except `demo:seed:302-305`. `publishLog` reads only that state, so
"Already out" can never fill and `US-19` is false. → **New increment.**

**F-4 · `DEC-24`'s proactive-interruption budget (`PRO-4`) is unbuilt** — the
spec's only anti-overwhelm mechanism. Dormant while `PRO-*` is P2, but blocks
`G-3` once anything proactive ships. → **Blocked on F-2.**

**F-5 · `strategy.autoDraft` has no trigger**, so "How I write" can never fill —
and it is the stated reason chat refuses to write (`cold-start.md` A3). One dead
end pointing at another. → **New increment.**

**F-6 · `radar.discover` has no trigger** — Discoveries can never fill.
→ **Blocked on F-2.**

---

## Class 2 — Spec violations

**F-7 · The day-one terminus shows a guilt-inducing zero.** `XH-6` prescribes a
first-ever-week state — **"your first full week"** — and the string is **absent
from the codebase**. The build renders `0 weeks of steady presence` in
`DESIGN.md`'s "signature moment" display type, to a persona `DEC-16` explicitly
protected from streak-guilt. → **Code fix, cite `XH-6`.**

**F-8 · `ONBS-6`'s acceptance is false.** *"An org that provides only name +
email and ten minutes of interview receives first drafts in that session."* It
does not. → Resolved by F-1.

**F-9 · Steward waits for permission instead of working.** `XO-2`: *"the home
opens in day-one shape with Steward already narrating ingestion."* Build renders
*"I think this is you — … Shall I read it?"* and waits. → **Code fix.**

**F-10 · Findings do not stream.** `XO-2`: *"Findings stream in as cards."* Build
shows one binary narration until the mutation resolves, then nothing.
→ **Code fix.**

**F-11 · Ingest failure is silent.** `XO-2` prescribes *"your site wouldn't load
— I'll retry; meanwhile, tell me…"*. `scrapeSite` swallows every error and
returns `[]` (`adapters/sources/fetch.ts:43-49`), so failure resolves as success
and the honest copy — gated on `ingest.isError` — can never fire. Confirmed live:
2.4s, screen unchanged. → **Code fix.**

**F-12 · The interview is an interrogation.** `INT-2`/`INTS-2`: *"a few questions
at a time, never an interrogation."* Three near-identical questions arrive at
once (`PER_TURN_CAP = 3`); the reviewed mockup asks one, grounded.
→ **Code fix + prompt.**

**F-13 · The interviewer fabricates a prior turn.** Live, to a founder who had
typed nothing: *"**You mentioned that** concrete stories really make an
impact…"* A grounding failure in founder-facing text. → **Prompt fix +
eval case.**

**F-14 · Prescribed narration survives only as a comment.** *"I'm reading your
website now — first drafts in about ten minutes"* (`XO-2`, `DSS-22`) exists at
`client/src/ds/Narration.tsx:7` **in a JSDoc block**. The rendered text drops the
time estimate and substitutes *"Findings land here as I go"* — a promise nothing
keeps (F-10). → **Code fix.**

**F-15 · Connect-in-context is absent.** `XO-4`/`ONBS-4`: approving the first
draft prompts connecting the channel in context. Not in the day-one path; connect
exists only in Controls. → **Blocked on F-1.**

**F-16 · `GR-8` breach — the founder's own rules are not applied to their own
post.** `approval/index.ts:229` calls `checkGuardrails` with a hardcoded
`overlay: []`. `GR-8` is a hard guardrail: *a stated correction is never
violated.* Same at `content/external.ts:45`. → **Code fix. Out of audit order —
this is a live guardrail breach, not a UX finding.**

**F-17 · "What I never do" inverts the org's own rules.** Section (c) merges the
platform layer with the Memory overlay, and the overlay holds both `taboo` and
`styleRule`. Confirmed live: Steward told a shelter it will never *"Encourage
adoption, fostering, and donation."* → **Code fix — split the kinds.**

---

## Class 1 — Copy defects

**F-18 · 12 spec-ID leaks.** Worst: `strategy/index.ts:30-36` renders `GR-1:` …
`GR-6:` verbatim under "What I never do"; `content/store.ts:36` stamps
`${f.guardrail}: ` onto **every** held card; `chat/index.ts:100` puts `(CHTS-5)`
on screen 0.4s after signup. Also `PIPE-4`, `GR-8 backstop`.

**F-19 · 9 raw enum renders.** `awaiting picture`, `facebook_page`, `STYLERULE`,
`identity`, `caseStudy, impact_gratitude`. Mostly `GlassWall.tsx`; the correct
label-map pattern already exists at `PostCard.tsx:27-36`.

**F-20 · Off-glossary vocabulary reaching the founder:** *spine*, *composer*,
*gap*, *taboo*, *overlay*, *stub*, *keyless*, *escalate*, *regenerate cap*.
`glossary.yaml` already states *"UI copy uses these names."* Note `chat-answer.ts:18`
**instructs the model** to say "gap" to the founder.

**F-21 · The doorstep EIN paragraph.** Raises a question the founder did not have,
then declines to answer it. The *absence* of an EIN field is authorized; this
paragraph is authorized by nothing.

**F-22 · `isUnknown` on a grounded answer.** Live: Steward described Monty in
detail under the ReasonLine *"I don't actually know that yet."* The trust chrome
contradicts the message above it.

**F-23 · Canned skip reasons become permanent rules.** Tapping "Not now" writes
it to Memory via the correction channel (`ReadySpine.tsx:176` →
`approval/index.ts:191-196`), so "Not now" later appears among standing rules.

**F-24 · Every Knowledge row is marked `assumed`** — 21 of 21 live. `MEMS-5`
intends the marker to flag inference for correction; universal, it is noise.

---

## Class 4 — Spec gaps

**F-25 · The day-one → steady shape transition is unspecified.** `XH-12` defines
three shapes but no transition; `onb-onboarding.yaml` defers the UI-detail pass.
**This gap is what destroys the findings card** — the ingest succeeds,
`ready` flips, the shape changes in the same refresh, and everything learned
becomes invisible. → **Amend `XH-12`, then code.**

**F-26 · D3 metering has no spec element** — "plan a month, surface a few"
is new behaviour between the calendar and Ready.

**F-27 · D4 calibration framing** — `ONBS-6` specifies the trigger, not the
"here's my first go, tell me what's off" framing.

---

## Class 6 — Wrong spec, or the build is right *(your call)*

**F-28 · Trust-level labels.** `DEC-16` and `glossary.yaml` mandate **"Ask me
first / Publish with a heads-up / Run on your own"**. All three strings are
**absent**; the build uses *"I approve everything" / "Let the routine ones go" /
"Run it"*. The build's are arguably better colleague voice. Either the code
conforms or `DEC-16` is amended — **not left divergent.**

**F-29 · Interview push vs pull.** Baseline assumes push; the build is pull
(the founder must click "Ask me something", and exhaustion is silent).

**F-30 · `US-1` says "arriving on a laptop"; `UX-1 v2` says "the phone is the
floor."** The story register contradicts the experience register.

---

## Class 7 — Requirement / goal

**F-31 · `G-5` re-scope (D2).** *"First approved post **live** within 48 hours"*
→ *approved*. **Goal-level semantic change: needs `DEC-*` + a `v` bump; the HITL
lint will demand the citation and `docs-check` will list the cascade.**

**F-32 · The persona is un-referenceable.** `users.md` is markdown and ID-less,
so nothing can carry a `serves:` edge to it; the only ID-bearing carrier of
persona content is `R-10`, a *risk*. → **`DEC-*` on whether the persona earns an
ID.**

---

## Process — how the evidence system failed

**F-33 · The seed fabricated both ends of the loop.** `demo:seed` inserts the
drafts *and* a `deliveryState: "published"` row. Every draft-dependent e2e signs
into that org; the two fresh-signup specs never assert a draft appears. **No test
in the suite could fail because the product cannot write.**

**F-34 · The `US-*` register was reverse-engineered from the build.** Of 19
stories, 12 evidence a founder goal, 5 evidence only a precondition, 2 pass while
failing the founder. Every ✓ is about how a surface behaves; every ~ and ✗ is
about whether there is anything to put in it.

**F-35 · `LRN-30` already recorded this blindness, and it recurred.** The lesson
was written; the gate that would enforce it was not.

---

## Repair sequence — ordered by founder-minutes bought back

| # | Work | Findings closed |
|---|---|---|
| 0 | **`DEC-*` for D1 + D2**, `G-5` bump, cascade | F-31, and unblocks 1 |
| 1 | **Job substrate + generation trigger, calibration-framed** | F-1, F-2, F-8, F-15, and F-4/F-6 become buildable |
| 2 | **Amend `XH-12` transition; stop discarding day-one findings** | F-25, F-7, F-10, F-14 |
| 3 | **Surface ingest failure** | F-11 |
| 4 | **`GR-8` overlay hole** *(out of order — live breach)* | F-16 |
| 5 | **Split `taboo` from `styleRule`** | F-17 |
| 6 | **Interviewer: one grounded question, no fabricated turns** | F-12, F-13, F-29 |
| 7 | **Close the publish end** | F-3 |
| 8 | **Leaks + enums + vocabulary** | F-18…F-24 |
| 9 | **The gate (F6)** — fresh-signup reachability e2e, ID/enum lint, comprehension eval | F-33, F-35 |

`F-28`, `F-30`, `F-32` are decisions, not work — they need your call before they
become either.

---

## F6 — The gate that stops this recurring *(proposal)*

Three checks, deliberately split per `LRN-20` — **deterministic for structure,
LLM judge for meaning, never regex for semantics.**

### 1 · A fresh-signup reachability e2e *(the one that matters)*

One spec that signs up a brand-new org, drives the day-one path, and asserts **a
draft arrives that the founder did not write**. No `demoEmailFor`, no seeded
rows.

This single test would have failed on the day E9 merged and every day since. It
is the cheapest item in this document and it closes `F-33`.

Corollary, and the harder rule: **a seeded fixture may set up a state, never
prove a capability exists.** Any e2e whose subject is "the product can do X" must
reach X through the product. → an `LRN-*`, and a line in the module `CLAUDE.md`
for `demo/`.

### 2 · A deterministic copy lint, keyless, inside `npm run gate`

Over the F3 corpus of founder-visible strings:

| Rule | Catches today |
|---|---|
| No `[A-Z]{1,4}-\d+` in a founder-visible string | 12 (`F-18`) |
| No unmapped enum value reaching the DOM | 9 (`F-19`) |
| Off-glossary domain terms flagged for a decision | *spine, composer, gap, taboo, overlay, stub, keyless* (`F-20`) |
| Every prescribed spec sentence is present or consciously waived | `F-7`, `F-14` — both were **absent strings** a grep would have found |

The last row is the interesting one: `XH-6` prescribes *"your first full week"*
and `XO-2` prescribes *"first drafts in about ten minutes"*. Both are absent from
rendered code — one entirely, one demoted to a JSDoc comment. A conformance list
of the ~60 prescribed sentences is mechanical to check and would have caught the
guilt-inducing zero before it shipped.

### 3 · A `founder-comprehension` eval skill, keyed tier

In the existing `backend/src/eval` framework, using its already-defined but
**dormant** `judge` scorer kind (`types.ts:11`, `judgeAgreementThreshold: 0.8`).
Dataset: the F1 beats plus the F3 corpus. Metric: does a blind persona's reading
of a screen match its intended reading — the `cold-start.md` divergence table,
run as a regression.

This is the only one of the three that could have caught `F-13` (the interviewer
fabricating *"You mentioned…"*) or `F-22` (`isUnknown` on a grounded answer),
because both are semantic and both were produced at runtime by the model.

### Why all three, and not just the third

The failures in this audit split cleanly. `F-1` and `F-2` are **reachability** —
only a real user journey catches them. `F-7`, `F-14`, `F-18`, `F-19` are
**structural** — a grep catches them in milliseconds. `F-13`, `F-17`, `F-22` are
**semantic** — only a judge catches them. No single instrument covers the set,
which is precisely why a phase of green gates shipped a product that could not
write.
