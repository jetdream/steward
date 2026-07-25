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
