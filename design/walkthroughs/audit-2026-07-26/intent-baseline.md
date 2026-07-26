# F0a — The intent baseline

**What this is.** The yardstick for Phase F. You chose *intent-first*: the audit
measures the build **and the specification** against what you actually wanted,
rather than measuring the build against a spec that might itself have drifted.

**What this is not.** Not a register, not a fourth source of truth. It is a
transient measuring instrument for this audit. Anything in it that proves
permanently true routes back into `vision.yaml` / `goals.yaml` / a `DEC-*` as an
amendment — founding a competing source of truth would be the disease, not the
cure.

**How it was built — deliberately not from the specs under audit**, so the
measurement is not circular. Sources: `product/vision.yaml` + `vision.md` (the
inert founding WHY), `product/goals.yaml`, the `DEC-*` HITL log (every recorded
human decision is intent, verbatim and dated), `THOUGHTS.md` (your unmediated
brain dump), and `design/mockups/**` (the artifacts you personally reviewed).

**Status: DRAFT — awaiting your sign-off.** Corrections are the point. Six open
questions are at the bottom; they are the places the sources genuinely do not
say, and they gate the rest of the audit.

---

## 1. What Steward is

> *"An AI **employee** that knows the organization, plans and writes its
> donor-facing content, publishes across channels almost autonomously — and that
> the founder can simply **talk to**."* — `VIS-1`

The comparison class is a **$500–1,000/month freelance social-media manager**,
not Buffer and not ChatGPT. *"Not a social media tool, not an AI writing
assistant… A worker, not software"* (`vision.md` §Positioning).

> *"The real competitor is doing nothing."*

**The founding insight, and the sentence the whole audit turns on:**

> *"The freelancer wins not because her posts are better, but because of **how she
> works**: she shows up on her own, brings finished work, asks good questions,
> and — decisively — you can just talk to her."*

**A1.** Steward must be judged as a *worker*, not a *product*. The test is not
"is this screen well designed" but "would I keep this person on staff."

---

## 2. The three pillars — as testable assertions

`vision.md` names three design consequences. Restated so each can pass or fail.

### P1 · The system owns the context
> *"Everything knowable is gathered without asking… everything learned is
> remembered permanently. It never asks for what it can find, and never asks the
> same thing twice."*

| # | Assertion | Testable as |
|---|---|---|
| P1.1 | The founder is never asked for something Steward could have found | No field on any screen requests a public fact |
| P1.2 | A stated correction is never violated afterwards | `GR-8`; observable across two drafts |
| P1.3 | Nothing is asked twice | The asked-set is consulted before every question |
| P1.4 | A gap Steward can reasonably default is **defaulted and marked**, never asked | `MEMS-5 shouldAsk`; a visible correctable note, not a question |

### P2 · The system moves first
> *"It proposes; the founder disposes. There is never a blank page. The founder's
> job is two verbs: **approve** and **redirect**."*

| # | Assertion | Testable as |
|---|---|---|
| P2.1 | **Finished work arrives without being requested** | Drafts exist in Ready that the founder did not write and did not ask for |
| P2.2 | **Steward acts while the founder is not looking** | State changes between two sessions with no interaction |
| P2.3 | No surface asks the founder to create from scratch | `VAL-6`, `DS-6` |
| P2.4 | Every action set stays minimal, plain, consequence-clear — never technical | `DEC-17 §2.1` |

> **P2.1 and P2.2 are the load-bearing ones, and both currently fail.** See §6.

### P3 · The system can be talked to
> *"One conversational surface, aware of everything… Ask it anything, tell it
> anything, change anything, in plain language."*

| # | Assertion | Testable as |
|---|---|---|
| P3.1 | The composer is never blank; Steward leads so the founder mostly *answers* | `CHT-5`, `DEC-17 §2.2` |
| P3.2 | Plain-language redirects bind immediately and permanently | *"never mention donor names"* → applied to the next draft |
| P3.3 | Talking is always an alternative to clicking | Every disposition has a conversational equivalent |
| P3.4 | It answers from what it knows, and says so honestly when it does not | Grounded, never invented (`VAL-4`) |

---

## 3. The founder's day

### Day one — the handshake
From `XO-1`, the reviewed mockup `design/mockups/exp-1-day-one/round-1/`, and `G-5`:

1. **Two fields.** Org name + email. Nothing else, ever.
2. **It is already working before the founder does anything.** *"I'm reading your
   website and your Instagram now — learning your voice, your programs, your
   people. First drafts in about ten minutes."* Findings stream in as they land.
3. **A few curious questions, grounded in what it just read.** Not a form in
   disguise. *"Your site mentions Biscuit — the senior beagle adopted last month.
   What happened when the family first met her? A sentence is plenty."*
4. **"Here's what I know"** — a correctable profile; every inference marked; a
   correction becomes a permanent rule.
5. **First drafts land in the same stream, inside the first session.**
6. **First yes → connect the channel in context**, at the moment it is needed.
7. Target: **a live post within 48 hours** (`G-5`).

**A2.** Nothing on day one is a wizard, a form, a checklist, a progress bar, or
homework. *"Whatever the founder can provide is okay — a website URL, a social
handle, or nothing but ten minutes to chat."*

### Every week after
> *"A digest of ready-to-publish posts on the founder's chosen cadence: approve in
> one tap, edit inline, or skip… Target: **under 15 minutes per week**, minus any
> time the founder chooses to spend chatting."*

A finite, ordered stack that states its own size and time cost, ends at an honest
"caught up", and never becomes an inbox that decays.

---

## 4. The bar — what makes it good

| Committed | |
|---|---|
| `G-5` | First approved post live within **48 h** of the first session |
| `G-3` | Median founder time in product **<15 min/week** after week one |
| `G-2` | **≥70%** of drafts approved *without edits* by week 8 |
| `G-4` | **≥80%** of active orgs hold an unbroken 4-week rhythm |
| `G-1` | ≥1 nonprofit paying $199/mo within 90 days |

**Qualitative, and no less binding** — the things no assertion can see:

- Is the draft something you would **actually post**, unedited?
- Does it sound like a **colleague**, or like software? (`VAL-5`)
- Does the reason under a card **explain anything**?
- Did anything ask for attention it had **not earned**?

---

## 5. What it must never feel like

Compiled from ~35 explicit anti-goals across the graph. The audit uses this as a
checklist.

| Never | Source |
|---|---|
| Software · a tool · a dashboard to operate | `VAL-5`, `users.md`, `DESIGN.md` |
| A form · a wizard · a checklist · homework | `XO-1`, `XO-6`, `ONBS-3` |
| An interrogation · a form in disguise | `INT-2`, `INTS-1` |
| A blank page | `VAL-6`, `DS-6`, `CHT-5` |
| An inbox · an infinite feed · a task list | `DEC-16`, `UXS-3`, `XG-9` |
| Guilt · a streak score · a nag · confetti | `DEC-16`, `APR-6`, `XH-6` |
| Surveillance | `DEC-16` ("Radar" → "Discoveries") |
| Jargon of any kind | `XB-4`, `DEC-16`, `glossary.yaml` |
| Something that must be studied before it is useful | `users.md`, `vision.md` |

---

## 6. Where the build contradicts the intent today

Recorded here because they are *intent* failures, not spec failures — the spec
gets these right. Full detail in [reachability.md](reachability.md).

| Pillar | Assertion | Status |
|---|---|---|
| P2.1 | Finished work arrives unrequested | ❌ **Fails.** No client caller for `content.planAndDraft`, `topics.identify` or `strategy.autoDraft`. The only content path is Compose, where the founder writes it |
| P2.2 | Steward acts while the founder is not looking | ❌ **Fails at the architecture layer.** `ADR-0003` specifies a Job/Queue port (cron + work queues, pg-boss on Postgres); **nothing implements it** — `rg "JobPort\|scheduler\|cron\|setInterval" backend/src shared/src` returns zero hits. Steward has no heartbeat |
| P1.1 | Never asked for what it could find | ⚠️ The founder is asked to supply and confirm the website URL — *"Shall I read it?"* — where the mockup shows it already reading |
| — | The loop closes | ❌ Nothing writes `deliveryState: "published"`; only `demo:seed` does. "Already out" can never fill |

**The consequence for the repair, and why it matters more than it looks:** wiring
`planAndDraft` to a button would produce *"press here to make Steward work."*
That is still a tool you operate — precisely what `vision.md` says this persona
bounces off after two attempts. **The honest fix is the job substrate**, not a
button. That is an architectural decision, not a bug fix, which is why it is
Q1 below rather than something I resolve myself.

---

## 7. Founder decisions — taken 2026-07-26

Answers to the four places the founding sources did not say. **These are binding
intent for the rest of the audit.** Each needs a `DEC-*` when its repair is
authorized at F5 — recorded here rather than written into the registers now,
because amending a goal mid-audit would move the baseline the audit is measuring
against.

### D1 · Steward runs when nobody is logged in — **build the job substrate**

Implement `ADR-0003`'s Job/Queue port (pg-boss on the existing Postgres).
Drafting, discovery and check-ins happen on a schedule with no session open.

**This settles P2.2 as real intent, and it changes what "fixing the root cause"
means.** Wiring `planAndDraft` to a button would produce *"press here to make
Steward work"* — still a tool you operate, which is the thing `vision.md` says
this persona abandons after two attempts. The button is not a smaller version of
the right fix; it is a different product.

→ Needs a `DEC-*` (flexibility-limiting architectural call, SDLC A5) and unblocks
the currently-unbuildable `PRO-*` proactive manager and `DEC-24`'s interruption
budget.

### D2 · A successful first session ends with **an approved draft**

Publishing stays dev-stubbed. `G-5`'s *"first approved post **live** within 48
hours"* is honestly re-scoped to *approved*, keeping platform OAuth off the
critical path.

→ Needs a `DEC-*` **and a `G-5` version bump** — a goal-level semantic change,
so the HITL lint will require the citation. This is the one cascade in the set;
`docs-check` will list every citing site.

### D3 · **Plan a month, surface a few**

`planAndDraftCalendar` generates the rolling four-week calendar so Plan &
Published is genuinely forward-looking, but Ready only ever holds a few cards at
a time. The stack stays finite and finishable inside `G-3`'s fifteen minutes;
the planner's mix-quota logic (`STW-1` impact/gratitude spacing) gets a real
window to operate over.

→ Reconciles `DEC-18`'s cadence ceiling with the planner as built. Metering
between calendar and Ready is new behaviour and needs a spec element.

### D4 · The first batch fires **automatically, framed as a first attempt**

No gate, nothing to click. But the first drafts are presented as *calibration* —
"here's my first go, tell me what's off" — inviting correction rather than
approval.

**Why this is more than copy:** it sets honest expectations at the exact moment
Steward knows least about the org, and it converts an early rejection from a
disappointment into a `MEM-1` correction that makes the next batch better. It
also gives the day-one stream a truthful answer to *"why is this a bit generic?"*

→ A new state on the day-one path. `ONBS-6` currently specifies the trigger but
not the framing.

---

## 8. Still assumed, not asked

Stated so it can be corrected if wrong: **the interview is push, not pull.**
Today the founder must click *"Ask me something"*, nothing asks unprompted, and
running out of questions is silent. `INT-1`, `XO-3` and the reviewed mockup all
show Steward asking on its own, one grounded question at a time. The audit treats
the current pull behaviour as a defect.

And the standing invitation: **§1–§5 are reconstructed from your artifacts, not
from you.** Anything there that is not what you meant is the most valuable
correction available to this phase, because every later finding is measured
against this document.
