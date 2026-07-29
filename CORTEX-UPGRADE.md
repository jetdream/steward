# Upgrading to Cortex v0.25.0 — what you need to know before starting

Cortex `v0.25.0` is released and pushed (tag `v0.25.0`). This release **breaks** the `.spec`
format: the epoch moves **v1 → v2**, and this project is on v1.

Read this page once. Then hand `CORTEX-UPGRADE-PLAN.md` to Claude Code — that file is the
checklist, written for the agent. This one is written for you, and its job is to tell you
what will surprise you and which decisions only you can make.

---

## The one thing that will surprise you

**The docs-check gate is a pre-commit hook.** The epoch's new lint rules are *ordinary lint
rules* — they are **not** gated on the `format-version` you declare. So the moment the pin
is bumped, they apply to your existing 62 challenge records, `docs-check` goes red, and
**you cannot commit anything** until the tree is repaired.

That is deliberate (the version check is non-blocking; the rules are not), but it means:

> **Do the upgrade as its own piece of work on its own branch. Do not start it in the middle
> of a feature.** If you must commit while it is in progress, `git commit --no-verify`.

## What the upgrade actually costs

Measured against your tree, not estimated — `cortex migrate` reports **20 automated** steps
and **22 that need a human**:

| What | How many | Who can do it |
|---|---|---|
| Renames + pointer repoints | 20 | **automatic** — `migrate --write` does these losslessly |
| `spec:` holds prose; the real register exists | **11** | Claude Code can derive these |
| `spec:` names a register that **no longer exists** | **6** | **you** — see below |
| Two rounds recorded with no round 1 | **3** | **you** — a judgment call |
| Files under `challenges/` that aren't records | **2** | either — add frontmatter or move them out |

A full rehearsal in a throwaway copy confirmed the sequence **terminates**: after those
repairs the plan comes out clean and `migrate` sets `format-version: 2`. This is not an
open-ended excavation.

## The six that need you, and why

Six records name a spec that is not in the tree under that name. Nobody but you knows where
those went:

- **3 records** for `experience/spine.yaml` (two `experience-spine-*`, one `experience-split-*`).
  Your own `DEC-18` replaced that register with the split experience files. Which of the
  surviving registers should each record point at — or is the right answer that they point at
  whichever register superseded the content they challenged?
- **3 records** for `specs/job-runner.yaml`. There is no such file. Renamed? Folded into
  another spec? Removed?

Claude Code will stop and ask rather than guess, because guessing here silently forks a
chain — which is exactly the failure the epoch's new rules exist to catch.

## The three chain holes

Three specs have a record at round 2, 4 or 6 with no round 1. Cortex will not invent the
missing record and will not renumber for you: a round is a frozen witness, and only you know
whether a verdict was issued and never written down, or whether the numbering was simply
wrong.

For each you choose: **write the missing record**, or **renumber the chain** to close the gap.

**One thing to know about sequencing:** the hole list *changes* once the `spec:` paths are
fixed, because records currently attached to no chain join their real one. Fix the paths
first, re-run `migrate`, and only then decide the holes. (I assumed these were independent
and was wrong — testing showed one hole closed and a different one opened.)

## What this release gives you in return

This release exists because of the change brief this project filed. Honest accounting:

**Fixed (the convergence half — the one that cost you ~1.16M tokens over seven rounds):**
a severity rubric, a three-fails stopping rule with a cluster diagnostic, findings as
structured state with a `caused-by` rebound edge, chain integrity (uniqueness, continuity,
monotonicity, enforced filenames), carried findings reaching the next challenger through
`graph pack`, and a `/cortex:challenge` skill that actually fans out the panel and writes
the record.

**Partially fixed (the evidence-integrity half):** the reachability tier ships, but as an
**opt-in de-rate, not the hard error the brief asked for**, and it **ships dormant** — you
must declare `fixture-paths` / `entrypoint-paths` and `reach: required` to get anything from
it. Its detection is import-based and **one level deep**: a fixture reached through a shared
helper module is invisible, and a test that drives your app by spawning a binary imports no
entrypoint at all. **A green reachability tier is not evidence of reachability.** The
challenger's REACHABILITY lens is the real control.

**Not built:** addressable acceptance clauses (brief change 5). That was the fix for "a fix
lands in a `statement:` while the criterion beneath it still says the opposite" — the defect
that cost you four rounds and returned three times through the same clause. It is an open
question (`Q-12`) awaiting your decision. **If you only ask for one more thing from Cortex,
ask for this.**

Also not built: the story-ordering rule ("a story precedes the code it validates"), which
was the fix for the two stories that passed while being false for every real user.

## Two limits you will meet

- A challenge chain keyed on a **non-spec register** (goals, experience, architecture,
  stories) is now legal — but `graph pack` does not yet surface its carried findings. For
  those chains, carry findings forward by hand.
- The chain-head tooth is spec-only by design. A goals register does not acquire a design
  gate by becoming challengeable.

## Rollback

Nothing here is irreversible. The upgrade happens on a branch; if you want out, delete the
branch — your `.spec` is untouched on `main` and the old pin still works. `migrate` never
rewrites a record's body and never back-fills findings.

---

## Your decisions, collected

1. **The 6 relocated specs** — where does each of those records point?
2. **The 3 chain holes** — write the missing record, or renumber?
3. **The 2 non-records** — add frontmatter, or move them out of `challenges/`?
4. **`Q-12`** (optional, later) — do you want addressable acceptance clauses built?

Everything else Claude Code can do from `CORTEX-UPGRADE-PLAN.md`.
