---
kind: challenge-record
spec: .spec/specs/ux-app-shell.yaml
round: 1
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (single pass — design-conformance + product-designer + implementation-divergence/hidden-assumptions + cross-cutting reconciliation lenses)
---

VERDICT: pass
SPEC: .spec/specs/ux-app-shell.yaml

FINDINGS:

- [medium] UXS-4, UXS-8, and the design section cite FLOWS as "screen": "screen
  EXP-31" (UXS-4), "screen EXP-32" (UXS-8), and "glass-wall screens ...
  Calendar/Published (EXP-31), Discoveries (EXP-32)" (design §). EXP-31 and EXP-32
  are FLOWS (kind: flow, parent EXP-6); the actual screens are EXP-43 (Screen:
  Plan & Published) and EXP-44 (Screen: Discoveries). The correct screens are
  never cited anywhere in the spec. — Survives scrutiny: this is the LRN-22
  wrong-element class the lint cannot see (both IDs resolve, so docs-check exits 0
  clean); it parallels the correct "screen EXP-41 / screen EXP-42" citations, so
  the author intended the screen and grabbed the flow ID. The spec's whole design
  section defers the pixel layer to "a method/ui.md pass on the approved spine +
  design system," so a wrong screen pointer misroutes that deferred pass to a flow
  that carries NO layout and drops the DEC-20 screen-level constraints those two
  most design-heavy views hold (EXP-43 v2: informative/interactive four-week grid,
  content hints, phone agenda list, in-pane recall/reschedule/unpublish; EXP-44
  v2: read-first triage, dispositions-on-collapsed-card, the SAVED shelf). —
  Fix (one-line, three sites): EXP-31 -> EXP-43 and EXP-32 -> EXP-44 in the design
  section and in the UXS-4 / UXS-8 statements. (Attempted in-session; the
  write-guard classifier blocked the edit — apply before flipping to approved.)

WHY THE MEDIUM DOES NOT BLOCK: it is a non-semantic citation correction (three ID
swaps to already-approved screens), not a behavior contradiction; the governing
journey EXP-6 is correctly in constrained-by, so the glass-wall meaning is grounded
regardless. Per the specs/CLAUDE.md convergence rule (no surviving high + only a
one-line-fix medium) this is a pass with the fix applied in the same change.

WHAT WAS ATTACKED AND HELD:

- design-conformance: constrained-by [ADR-0001/0002/0003, EXP-1/2/3/5/6/7/38] all
  resolve, all accepted/approved; the journeys cover every UX-1..8 serving journey
  (EXP-2->UX-1/3, EXP-3->UX-2, EXP-5->UX-6, EXP-6->UX-4/5/8, EXP-7->UX-7) plus the
  day-one shape (EXP-1) and the home screen (EXP-38). ADR-0003 (ports & adapters,
  accepted) supports @client + responsive-web + no-native; DEC-19 (binds UX-1,
  EXP-38, EXP-39) supports the mobile-first-floor + desktop-summon-beside claim in
  UXS-1. VAL-3/5/6 usages match their definitions (nothing hidden / colleague /
  system-moves-first-no-empty-state).
- GR-7 governed-by: correct — UX is a UI spec; GR-7 states "UI specs cite this
  guardrail via governed-by," and the spec explicitly asserts it invents no
  component/color/spacing/type role and defers pixels to method/ui.md (conforms,
  does not violate).
- product-designer / One-Home invariants: the four invariants (region order never
  changes; holds pin/never batch-cleared; stream always reaches caught-up; glass
  wall one-click/pull-only/never-chat-gated) are genuinely structural/routing and
  testable, and the spec honestly (LRN-20) fences them off from the LLM
  conversational content owned by CHTS/INTS. state-completeness is grounded in the
  approved screens' own state enumerations (EXP-38/43/44 carry empty/held/failure/
  quiet states); the shell defers pixel states correctly.
- cross-cutting reconciliation (LRN-19/22), verified against live text:
  (a) UXS-3 "holds pin, never batch-cleared" reconciles with APRS-1's
  deterministic batch-approve exclusion (held/sensitive/veto/awaiting-picture) and
  EXP-38 region-1 — cross-referenced, no clean double-ownership (shell owns the
  immovable pinned region; APR owns the batch filter).
  (b) UXS-2 hosts the CHTS/INTS conversation; surface/behavior split is clean (UX
  owns "no separate chat page / it is the medium," CHT owns the conversation).
  (c) UXS-7 owns Compose's action-placement in the chrome and launches the APRS-5
  composer flow; APR owns the flow. Clean, cites the owner.
  (d) UXS-5/6 requirement refs resolve and priorities check: MEM-3 (browser) is
  P1, INT-4 is P1, UX-8/Discoveries P1 — all framed correctly; citing requirement
  IDs (MEM-3, INT-4, AUT-1, BIL-1, EXT-5) matches house style (CHTS cites INT-4
  the same way; AUT/BIL/EXT specs are not yet written).
  (e) "shell owns no business logic, all backend calls via domain-specific API
  hooks" matches the client contract in /CLAUDE.md.
- acceptance testability: every UXS-1..8 acceptance clause can fail (route checks,
  one-click/one-handed reachability, no-badge/no-nudge, versioned edits,
  kill-switch-in-chrome). No un-failable "never" absolutes smuggled in.
- design-scope: cross-cutting is honest (the shell touches every capability's
  surface) — not a false design-scope: local claim.
- lint: `cortex-docs-check` exits 0 (clean graph) with and without the mis-citation
  — confirming the finding is judgment-only, not lint-visible.
