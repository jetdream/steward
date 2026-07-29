---
kind: challenge-record
spec: .spec/stories/founder-loop.yaml
round: 1
date: 2026-07-25
verdict: pass
by: cortex:architect-challenger (OVER-STRUCTURE lens — a new register kind + ID prefix)
---

# Founding the `US` stories register — r1

VERDICT: pass

— at r1-fixed. The round returned **fail**; all ten findings were applied and the
two structural highs re-verified below. The structure itself was attacked and
**held**; every finding was about wiring and honesty, not about whether the
register should exist.

## What the challenger tried to kill, and could not

- **Do the five IDs earn their keep (VAL-6)?** Yes. All are cited, and it
  confirmed the markers are genuinely *seen* — `registry.yaml` `code-paths`
  includes `client`, and `cortex graph pack US-3` resolves the evidence site.
  None is redundant; none is pure policy that `@verifies` should own.
- **Is the kind ceremony?** No — `stories` is **engine-native**, not invented:
  docs-check enforces the register-level `serves`, per-item `persona` +
  `acceptance`, and `serves → requirements`.
- **Is there a cheaper conforming alternative?** It built one — mark the same
  Playwright tests `@verifies UXS-*` and skip the register — then discarded it:
  that conflates unit-verified policy with browser-validated rendered state,
  cannot host a persona + a human-observable acceptance, and stories attach to
  *requirements*, so one story may span several spec-elements.

## Findings applied

| # | Sev | Finding | Fix |
|---|---|---|---|
| 1 | **high** | The layer was unrouted from every mandatory-read entry point, so "stories accumulate as the UI is built" had no carrier — within two increments the register would be five stale items | `stories` added to `.spec/CLAUDE.md`'s layer table, mermaid and folder map; **new SDLC Phase B step 2b** makes the story+`@validates` a same-commit obligation; `client/CLAUDE.md` gained a Structure table listing `e2e/` |
| 2 | med | "MANUAL-EVAL.md is rendered FROM these items" was present-tense fiction with no mechanism | **Wrote the renderer.** `scripts/render-manual-eval.mjs` generates it from the register; `manual-eval:check` is now part of `npm run gate`, so a stale file fails the build |
| 3 | med | Three acceptance clauses were unasserted — **proven by mutation** (stream `opacity: 0`, column at 120px, a dot on every link: all stayed green) | Assert the column against `--home-measure`, bound stream opacity `0 < x < 1`, assert no element inside a Look-inside link; markers moved onto their own `test` blocks |
| 4 | med | No `forbidOnly` — a stray `.only` made CI green with 4 of 5 stories unrun | `forbidOnly: !!process.env.CI` |
| 5 | med | CI trace upload pointed at `test-results/`, but `outputDir` is relative to the **config** — traces silently lost on failure | `path: client/test-results/` |
| 6 | low | Playwright output not gitignored | added `client/test-results/`, `client/playwright-report/` |
| 7 | low | `client/e2e/CLAUDE.md` claimed "every push + CI"; pre-push does not run e2e | corrected to "CI, and on demand locally" |
| 8 | low | Roll-up polarity inverted — stories *gate*, they do not *enable* | reworded in the router: stories are opt-in; present ones gate `satisfied`; adding one only tightens |
| 9 | low | Hermeticity credited to `STEWARD_LLM=dev-stub`, but the flag reaches only Vite — the tier is hermetic because it boots no backend | reworded as forward-looking, for when a story boots `dev:api` |
| 10 | low | Loose `serves` edges; `DS-4` (P0 hard a11y) had no story despite being the archetype | US-3 → `[UX-3, APR-1, DS-4]`, US-4 → `[UX-1, DS-4]` |

## Re-verified at close

- **The mutation test now bites.** Re-applying the challenger's three exact
  mutations turns the suite **red** (3 failed) where it previously passed green.
- **`forbidOnly` fires**: `.only` under `CI=true` now errors instead of narrowing
  the run.
- `npm run e2e`: 7 passed, 1 skipped (summon-beside is desktop-only, declared).
- `npm run gate` green including the new `manual-eval:check`; docs-check 584 IDs,
  0 errors; `npm test` 151 pass.

Learning deposited: **LRN-30**.
