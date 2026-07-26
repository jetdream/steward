# F0d — Per-story founder intent

**The problem this pass exposes.** The `US-*` register was written during Phase E,
increment by increment, *from the implementation that had just been built*. So
every story states a **contract** the code already satisfies, not a **goal** the
founder arrived with. `US-1` is *"The home always presents the same skeleton."*
That is a fact about the DOM. The founder's goal is *"tell me what needs me today
and let me be done."* A register written that way can only ever confirm the build
— which is exactly the drift `method/sdlc.md` B2b warns about.

**What follows.** Each story with the founder's goal restated in their words
(Dana's vocabulary — see [personas.md](personas.md)), and a verdict on whether
the structural acceptance actually evidences that goal.

Verdicts: **✓** the acceptance evidences the goal · **~** it evidences a
precondition of the goal, not the goal · **✗** the goal is not evidenced at all,
or there is no founder goal behind the story.

*Recorded as an audit artifact, not yet written into the register — amending 19
story items is a repair, and repairs wait for the F5 triage.*

| Story | Structural acceptance says | The founder's actual goal | |
|---|---|---|---|
| US-1 | Chrome + four regions in fixed order, no badges | *"I want to open this and immediately see what needs me — without hunting."* | **~** Order is a precondition of legibility. Nothing asserts the founder can tell what needs them |
| US-2 | A pane opens beside the home, stream dimmed, place kept | *"If I go look at something, I don't want to lose where I was."* | **✓** |
| US-3 | Pinned card at full opacity, focusable, clickable beside a pane | *"The scary one shouldn't disappear because I got distracted."* | **✓** |
| US-4 | One gesture dismisses; focus returns to the opener | *"Get me back to what I was doing."* | **✓** |
| US-5 | Pause reachable in one gesture at every level, under a takeover | *"If this starts saying things in my name, I need to stop it NOW."* | **✓** — the strongest story in the register |
| US-6 | Two inputs + a consent sentence; submit lands on the home | *"Let me start without filling in a form about myself."* | **✓** |
| US-7 | Pause survives a reload and the state is honest | *"Did it actually stop? I don't trust that it stopped."* | **✓** |
| US-8 | No step counter, progress bar or checklist on day one | *"Don't make me set anything up. Just start."* | **~** Asserts the *absence* of a wizard. Never asserts the presence of the thing that should be there instead — Steward already working |
| US-9 | Interview turns persist across a reload | *"I got interrupted. Don't make me start over."* | **✓** |
| US-10 | Openings are offered, each with a reason | *"I never know what to say to these things."* | **✓** — directly serves `R-10` |
| US-11 | A rule is previewed and confirmed before it binds | *"If I tell it something, I want to know it heard me — and that it won't do more than I said."* | **✓** |
| US-12 | Header names count + minutes; the stream ends | *"How long is this going to take, and will I be finished?"* | **~** Evidences the *promise*. The stack it counts is fabricated by the seed |
| US-13 | Held card excluded from batch, with its exclusion named | *"Don't let me accidentally approve the sensitive one."* | **✓** |
| US-14 | The reason is asked after the skip, and is dismissible | *"Not this one. Don't make me justify it."* | **✓** |
| US-15 | Every channel shown, including skipped ones, with reasons | *"Where is this actually going, and what will it look like?"* | **✓** |
| US-16 | A composed post runs the same guardrail checks | *"I wrote this myself — but tell me if I've said something I shouldn't."* | **✗** The check runs with `overlay: []` (`approval/index.ts:229`), so the founder's own stated rules are not applied. The acceptance passes; the goal fails |
| US-17 | Four views, one click, no badge or count | *"What does it think it knows about us? I want to check before I trust it."* | **~** Asserts reachability and the absence of nagging. Never asserts any view *answers* anything — and on a fresh org all four are empty |
| US-18 | Controls shows each channel's state and the right repair | *"What can it actually do right now, and what can't it?"* | **✓** |
| US-19 | Approve → leaves the stack → appears in Plan & Published | *"Did the thing I approved actually go out?"* | **✗** Nothing writes `deliveryState: "published"` except the seed. The story's arc is real only in fabricated data |

---

## What the column shows

| Verdict | Count | |
|---|---|---|
| **✓** goal evidenced | 12 | Mostly the *mechanics of trust* — pause, focus, confirmation, pinning. Phase E built these genuinely well |
| **~** precondition only | 5 | US-1, US-8, US-12, US-17 — each asserts a container and never its contents |
| **✗** goal not evidenced | 2 | US-16, US-19 — both pass their acceptance while failing the founder |

**The pattern is not random.** Every ✓ is about *how the surface behaves*. Every
~ and ✗ is about *whether there is anything worth putting in it*. The register is
strong on interaction and blind on substance — which is the same shape as the
root cause in [reachability.md](reachability.md), arriving from a different
direction.

**Two stories that should exist and do not** — the two carrying the product
thesis, and their absence is why nothing caught the root cause:

> **"Work I did not ask for is waiting when I arrive."**
> *As Dana, opening Steward for the first time since signing up.* Drafts I did
> not write and did not request are in Ready, built from what Steward learned.
> — `VIS-1`, `VAL-6` P2.1. No story asserts this. No test asserts this.

> **"It kept working while I was not here."**
> *As Dana, returning a week later.* Something changed without me. — `VAL-6` P2.2.
> Requires the `ADR-0003` job substrate, which is unimplemented.

A register founded from the implementation could not have contained these,
because the implementation could not do them.
