# F1 — The cold-start simulation

**Run 2026-07-26. Live app, real Gemini (Vertex), fresh org per run, empty
database, no `demo:seed`.** Phone width 390px primary, desktop parity capture.
Every claim below has a screenshot in this folder.

The engine is keyed and working — `server.ts:21` loads `.env`, `VERTEX_AI_KEY` is
set, and the extraction quality proves it. **Nothing in this document is a
model-quality problem.**

---

## Run A · Dana — a real, rich nonprofit website

`Austin Pets Alive` / `dana@austinpetsalive.org` → proposes `https://austinpetsalive.org`.

| Beat | Elapsed | What happened | Screenshot |
|---|---|---|---|
| 1 | 0:00 | Doorstep. Two fields, consent sentence, EIN paragraph | `audit-f1-dana-01-doorstep-390.png` |
| 2 | 0:00.4 | Signed in. Day-one home. **"Shall I read it?" + [Yes, start reading]** | `audit-f1-dana-02-dayone-arrival-390.png` |
| 3 | 0:39 | Clicked yes. 38.5s of *"I'm reading your site now."* Then → | `audit-f1-dana-03-after-ingest-390.png` |
| 4 | 0:42 | Knowledge: **21 rich, accurate entries** | `audit-f1-dana-04-knowledge-390.png` |
| 5 | 1:05 | Asked *"Can you write a post about Monty the dog?"* → **it declined** | `audit-f1-dana-05-declines-to-write-390.png` |
| 6 | — | Same state at 1280px | `audit-f1-dana-06-same-state-desktop.png` |

### A1 — Success is punished. The better the ingest works, the worse the screen gets.

Beat 3 is the finding of this phase. After 38 seconds of reading, the day-one
shape **vanishes** — greeting, org name, source card, and any findings with it —
and is replaced by:

> ## 0
> **weeks of steady presence**
> **That's everything. Nothing is waiting on you.**
> ↳ *Next up from me: your following week's drafts.*

A founder asked Steward to read their website, waited half a minute, and was told
**nothing is waiting on them** — under a giant zero.

**Mechanism.** `isDayOne = ready?.ready !== true` (`dayOne.ts:72-74`). The ingest
succeeded so well that `readyForFirstDrafts` flipped true, the home left day-one
shape — and the steady shape is empty, because nothing generates drafts. **A
worse ingest would have produced a better screen.**

**Three compounding failures in one view:**
- The findings card never rendered. It lives in the day-one shape, and the shape
  flipped in the same refresh that produced the findings. Everything Steward
  learned is invisible unless the founder independently opens Knowledge.
- *"Next up from me: your following week's drafts"* is a promise nothing can keep.
- **The giant `0`.** `DESIGN.md` calls the steady-presence numeral *"Steward's
  signature moment"* at `--text-3xl/4xl`. It is being used to show a guilt-prone
  persona a zero on day one — against `DEC-16`, which removed streak framing
  precisely because *"it imported gamified guilt for a guilt-prone persona whose
  promise is grace, never guilt."*

### A2 — The engine is excellent. Verified.

Gemini extracted 21 entries from the live site, including specifics no template
could invent:

> *"Monty is an 11-year-old male Mixed Breed / Ridgeback dog, described as having
> **the permanent scowl of a disgruntled DMV employee**. He is APA-A-40017 and is
> in foster care."*
> *"Sweet BBQ Chicken … sunny, sweet, and companionable, who **takes his
> window-watching seriously**."*

Plus the current flood response, a $25K match, 2025 adoption and foster numbers,
hours, address, Dr. Ellen Jefferson, and four inferred style rules. **A human
comms manager handed this would write good posts today.** The raw material is
there and the product does nothing with it.

### A3 — Asked to do its job, it declines

Dana typed the single most obvious sentence a founder could type:

> **"Can you write a post about Monty the dog?"**

20 seconds later:

> *"I have details about Monty, including his age, breed, and a fun description,
> **but our strategy for writing posts isn't set yet**. If you'd like me to note
> this as **a gap** so we can establish some guidelines for post creation, just
> let me know!"*
> ↳ *I don't actually know that yet — I'd rather say so than guess.*

Four defects stacked:
1. **It refuses the core job** while confirming it has everything it needs.
2. It blames an unset strategy — which the founder cannot set, because
   `strategy.autoDraft` has no UI trigger and "How I write" says *"Not written
   down yet."* A dead end pointing at another dead end.
3. **"note this as a gap"** — the internal word, instructed by the prompt itself
   (`harness/prompts/chat-answer.ts:18`).
4. The ReasonLine reads *"I don't actually know that yet"* — **it does know**.
   `isUnknown` was set on a grounded answer, so the trust chrome contradicts the
   message above it.

### A4 — "What I never do" inverts the org's own rules

Live, with real data, "How I write" → **What I never do** listed:

```
GR-1: no outcome / impact promises          ← the guardrail register, verbatim
GR-2: no tax or legal advice
GR-3: sensitive topics escalate to human approval
GR-4: AI-generated visuals disabled (policy)
GR-5: external content must be cited
GR-6: official platform APIs only
Encourage adoption, fostering, and donation.        ← the org's OWN style rules,
Urge donations of supplies for flood relief...      ← which are POSITIVE
Request sign-ups for the Community Newsletter...
```

Section (c) merges the platform guardrail layer with the Memory overlay
(`strategy/index.ts:29-36` + `activeOverlay`), and the overlay contains **both**
`taboo` (never do X) **and** `styleRule` (do X this way) entries. Rendering both
under *"What I never do"* tells the founder Steward will **never encourage
adoption**. That is a semantic inversion of the org's own stated intent, visible
on the first visit, with real data.

### A5 — Knowledge renders code identifiers, and marks everything assumed

Every row is prefixed with a raw enum: `EVENT · ASSUMED`, `FACT · ASSUMED`,
`PERSON · ASSUMED`, **`STYLERULE · ASSUMED`**. And **21 of 21 rows are marked
`assumed`** — the AssumedNote is meant to flag inference so the founder can
correct it (`MEMS-5`); when it is on literally everything it carries no
information and reads as "Steward is sure of nothing."

---

## Run B · Ruth — no website at all (`ruth.pantry@gmail.com`)

The `XO-2` honest floor: *"no sources at all — the interview becomes the primary
path, honestly framed."*

**The branch itself is good.** Gmail is correctly detected as a public mail host,
so instead of a wrong guess the founder gets *"Where can I read about you?"* with
a free field and *"Skip it if you'd rather just talk — I'll learn from you
instead."* That is honest and well-judged. `audit-f1-ruth-01-no-website-390.png`

### B1 — The interview is an interrogation, and it hallucinates a prior turn

Clicking "Ask me something" → 22 seconds → **three questions at once**, all
asking for the same thing:

1. *"I'm curious about the spark that started your nonprofit – could you tell me a story about what really inspired its creation?"*
2. *"Could you share a quick story about a time one of your programs made a tangible difference for someone or a family?"*
3. *"**You mentioned that concrete stories really make an impact** – could you share a recent small win or a memorable interaction that really embodies your work?"*

- **Three is an interrogation** for this persona. `INT-2` says *"a few questions at
  a time, never an interrogation"*; the reviewed mockup asks **one**, grounded in
  something just read.
- **All three are the same question.** No progression, no variety — three
  rephrasings of "tell me a story."
- **Question 3 attributes a statement to Ruth that she never made.** She has typed
  zero characters. This is a grounding failure in founder-facing text, and it is
  the exact thing that ends Marcus's trust permanently.
- Consultant register throughout: *"tangible difference"*, *"really embodies your
  work"*, *"concrete stories really make an impact."*
- No *"I have 2 minutes — pause"* escape (the mockup has one).
- The terminus still reads *"I'm still thin on you"* — no sense of progress.
- The website card is **still on screen** above the three questions, so Ruth is
  simultaneously asked for a website and asked three essay questions.

`audit-f1-ruth-02-interview-390.png`

---

## Run C · Marcus — a dead URL

`marcus@northside-youth-mentoring-audit.org` → proposes that non-existent domain.

### C1 — Silent failure. Confirmed exactly as traced.

Clicked **"Yes, start reading"**. **2.4 seconds later the screen is identical to
before the click** — same proposal card, same *"Shall I read it?"*, same button.

No error. No explanation. No state change. Nothing to indicate the click
registered at all.

`scrapeSite` swallows every failure and returns `[]`
(`adapters/sources/fetch.ts:43-49`), so `ingestSources` resolves as a **success**
with zero artifacts. The honest copy that exists for exactly this case —
*"Your site wouldn't load, so I've learned nothing from it yet…"* — is gated on
`ingest.isError` and can never fire.

Marcus's actual next action: click it again. Then again. Then conclude the
product is broken. `audit-f1-marcus-01-dead-url-390.png`

---

## Timing against the goals

| Goal | Target | Observed |
|---|---|---|
| `G-5` first approved post | inside the first session | **Not reachable.** No draft can be produced |
| `G-3` under 15 min/week | — | Dana spent 65 seconds and had nothing to approve |
| Ingest | *"first drafts in about ten minutes"* (`XO-2`) | 38.5s to read; drafts: never |
| Interview turn | — | 22.3s for three questions |
| Chat answer | — | 20.1s |

**A 20–38 second wait is itself a finding.** There is no client-side deadline;
`resilience.ts` allows 30s × 3 attempts per LLM call, so the worst case is ~90
seconds per call with only a button label changing. Nothing streams.

---

## Comprehension divergence — what the founder believes vs what is true

Judged against the F0 [personas](personas.md), on the rendered screens only.

| Beat | What the screen makes them believe | What is true |
|---|---|---|
| Doorstep EIN line | *"Do I need an EIN? Is that going to be a problem?"* | Nothing about EIN matters. The product raised a question it then declines to answer |
| Day-one arrival | *"It's waiting for me to give it a website."* | It could have started; `VAL-6` says it should have |
| After ingest (A1) | *"It read my site and found nothing worth doing."* | It found 21 excellent facts and cannot act on any of them |
| The `0` | *"I'm already behind."* | Day one. Nothing is behind |
| *"Next up from me: your following week's drafts"* | *"Drafts are coming."* | They are not, ever |
| Declined post (A3) | *"It can't write. Why am I here?"* | It can write; no trigger exists |
| Dead URL (C1) | *"Did my click work? Is this broken?"* | The fetch failed and was swallowed |
| "What I never do" (A4) | *"It will never encourage adoption?"* | Those are its positive style rules, mis-headed |

**Every divergence points the same way: the founder concludes Steward is less
capable than it is.** The product systematically under-sells a working engine.
