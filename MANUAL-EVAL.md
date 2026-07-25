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
