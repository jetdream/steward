# client/e2e/ — the story-validation tier (`@validates`)

**Purpose.** The machine-checkable half of the founder-loop stories in
[`.spec/stories/founder-loop.yaml`](../../.spec/stories/founder-loop.yaml). Each
spec file carries `@validates US-n` markers and asserts the same sentence the
story's `acceptance` states in prose. Founded by `DEC-43`.

**Why this tier exists.** `@verifies` unit tests cover policy; they cannot see
**rendered state** — that focus landed on the right control, that a region is
still keyboard-reachable, that a click hits what it looks like it hits. Those are
exactly the failures that survive a green typecheck, a green lint, and a
mouse-only walkthrough. Two of them (`US-3`, `US-5`) are the precise defects the
ADR-0011 challenger rounds proved a modal pane would cause.

**Hermetic.** Today that holds because this tier boots **Vite only** — there is
no server here that could reach a model. The `STEWARD_LLM=dev-stub` pin in the
config is forward-looking, for when a data-bound story boots `dev:api` (the
DEC-41 tiering extended to the browser; LRN-27). It runs on port **3100**, not
3000, so it never fights a dev server you have open.

| | this tier | `.coder/playwright` |
|---|---|---|
| what | automated regression, own browser | one shared **headed** browser an agent drives over CDP |
| when | CI, and on demand locally (`npm run e2e`) — NOT on pre-push, which stays fast | interactive exploration, agent browser checks |
| proves | a story stays validated | what a surface looks like *right now* |

## Running

```bash
npm run e2e             # both layout modes
npm run e2e:install     # one-time: fetch the browser
npx playwright test -c client/playwright.config.ts --project=desktop --ui
```

## Writing a spec

- **One story, one assertion set.** The file header lists its `@validates US-n`
  markers; an unmarked spec is invisible to the graph, and an uncited story is
  prose pretending to be governance (VAL-6).
- **Assert the observation, not the implementation.** "the pinned button takes
  focus and a click at its centre lands on it" — not "the element lacks an
  `inert` attribute". The story's acceptance sentence is the test's contract.
- **Both layout modes.** Projects are `desktop` (1280) and `phone` (Pixel 7) —
  the only two DEC-19/DEC-20 allow. `test.skip` a mode when a story is genuinely
  mode-specific, and say why; a story that quietly only runs at one width has
  not been validated.
- **No retries.** A test that passes on the second attempt is a flake we want to
  see, not hide.

## Gotchas

- Selectors use stable `data-*` hooks (`data-region`, `data-chrome`,
  `data-look-inside`, `data-card-class`, `data-ds-section`) rather than copy or
  CSS classes — copy is the founder's to change and classes are the design
  system's.
- The shell and DS harnesses are **dev-only routes** (`#shell`, `#ds`), stripped
  from a production build. Specs that target them are testing contracts, not a
  founder surface.
- `dialog[open]` is the summoned pane. Asserting `d.matches(":modal")` is
  **false** is load-bearing, not incidental: a top-layer pane would void every
  per-region `inert` in the shell (LRN-29).
