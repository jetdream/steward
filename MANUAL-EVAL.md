<!-- GENERATED from .spec/stories/*.yaml — do not edit by hand.
     Change a story, then run `npm run manual-eval`. (DEC-43) -->

# Steward — manual evaluation

The walkthrough for a human. Each step is one thing to **do** and one thing to
**observe**; the observation is the story's acceptance sentence, and the same
sentence is asserted automatically by the e2e spec named beside it.

A step that reads correctly but *feels* wrong is still a finding — the machine
checks that the contract holds, not that the product is good. Route findings
back through the SDLC as spec amendments or `DEC-*` decisions, not as silent
UI tweaks.

## Before you start

Two paths. Do the first; the second is what tells you whether the product is
actually any good.

**A · The seeded org — state coverage.** Every card state at once, deterministic,
no model involved.

```bash
npm run infra:up      # Postgres, if it isn't already up
npm run db:migrate
npm run demo:seed     # writes the synthetic org (SEC-4 — no real org's content)
npm run dev           # api + web on :3000
```

Then open `localhost:3000`, choose **Sign in instead**, and enter
`demo@steward.test`. You will land on a home with a held card pinned, a spine of
two, a published post in the log, an expired Instagram connection, and two
discoveries waiting.

**B · A live run — the real thing.** A fresh org against real Gemini. This is
the path that answers the question the phase exists to ask.

```bash
# .env needs VERTEX_AI_KEY (gitignored; never commit or print it)
npm run dev
```

Sign up at the doorstep with a real nonprofit's name and your address, let it
propose reading that site, answer a couple of its questions, and see what it
writes. Judge the *writing*, not the plumbing.

## What "wrong" means here

A step whose observation holds but which **feels** wrong is still a finding —
the automated checks prove the contract holds, never that the product is good.
The things worth watching for are the ones no assertion can see: does it sound
like a colleague or like software; is the draft something you would actually
post; does the reason under a card explain anything; did anything ask for your
attention that had not earned it.

## Known limitations — none of these are defects

- **Publishing is dev-stubbed.** Nothing reaches Facebook, Instagram, Threads or
  X. The publish log's "live link" goes nowhere; the connectors are the dev
  stand-ins, since the platform OAuth apps are out of scope (`ONBS-4` deferral).
- **501(c)(3) verification does not exist**, so the doorstep asks for no EIN
  rather than showing a verification state it cannot reach.
- **Guided Adjust** (the conversational redraft) has no backend; the verb says
  so. Raw Edit and Redirect are live.
- **No undo after approve.** `APRS-1`'s recall (approved → draft while still
  pending) has no procedure yet, so approving is final until publish.
- **Cadence, notifications and billing** are named as absent in Controls — none
  has a backend.
- **Only TL0 is active.** The trust ladder is shown; TL1/TL2 activation is P2.
- **Keyless runs escalate everything.** With no model key, the guardrail judge is
  dormant and FAIL-SAFE, so every generated draft is held. That is correct
  behaviour, and it is why the seeded org writes its clean card directly.
- **`@news`, billing and the admin/ops console are not built.** Out of this
  phase by scope.

## Founder-loop stories — the manual-evaluation walkthrough, made normative

### 1. The home always presents the same skeleton  <sub>US-1</sub>

**As** Maria, the founder — marketing-averse, time-poor, arriving on a laptop.

**Do:** Whatever shape the home is in — day one, the weekly visit, or the quiet earned-autonomy state — the founder sees the same chrome and the same region order, so their spatial memory keeps working (DEC-18).

**You should observe:** The chrome shows Pause, the wordmark, the four plain-labeled Look-inside links, Controls and Compose; the regions below appear in the order pinned → Ready → conversation → terminus; and no Look-inside link carries a badge, count or dot.

<sub>Auto-checked by client/e2e/shell.spec.ts · serves UX-1, UX-3</sub>

### 2. A summoned view opens beside the home without losing her place  <sub>US-2</sub>

**As** Maria, opening a glass-wall view on her laptop mid-visit.

**Do:** On desktop the pane opens BESIDE the home column — the stream stays present and dimmed with its place kept, rather than being replaced or covered (DEC-19).

**You should observe:** With a pane open the home column is still visible to its left at its full readable width, the stream is dimmed but not hidden, and the pane occupies the added width without overlapping the column.

<sub>Auto-checked by client/e2e/shell.spec.ts · serves UX-1</sub>

### 3. A held card stays reachable while a pane is open  <sub>US-3</sub>

**As** Maria, who has a sensitive draft held for her while she reads something else.

**Do:** The pinned needs-you zone — GR-3 holds, publish failures, channel re-auth — stays live while a summoned pane is open on desktop: undimmed, clickable, keyboard-reachable, and still announcing. It is the one region a pane never takes away (XH-12).

**You should observe:** With a pane open on desktop, the pinned card is at full opacity, its button takes keyboard focus, and a click at its centre lands on that button rather than on the pane or a backdrop.

<sub>Auto-checked by client/e2e/shell.spec.ts · serves UX-3, APR-1, DS-4</sub>

### 4. Leaving a pane returns her exactly where she was  <sub>US-4</sub>

**As** Maria, dismissing a view to get back to her stack.

**Do:** One gesture closes a summoned pane — the back control or Escape — and focus returns to the control that opened it, so keyboard and screen-reader users are not dropped at the top of the document.

**You should observe:** Pressing Escape with a pane open closes it, returns focus to the exact control that opened it, and leaves no region inert.

<sub>Auto-checked by client/e2e/shell.spec.ts · serves UX-1, DS-4</sub>

### 5. The kill switch is always one gesture away, even under a takeover  <sub>US-5</sub>

**As** Maria on her phone, mid-way through reading a draft, who wants everything to stop right now.

**Do:** Pause is reachable in ONE gesture at every trust level and in every state — including with a full-screen pane open on a phone, which is where a takeover could most plausibly bury it (AUT-3 is a hard guardrail).

**You should observe:** At phone width with a pane open, the chrome is still visible above the takeover and the Pause control takes keyboard focus without dismissing the pane first.

<sub>Auto-checked by client/e2e/shell.spec.ts · serves AUT-3, UX-6</sub>

### 6. Two fields is the whole of signing up  <sub>US-6</sub>

**As** Maria, arriving for the very first time with nothing but her organization's name and her email address.

**Do:** The doorstep (XO-6) asks for an organization name and an email and nothing else — no wizard, no checklist, no EIN gate — and one submit lands her in her own home with her organization's name on it (ONB-1: nothing blocks on completeness). Signing out returns her to the doorstep.

**You should observe:** The doorstep shows exactly two inputs and a plain-language consent sentence; submitting them lands on the home whose greeting carries the typed organization name; and signing out returns to the doorstep.

<sub>Auto-checked by client/e2e/doorstep.spec.ts · serves ONB-1, ACC-1</sub>

### 7. Pause is the real switch, not a button that looks like one  <sub>US-7</sub>

**As** Maria, who hit Pause yesterday and wants to be certain it is still holding.

**Do:** Pausing writes to the org's autonomy state, not to the page: the chrome comes back paused after a full reload. A kill switch that forgets when the tab closes would satisfy every visual check and stop nothing (AUT-3 is a hard guardrail).

**You should observe:** After pressing Pause the chrome offers Resume, that state survives a full page reload, and pressing Resume returns the chrome to offering Pause — also across a reload.

<sub>Auto-checked by client/e2e/doorstep.spec.ts · serves AUT-3</sub>

### 8. Day one is the same home, filling in — never a wizard  <sub>US-8</sub>

**As** Maria on her first day, who has bounced off every tool that opened with a setup wizard.

**Do:** The day-one home is a SHAPE of the same screen, not a different one: the same chrome and the same region order, at a different density (DEC-18). No step counter, no progress bar, no checklist of things she owes it (ONB-3, R-10) — Steward asks where to read, in one question she can decline, and talking to it works just as well.

**You should observe:** On day one the chrome and the four regions appear exactly as they do on any other day; nowhere on the page is there a step counter, progress bar or setup checklist; and the one source question can be declined without blocking anything.

<sub>Auto-checked by client/e2e/day-one.spec.ts · serves ONB-1, ONB-3, UX-1</sub>

### 9. The conversation is in the stream, and it is still there later  <sub>US-9</sub>

**As** Maria, who answered a question this morning and comes back after lunch.

**Do:** The interview runs IN the home's conversation region — never a separate page — and it is resumable: the questions Steward asked and the answers she gave are still in the stream after a reload, because they live on a session the home resumes rather than in the page (INTS-2).

**You should observe:** Asking puts Steward's questions in the conversation region as messages, her answer joins them in the same region, and every one of them is still there after a full page reload.

<sub>Auto-checked by client/e2e/day-one.spec.ts · serves INT-2, ONB-3</sub>

### 10. The conversation never shows her an empty box  <sub>US-10</sub>

**As** Maria, blank-page-averse, who has never once known what to type into a chat box.

**Do:** The conversation region leads: it always offers specific things to say, and every one of them states WHY Steward is offering it (CHTS-4/CHTS-5). She mostly answers questions she already knows the answer to, rather than composing from nothing (VAL-6, DS-6).

**You should observe:** The conversation region always shows at least one suggested opening, every opening displays a reason beneath it, and tapping one puts its text in the composer ready to send.

<sub>Auto-checked by client/e2e/conversation.spec.ts · serves CHT-1, UX-2</sub>

### 11. A standing rule is confirmed back before it binds  <sub>US-11</sub>

**As** Maria, telling Steward "never name our donors" in passing.

**Do:** Turning a sentence into a permanent rule is a two-step gate: Steward states what it understood and writes NOTHING, and only her confirmation binds it to Memory (CHTS-2). A misread instruction that bound silently would shape every future draft.

**You should observe:** Choosing to make a sentence a rule shows Steward's interpretation with nothing yet saved; cancelling leaves what Steward knows unchanged; and only after confirming does the rule appear in what Steward knows.

<sub>Auto-checked by client/e2e/conversation.spec.ts · serves CHT-2, MEM-1</sub>

### 12. The week's stack is finite, and she can see the end of it  <sub>US-12</sub>

**As** Maria on a Tuesday morning, with fifteen minutes before her first meeting.

**Do:** Ready states how much is left and roughly how long it will take, and it ENDS — the stream reaches an honest "caught up" rather than scrolling forever (UXS-3). Each card offers exactly one accent verb, so there is never a choice between two things that look equally intended (DS-2).

**You should observe:** The Ready region shows a header naming how many cards are left and an estimate in minutes; each card carries exactly one accent action; and once the spine is empty the home shows the caught-up terminus instead.

<sub>Auto-checked by client/e2e/ready.spec.ts · serves APR-1, UX-3</sub>

### 13. A held card cannot be swept away with the rest  <sub>US-13</sub>

**As** Maria, who has one draft about a distressing local event waiting for her.

**Do:** A GR-3 hold sits in the pinned needs-you zone, not in the clearable spine, and "approve all ready" says up front that it will not touch it — the exclusion is a guarantee stated before the tap, not a surprise discovered after it (APRS-1, DEC-18).

**You should observe:** The held draft appears in the pinned region rather than the Ready spine; the batch-approve control names how many cards will stay behind; and after batch approving, the held card is still there.

<sub>Auto-checked by client/e2e/ready.spec.ts · serves APR-1, AUT-3, DS-4</sub>

### 14. Skipping asks why afterwards, and never makes her answer  <sub>US-14</sub>

**As** Maria skipping a draft that just is not right this week.

**Do:** Skip completes immediately and the card leaves the count; only THEN does Steward ask why, in one tap, dismissible (CHTS-5 — "answering is a gift, never a toll"). Asking first would turn every skip into a small interrogation.

**You should observe:** Skipping removes the card from the spine straight away; the "mind saying why?" prompt appears only after that; and dismissing it leaves the card skipped with nothing else asked.

<sub>Auto-checked by client/e2e/ready.spec.ts · serves APR-1, MEM-1</sub>

### 15. Opening a draft shows every channel, including the ones she is not on  <sub>US-15</sub>

**As** Maria, who wants to read a draft properly before she says yes to it.

**Do:** A card opens into a deep review BESIDE the home (a takeover on the phone), with a tab per channel — and the SKIPPED channels keep their tabs, each stating why (GENS-5). A review that hid the omissions would let a founder approve while believing a post is going somewhere it is not (XH-13).

**You should observe:** Opening a card shows the master text and one tab per channel including the skipped ones; selecting a skipped tab states the specific reason it was skipped; and the schedule lists every channel in plain language, marking the skipped ones rather than omitting them.

<sub>Auto-checked by client/e2e/draft.spec.ts · serves APR-1, UX-1</sub>

### 16. Writing something herself goes through the same checks, not around them  <sub>US-16</sub>

**As** Maria, who wants to say thank you to Saturday's volunteers right now.

**Do:** Compose is an ACTION from the chrome, never a destination, and what it produces is a DRAFT in Ready — the founder's own words take the same adapt → guardrail → fit chain a generated post does (APRS-5: authorship is not a bypass). Closing the sheet half-written parks it rather than throwing it away (XH-14).

**You should observe:** Compose opens over the home rather than navigating away; submitting words produces a draft whose per-channel versions are shown for confirmation before anything ships; and closing a half-written sheet and reopening it brings the words back.

<sub>Auto-checked by client/e2e/compose.spec.ts · serves APR-5, UX-7</sub>

### 17. She can look inside at any time, and nothing ever asks her to  <sub>US-17</sub>

**As** Maria, who wants to check what Steward believes about her before she trusts it with another post.

**Do:** All four glass-wall views — Knowledge, How I write, Plan & Published, Discoveries — open in ONE click from the chrome, plain-labeled, and none of them badges, counts or nudges (VAL-3, UXS-4/5/8). Trust never depends on remembering to ask, and looking is never converted into an obligation.

**You should observe:** Each of the four Look-inside links opens its own view in one click with its plain label as the heading; Knowledge lists what Steward knows and hosts the open-questions list; and no view or link carries a badge, count or unread marker.

<sub>Auto-checked by client/e2e/glasswall.spec.ts · serves UX-4, UX-5, UX-8, DS-4</sub>

### 18. The controls tell her the truth about what I can and cannot do  <sub>US-18</sub>

**As** Maria, whose Facebook connection quietly expired last week.

**Do:** The Controls tray states every channel's real health in plain language and offers the repair — a channel that BROKE is never discovered silently (ONBS-4) — while a channel simply not connected is an invitation, not a problem. The kill switch appears here as a MIRROR of the chrome's Pause, never as the only way to reach it (AUT-3 is one gesture from the chrome at every level). Anything with no working backend is named as absent rather than rendered as a control that forgets what you chose.

**You should observe:** Controls opens from the chrome showing every channel with its own plain-language state and the right repair offered; the kill switch mirror changes with the chrome's Pause and back; and the settings that have no backend are listed as not-yet rather than shown as working controls.

<sub>Auto-checked by client/e2e/controls.spec.ts · serves UX-6, AUT-3, ONB-4</sub>

### 19. The whole loop closes — a draft she approves ends up in the record  <sub>US-19</sub>

**As** Maria on her weekly visit, doing the only two things the product asks of her: approve, and redirect.

**Do:** The founder loop is one pass: the stack says what is waiting, she opens a draft and reads it properly, she approves it, it leaves the stack, and it is in Plan & Published afterwards. Nothing about that arc requires her to go looking for a second screen or to trust that something happened off-stage.

**You should observe:** From the home she opens a draft, approves it, and the card is gone from the Ready spine; the spine's count drops by one; and the approved post appears in the Plan & Published view.

<sub>Auto-checked by client/e2e/full-loop.spec.ts · serves APR-1, PUB-3, UX-3</sub>
