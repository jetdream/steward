---
kind: challenge-record
spec: experience/spine.yaml (EXP-32/43/44 v2) + ext-external-radar.yaml (EXT-5 v2) — the DEC-20 delta
round: 2
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (Product-Designer + requirement-consistency + cascade lenses)
---

# Product-Designer lens — DEC-20 delta (round r2)

Delta-scoped challenge of the founder's design round-2 refinements: true
breakpoints, the informative/interactive calendar (in-pane item open,
multi-post days, times), and Discoveries as a read-first triage feed.
Convergence rule applied: the must-fix and every should-fix were resolved
in the change recording this verdict.

Fixes applied in this change:
- (must-fix) Three approved architecture docs still specified the abolished
  relevant/not-relevant model: DM-8 → v2 (three dispositions, the SAVED POOL
  the planner queries, event date + time-sensitive/passed semantics), ARC-25
  and PIPE-1 rewordings — all citing DEC-20.
- (should-fix) GEN-1 → v3: the External row names the SAVED POOL reserve
  (thin-week fill, fresh-over-stale, never a passed event-tied save, the
  ReasonLine save-credit) + depends gains EXT-5; GEN-1 added to DEC-20
  binds; GEN-1@3 re-pinned in all goal coverage lists.
- (should-fix) Saved-pool aging: EXP-32 gains the stale/passed state (an
  event-tied save annotates as PASSED at its date, never auto-drafted into
  irrelevance; planner prefers fresh, names the age); EXP-44's shelf wears
  the PASSED annotation.
- (should-fix) Focus contract for the one-level pane swap recorded in
  DESIGN.md (focus to swapped heading, back announced; focus returns to the
  invoking row on back).
- (should-fix) Layout modes restated: exactly TWO (phone takeover / desktop
  summon-beside); every width resolves to one at the new
  `--breakpoint-desktop` token (tokens.css, 900px); mockups render only at
  real device widths.
- (should-fix) Cascade completed: walkthrough's "reading room" framing and
  "wander discoveries" rewritten; EXP-6 body renamed to "read the
  discoveries"; glossary gains the "Saved pool" entry.
- (should-fix) GR-7 composition declarations added (no new DS classes): the
  time-sensitive badge is a FitBadge-class chip carrying the event date;
  the type chip reuses the category-chip treatment; the SAVED shelf is a
  warm-tier group of composed rows.
- (notes taken) "ceiling" wording harmonized to "typical, not a cap
  (DEC-20)" across spine intent P4, the vision-experience map, and the
  walkthrough; EXP-44 states the dispositions sit ON the collapsed card
  (a headline-obvious "not for us" never costs an expand, R-10); the SAVED
  shelf appears with the first save (no empty shelf); desktop day-cell
  overflow left to design (any reasonable treatment).

## Verbatim verdict

VERDICT: PASS-WITH-FINDINGS — one must-fix, mechanical and decision-free
(every decision it needs is already recorded in DEC-20), to be applied in
the same change that records this verdict per the convergence rule and the
r1 precedent. If it is not applied in-change, this converts to FAIL and the
delta must not commit as-is.

FINDINGS (summary; all applied above):
- [must-fix] DM-8 / ARC-25 / PIPE-1 still mandated the superseded
  relevant/not-relevant disposition model — the r1 defect class (a
  governing artifact specifying the abolished design), silent because no
  review assertion pins EXT-5 there.
- [should-fix] GEN-1 didn't know about its new supply (the saved pool) —
  planner behavior hidden in a foreign register's prose.
- [should-fix] The saved pool had no aging semantics — the stale/passed
  event-tied save was the one state family the rework needed and didn't
  draw (a reasonable planner would draft last month's event into a thin
  week — visibly wrong, trust-eroding).
- [should-fix] The one-level in-pane swap had no focus contract.
- [should-fix] The TRUE-breakpoints rule over-generalized DEC-20 to live
  surfaces and left the phone↔desktop boundary unnamed.
- [should-fix] Cascade misses: walkthrough "reading room", EXP-6 "wander",
  no glossary entry for the saved pool.
- [should-fix] GR-7: time-sensitive badge / type chip / SAVED shelf
  resolved from nothing (fixed as declared compositions; the ArticleLink
  precedent showed a DS-5 bump as the alternative).
- [notes] ceiling-vs-typical wording; collapsed-card dispositions;
  shelf zero-state; day-cell overflow (left to design).

WHAT WAS ATTACKED AND HELD:
- Pull-only under triage pressure: no badge/count/nudge enters the chrome;
  EXP-44 keeps "no progress, no counts, no completion state"; the shelf is
  uncounted; the time-sensitive badge is decision context inside an item
  the founder chose to read, never a summons; G-3 browse-time exclusion
  retained verbatim.
- "The founder disposes" + pipeline discipline: "worth a post" and planner
  pickups route through Ready (never publish directly), citation-first
  (EXT-2/GR-5), permanent EXT-3 heads-up cap, GR-3 holds; the save-credit
  ReasonLine keeps provenance visible. UX-8 v2 needs no touch.
- DEC-18 finiteness vs "typical, not a cap": coherent — calendar density is
  not Ready load (packages approve once; event items arrive quietly).
- Flow-achieves-requirement: EXP-32 v2 delivers every clause of EXT-5 v2;
  EXP-43 v2 delivers GEN-1/PUB-3/UX-4 with the DEC-19 pane model intact.
- Pin/provenance hygiene mutation-proven on a sandbox copy (dirty-debt and
  DCX-16 teeth fire as designed); the delta's re-pins and provenance were
  correct and complete.
- Live gate on the real tree: docs-check green (357 IDs, 0 errors).
