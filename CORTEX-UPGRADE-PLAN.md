# Cortex v0.24 → v0.25 upgrade — execution checklist

**For Claude Code.** Work top to bottom. Do not skip a verification step; several of them
exist because an earlier assumption was tested and turned out wrong.

**Ground rules for this task**
- Work on a dedicated branch. The docs-check gate is a **pre-commit hook** and the tree will
  be red mid-way, so use `git commit --no-verify` while repairing.
- `cortex migrate` is **dry-run by default**. Never pass `--write` until the step says to.
- **Do not guess a `spec:` path.** An unresolvable or variant path silently forks a chain,
  which is the exact defect this epoch's rules exist to catch. Where the target is ambiguous,
  STOP and ask the human — the questions are pre-listed in step 4 and step 5.
- Re-run `cortex migrate` after every batch of repairs. **The manual list is not stable**:
  fixing a `spec:` path makes that record join its real chain, which both closes and opens
  chain holes, and changes the filename `migrate` will derive for it.

---

## 1 — Branch and baseline

- [ ] `git checkout -b chore/cortex-v0.25-migration`
- [ ] `git status` is clean before starting.
- [ ] Record the baseline so you can prove progress:
      `npx github:DiffCo/cortex#v0.24.0 docs-check 2>&1 | tail -3` → expect **0 errors** on
      the current pin. If it is not clean, fix that first; do not migrate a red tree.

## 2 — Bump the pin

- [ ] In `.claude/settings.json`, change the cortex plugin `version`/ref to **`v0.25.0`**.
- [ ] Reinstall / relink the plugin so `dist/` for v0.25.0 is what runs (restart Claude Code
      if the plugin is loaded in-session).
- [ ] `cortex doctor` → confirm it reports the v0.25.0 engine and a `format-version` mismatch
      warning (declared 1, engine 2). That warning is expected and non-blocking.
- [ ] `cortex docs-check 2>&1 | tail -3` → expect **23 errors, all DCX-25**. If the count or
      the rule differs, stop and report; the plan below assumes this shape.

## 3 — See the plan before changing anything

- [ ] `cortex migrate` (no flags — writes nothing).
- [ ] `cortex migrate --json > /tmp/migrate-baseline.json`
- [ ] Confirm: **20 automated** (18 rename, 2 repoint), **22 manual** — 17 `unresolved-spec`,
      3 `chain-hole`, 2 `not-a-record`.

## 4 — Repair the 11 derivable `spec:` paths

These 17 records hold a **prose sentence** where a register path belongs. Eleven have a
target that exists in the tree; set `spec:` to the repo-relative path of the real register.
`migrate` will rename the files afterwards — do not rename them yourself.

- [ ] `architecture-2026-07-18-r1.md` → `.spec/architecture/overview.yaml`
- [ ] `goals-2026-07-18-r1.md`, `-r2.md`, `-r3.md` → `.spec/product/goals.yaml`
      *(note: `product/`, not `.spec/goals.yaml`)*
- [ ] `experience-ui-2026-07-16-r1.md`, `-r2.md`, `-r3.md` → `.spec/experience/ui.yaml`
- [ ] `experience-admin-2026-07-21-r2.md` → `.spec/experience/admin.yaml`
- [ ] `mem-org-memory-2026-07-19-r1.md`, `-r2.md`, `-r3.md` → `.spec/specs/mem-org-memory.yaml`

Verify each target exists before editing: `test -f <path> && echo ok`.

- [ ] `cortex migrate --json` → `unresolved-spec` should drop **17 → 6**.
- [ ] `git commit --no-verify -m "cortex v0.25: repoint 11 challenge records at their real registers"`

## 5 — The 6 that need a human answer — **STOP AND ASK**

These name a register that is **not in the tree under that name**. Do not guess. Ask the
human these two questions verbatim and wait:

> **Q1.** Three records (`experience-spine-2026-07-19-r1.md`, `-r2.md`,
> `experience-split-2026-07-20-r1.md`) name `experience/spine.yaml`, which your `DEC-18`
> replaced with the split experience registers. Which register should each point at?
>
> **Q2.** Three records (`job-runner-2026-07-26-r1.md`, `-r4.md`, `-r6.md`) name
> `specs/job-runner.yaml`, which does not exist. Was it renamed, folded into another spec, or
> removed — and where should these records point?

A record may name **any** recognized YAML register — a spec, but also goals, values,
guardrails, vision, an experience or architecture register, stories or requirements. It may
**not** name the registry or a markdown file such as an ADR.

- [ ] Apply the answers.
- [ ] `cortex migrate --json` → `unresolved-spec` should be **0**.
- [ ] `git commit --no-verify -m "cortex v0.25: repoint the relocated-register challenge records"`

## 6 — The 2 files that are not challenge records

`deployment-2026-07-22-r1.md` and `-r2.md` do not parse as `kind: challenge-record`. Every
`.md` under `.spec/specs/challenges/` (except `CLAUDE.md` and `TEMPLATE.md`) must. Also check
for a leading blank line, CRLF endings or a byte-order mark, any of which cause this.

Pick one, per file:
- [ ] give it proper `kind: challenge-record` frontmatter (`kind`, `spec`, `round`, `date`,
      `verdict`, `by`), **or**
- [ ] move it out of `challenges/` if it was never a challenge record.
- [ ] `cortex migrate --json` → `not-a-record` should be **0**.
- [ ] `git commit --no-verify -m "cortex v0.25: resolve non-record files under challenges/"`

## 7 — Re-run, then the chain holes — **ASK BEFORE CHOOSING**

**Re-run first.** The hole list changes now that records have joined their real chains.

- [ ] `cortex migrate --json` → note the CURRENT `chain-hole` and any `duplicate-round`
      entries. The set will differ from step 3's; use the new one.

For each hole, present the human with the spec, the rounds that exist, the gap, and the two
options, then wait:

> A record exists at round N but there is none at round 1..N-1. Either a verdict was issued
> and never written down — in which case **write the missing record** — or the numbering was
> wrong, in which case **renumber the chain** to be contiguous from 1. Cortex will not choose:
> a round is a frozen witness.

Rules while doing this:
- **Never edit an existing record's body.** They are append-only frozen witnesses.
- Renumbering means changing `round:` in frontmatter. `migrate` renames the file afterwards.
- Rounds must be contiguous from 1 and a round may not be dated before its predecessor.

- [ ] `cortex migrate --json` → `manual` should be **empty**.
- [ ] `git commit --no-verify -m "cortex v0.25: close challenge-chain holes"`

## 8 — Apply the migration

- [ ] `cortex migrate` one last time and read the plan. It should be all automated, including
      `set format-version: 2`.
- [ ] `cortex migrate --write`
- [ ] Confirm the output does **not** print a `BY HAND` section, and does **not** say
      "format-version NOT set".
- [ ] `rg 'format-version' .spec/registry.yaml` → **2**
- [ ] `cortex docs-check` → **0 errors, 0 warnings**
- [ ] Run the project's own test suite; it should be untouched by this work.
- [ ] `git commit -m "cortex v0.25: migrate .spec to format-version 2"` — **no `--no-verify`
      this time**. If the gate blocks, the tree is not actually green; do not bypass it.

## 9 — Verify the release you pinned

- [ ] `cortex doctor` → engine v0.25.0, no format mismatch, no stale index.
- [ ] `cortex graph status` on two or three specs → states look right.
- [ ] `cortex graph pack <a spec ID>` → carried findings appear for spec-keyed chains.

**Known limit — do not treat as a bug:** a chain keyed on a **non-spec** register (goals,
experience, architecture, stories) is legal but `graph pack` does **not** surface its carried
findings yet. For those chains, carry findings forward by hand.

## 10 — Open the PR / merge

- [ ] Summarise: records repointed, holes closed and how, `format-version: 2`, docs-check
      green, project tests unchanged.
- [ ] Note explicitly what a human decided in steps 5 and 7, so it is on the record.

---

## After the migration — continuing the work

Read `CORTEX-UPGRADE.md` for the honest accounting of what this release fixed. The parts that
change how you should work from here:

**Use the new challenge loop.** `/cortex:challenge` fans out the mandated panel and writes the
record itself — do not hand-transcribe verdicts (that is where this project's chain broke).
Findings are now **state**: `{severity, status, summary, caused-by}` keyed by finding id.
Carry every high forward until it is disposed. After **three consecutive fails**, the next
step is a **scope review**, not another round: tabulate which region each high landed in, and
if they cluster, split or defer that region.

**The reachability tier is opt-in and it ships dormant.** To use it, declare `fixture-paths`
and `entrypoint-paths` in `.spec/registry.yaml` and put `reach: required` on elements whose
claim is that a user can actually get there. Then:

> **Detection is import-based and ONE LEVEL DEEP.** A fixture reached through a shared helper
> module is invisible. A test that drives the app by spawning a binary imports no entrypoint
> and will be falsely de-rated. **A green tier is not evidence of reachability.**

The real control is the challenger's REACHABILITY angle: *is there a sequence of real user
actions or scheduled work that reaches this behaviour, and does any element own INVOKING it?*
A capability is not covered by the elements that CAN perform it if no element is accountable
for invoking it. Ask that question by hand.

**Still missing, and it is the gap most likely to bite this project again:** acceptance
clauses are not addressable, so a fix can land in a `statement:` while the criterion beneath
it still asserts the opposite. That cost this project four rounds. It is open as `Q-12` in
Cortex and needs the maintainer's decision. Until then, when a finding's fix touches a
`statement:`, **manually confirm the acceptance criterion changed too** — every time.

**Also still missing:** nothing enforces that a story precedes the code it validates. If you
add stories per increment, they can only ever confirm what was built. Write the story first.
