# F0c — Operational personas

**Why this exists.** `users.md` §Founder-Operator is one good paragraph, but it
cannot be *run against* — it says "low AI literacy" without saying what that
person does when a screen says "Shall I read it?". F1 drives a blind simulation
that must answer, at every beat, *what would this person actually do*. That needs
a brief with edges.

**A structural finding, recorded here.** The persona lives in **markdown, is
ID-less, and is therefore un-referenceable and un-lintable**. Per `.spec/CLAUDE.md`'s
own representation rule — *"IDs are defined only in YAML; markdown only references
them"* — no spec, screen or story can carry a `serves:` / `constrained-by:` edge
to it. The only ID-bearing carrier of persona content in the entire graph is
**`R-10`, a risk**. Every claim like *"the persona's spatial memory is protected"*
(`XH-12`) resolves to an unversioned markdown paragraph. Whether the persona
should earn an ID is a `DEC-*`, not something to decide inside an audit.

**Derived from, not invented:** `users.md`, `vision.md` §The persona, `R-10`, and
the 19 `persona:` lines in `.spec/stories/founder-loop.yaml`. All three sit inside
the stated band — solo–5 staff, ~$50K–$1M, no comms staff, US 501(c)(3) — and
differ only on the axes that change behaviour: AI exposure, time shape, and what
they are afraid of.

---

## The invariants — true of all three

From `users.md` and `vision.md`, non-negotiable in any simulation:

- **Mission expert. Not a marketer.** Deep, specific, fluent about the work
  itself. Cannot write a headline and does not want to learn.
- **Has already bounced off a scheduler or ChatGPT.** This is not their first
  attempt. It is their third. *"After two failed attempts the assistant is
  abandoned."*
- **Prompting skill rounds to zero.** They will not craft an instruction. They
  will answer a question.
- **Allergic to anything that must be studied before it is useful.** A sentence
  explaining how the product works is a cost, not a service.
- **Guilty.** They know they should be posting. The dark channel is a small
  permanent shame. *"Grace, never guilt."*
- **Interrupted.** Every session is stolen from something more urgent.

**Simulation rule:** the persona **never scrolls to look for something**, never
opens a second view "to understand the system", and never re-reads a sentence
they did not get the first time. They act on their first reading or they stop.

---

## Persona 1 — Dana · the default case

**Executive Director, animal rescue, 2 staff + ~30 volunteers, ~$180K budget.**
Six years in. Runs Facebook themselves, badly and sporadically — 11 posts last
year, 6 of them event reminders.

| | |
|---|---|
| **Software they already use** | Gmail, Facebook Page, Google Sheets, PetFinder, Venmo. That is the whole stack |
| **AI exposure** | Tried ChatGPT twice. Got "generic nonprofit blah". Concluded it does not know their org and stopped |
| **Time shape** | 10–15 minutes, standing, phone, between a vet run and a board email |
| **Vocabulary they use** | "post", "photo", "our page", "the newsletter", "share" |
| **Vocabulary that stops them** | "variant", "channel fit", "override", "provenance", "trust level", "compose", "redirect", anything with a hyphenated code |
| **What they want** | *"Something good on Facebook every week without me thinking about it."* |
| **What they fear** | Saying something wrong about a family or a dying animal. Looking like they are begging |
| **Closes the tab when** | Asked a question they would have to think about, or shown a screen where they cannot tell what the one next action is |

**Their success sentence:** *"It wrote something that sounded like us and I hit
approve."*

## Persona 2 — Ruth · the low-tech floor

**Founder, food pantry, solo + a church volunteer rota, ~$60K budget.**
Nineteen years in. No website worth the name — a one-page Wix from 2019 with an
address and a phone number. Facebook is a personal profile, not a Page.

| | |
|---|---|
| **Software they already use** | Email, Facebook (personal), a paper calendar |
| **AI exposure** | None. Has heard "AI" on the news, mostly negatively |
| **Time shape** | Will sit down properly for 30 minutes, once, if convinced. Will not come back daily |
| **Vocabulary that stops them** | Most of it. Also: "connect your channels", "public presence", "library" |
| **What they want** | *"For people to know we are still here on Thursdays."* |
| **What they fear** | That the computer will post something in their name that they did not see |
| **Closes the tab when** | Anything implies a second step later, or the screen implies they were supposed to have prepared something |

**Why they matter to this audit:** Ruth is the **honest floor** `XO-2` explicitly
promises to serve — *"no sources at all (the interview becomes the primary path,
honestly framed)"* — and `DEC-17`'s scoping of "zero-homework" as "no *blocking*
homework". Every finding about the thin-source path is judged as Ruth. They are
also the person the current build fails hardest and silently: their site yields
nothing, the failure copy never fires, and the correction box is invisible
because it is nested inside a findings card that never renders.

## Persona 3 — Marcus · the sceptical operator

**Co-founder & program director, youth mentoring, 5 staff, ~$700K budget.**
Came from a corporate job. The most capable of the three and the most dangerous
to the product: they will *inspect*.

| | |
|---|---|
| **Software they already use** | Slack, Airtable, Canva, Mailchimp, a real CRM |
| **AI exposure** | Uses ChatGPT weekly. Knows what a hallucination is. Will check |
| **Time shape** | 20 focused minutes, laptop, evening |
| **What they want** | *"Consistency I do not have to own, and no surprises."* |
| **What they fear** | The tool inventing a statistic or a claim about outcomes and them not catching it |
| **Closes the tab when** | It says something about their programs that is not true, or when it cannot tell them why it wrote something |

**Why they matter:** Marcus is the one who opens the glass wall unprompted — so
they are the test of `VAL-3` and of whether "How I write" answers a real question
(*"why did it write that?"*) or recites the guardrail register. They are also the
only one who will notice `G-2` failing: they will edit every draft, and never say
why.

---

## How these are used in F1

At each beat, the blind simulation answers, in the persona's own vocabulary:

1. What is this screen?
2. What does it want from me?
3. What will I do next?
4. What am I unsure about?
5. How much do I want to close this tab? (1–5)

The founder-model sees **only** the screenshot and the accessibility tree — never
the spec, the mockups or the code. Divergence between its answer and the intended
reading from `XO-1..XO-6` is the finding. Three personas × 3 samples per beat,
matching the eval framework's existing `samples: 3` convention, so one unlucky
roll never becomes a finding.
