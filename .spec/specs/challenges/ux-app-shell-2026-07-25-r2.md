---
kind: challenge-record
spec: .spec/specs/ux-app-shell.yaml
round: 2
date: 2026-07-25
verdict: pass
by: cortex:architect-challenger (delta scope — the DEC-42/ADR-0011 cascade edge)
---

# UXS r2 — the ADR-0011 cascade edge

VERDICT: pass

**Delta:** `constrained-by` gained `ADR-0011`. **No UXS item statement changed;
no version bumps.** UXS was regressed to `draft` by the cascade rule (ADR/CLAUDE.md
— a spec citing a new ADR goes red until consciously re-pointed) and is restored
here.

## What was attacked

The challenger read all eight items (UXS-1..8) against ADR-0011's decision —
founder surfaces decline ShadCN and build the summoned pane on a non-modal
surface plus per-region `inert` — asking whether the new constraint contradicts
anything the shell already promises.

**One collision was found, and it was real:** an early draft of ADR-0011 said a
phone takeover "inerts the **whole** home". That would have stranded the AUT-3
kill switch, making **UXS-6**'s acceptance clause — *"the kill switch is always
one gesture from the chrome (AUT-3), not buried in settings"* — unsatisfiable on
the platform UXS-1 designates as the floor.

**It was fixed upstream, not here.** The defect was in the ADR and in DSS-24, not
in anything UXS says: the phone clause now inerts the home's *regions* while the
takeover **carries the persistent chrome**, matching XH-12's "the chrome
persists" (which holds in both modes) and AUTS-3's P0-`hard` guarantee. A
`--z-chrome` token above `--z-pane` keeps the chrome from being occluded rather
than merely non-inert, and the ADR's `@validates` list gained *"the kill switch
is reachable in one gesture while a phone takeover is open"*.

## Verdict basis

With that corrected, the challenger's finding stands: the `constrained-by`
addition is a **genuine no-op for UXS-1..8**. The remaining verification was
mechanical — confirm no `showModal()` survives in the shell's governing
documents (`ARC-2 v2`, `client/CLAUDE.md`), which it does not; `rg -n showModal`
returns only prohibitions and rationale.

Full round-by-round narrative, the four `fail` verdicts that produced these
corrections, and the close-out verification live in the sibling record:
[`ds-design-system-2026-07-25-r2.md`](ds-design-system-2026-07-25-r2.md).

Learning deposited: **LRN-29**.
