# stories/ — User Stories (the `@validates` targets)

The founder-facing things a person will actually **do**, each with what they
should observe. Founded by [DEC-43](../product/decisions.yaml) to activate the
third marker channel, which had no legal target in this project:

| Marker | Lives on | Backs |
|---|---|---|
| `@implements <SPX>` | implementation code | a spec-element's realization |
| `@verifies <SPX>` | a unit / integration test | its verification |
| **`@validates <US>`** | **an e2e / UX test** | **a story's validation**. Stories are OPT-IN: a requirement with none is unconstrained by them; ones that exist **gate** its `satisfied`. Adding a story only ever tightens the roll-up — it never loosens it. |

A marker citing the wrong layer, or an unknown ID, is a hard error.

## The one rule that makes this register worth having

**It is the normative form of the manual-evaluation walkthrough.**
`MANUAL-EVAL.md` is *rendered from* these items, never maintained beside them —
so the script a human follows and the script a machine runs cannot drift. Each
story's `acceptance` is one sentence that is true or false by observation; its
e2e spec in `client/e2e/` carries `@validates US-n` and asserts that same
sentence.

## What belongs here

**Rendered-state facts a unit test cannot see** — focus landed where it should,
a region is still reachable, a control is one gesture away, a card is visually
distinguishable from its inverse. These are exactly the failures that stay
invisible to typecheck, lint, and a mouse-only walkthrough.

**What does not:** pure policy (a `@verifies` unit test owns that) and visual
taste (the human's call at the end of the phase).

## Shape

Register: `kind: stories`, a register-level `serves:` list. Items: `persona`
(who), `title`, `statement` (what they do), `acceptance` (what they observe),
and `serves:` → **requirements** (stories serve requirements the way
requirements serve goals). The item's own assertion field is `validation`.

## Discipline (VAL-6)

A story earns its ID only if an e2e spec cites it — an uncited `US-*` is prose
pretending to be governance. Stories **accumulate as the UI is built**: an
increment that ships a founder-visible flow adds its story in the same commit,
rather than the walkthrough being reconstructed from memory at the end.

| File | Domain |
|---|---|
| [founder-loop.yaml](founder-loop.yaml) | The founder UI loop — shell, onboarding, conversation, Ready, compose, glass wall, controls |
