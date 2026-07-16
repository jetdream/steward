---
kind: challenge-record
spec: experience/ui.yaml (experience register, founding round)
round: 1
date: 2026-07-16
verdict: pass
by: cortex:architect-challenger (Product-Designer lens)
---

# Product-Designer lens — experience spine founding round (DEC-8)

Convergence rule applied: no blocker; the three should-fixes and six notes
were applied in the same change that records this verdict (approved-undo +
rule-proposal + veto-exclusion states in UI-29, P0 recall in UI-42, DS-5 v2
trust-inventory cascade + DESIGN.md mirror, field-upload failure state in
UI-5, INT-3 arrival in UI-33, TL2 deferral line in UI-16, APR-2 note in
UI-12, deletion affordance in UI-45, PRO-3 card naming in UI-29).

## Verbatim verdict

VERDICT: pass-with-findings (no blocker survives; under the challenge policy this is a pass — the should-fixes are body-level edits plus one DS-5 cascade, all landable in the change that records this verdict)

SPEC: /home/coder/project/.spec/experience/ui.yaml (whole register, founding round; DEC-8)

FINDINGS:

1. [should-fix] No un-approve/recall path exists anywhere in the spine at P0 — the founder's most consequential action is the only irreversible one. UI-29 says "Approving advances to the next pending card"; UI-42/UI-10 are "read-mostly at P0; reschedule/edit-scheduled arrive with CHT-3/P1"; UI-35 is P1; the veto (UI-39) covers only TL1 auto-published items; the only recourse to a spotted typo in an approved-and-scheduled post is the kill switch (UI-40) — a panic tool. Redirects get Undo (UI-34), skips are recoverable, vetoes exist — approve alone has nothing. Survives scrutiny: no requirement forbids an unschedule affordance, and for the guilt-prone low-AI-literacy persona this offends the spirit of VAL-3 ("always revocable") and the UI-34 undo sibling pattern. Offends: VAL-3, sibling coherence with UI-34/UI-39. Fix: add an approved-item recall state (undo toast in UI-29 and/or unschedule affordance in UI-42 at P0) — or record the deferral consciously as a Q-* with the persona risk named.

2. [should-fix] APR-3's defining moment is undesigned though UI-2 serves it (P0). APR-3 is "recurring edit patterns are proposed as Strategy/Memory rules ('You've shortened 4 X posts in a row — set max 200 chars on X as a rule?')" — a system-initiated proposal the founder must see and accept. UI-29 cites APR-3 only for inline-edit acknowledgment; UI-27 for "learning starts here". No flow, screen, or state says where the rule proposal appears (digest card? chat? inline after the Nth edit?) or what accepting/declining looks like. UI-34's confirm-back covers founder-initiated redirects, not this. Survives scrutiny: this is the serves edge's aspirational half — the learning loop's visible payoff, and it lands on the product's core screen. Offends: APR-3 (aspirational serves on UI-2), VAL-3. Fix: add the rule-proposal card as a UI-29 state (or a UI-34 sibling state) with accept/decline/edit semantics.

3. [should-fix] DEC-8's three new trust-chrome elements are invented at screen level while the design-system inventory doesn't own them — the exact violation class GR-7 defines. The provenance line appears independently in UI-7 and UI-8; the skip-reason one-tap control in UI-7/UI-29 (mirrored by veto reasons in UI-39); the veto-window card class ("its own quiet visual register") in UI-7. DS-5 v1 and design/design-system/steward/DESIGN.md list only ReasonLine / FitBadge / TrustLevel / AssumedNote / awaiting-picture — verified by grep; none of the three DEC-8 elements are in the inventory. GR-7: "a screen... inventing its own component... is a governed violation, not a matter of taste." DEC-8 binds GR-7 and UI-7 but never cascaded into DS-5. Offends: GR-7, DS-5 in meaning. Fix: bump DS-5 to v2 (decided-by: DEC-8 — the decision already authorizes these) adding ProvenanceLine, the optional-reason affordance (shared by skip and veto), and the veto-window card class; mirror in DESIGN.md.

4. [note] UI-5/UI-51 hand-wave the failure mode their own framing makes most likely: UI-14 promises "from a phone in the field in under a minute", but the states are "no photos / partial upload / wrong photos" — upload failure and retry over poor connectivity are at best implied by "partial upload". Make failure/retry explicit. (Offline is otherwise absent register-wide; the field-upload flow is the one place it bites.) Not blocking: one body line.

5. [note] INT-3 (P1) is served by UI-3 but has no arrival design: a "periodic curiosity" probe is system-initiated, yet the founder's designed entry points are the four emails (UI-54..57) and weekly digest visits — a probe sitting in an unopened chat surface is dead. State how it reaches the founder (rides the digest? companion badge? its own touchpoint?). Not blocking: P1, one body decision.

6. [note] TL2 (full autopilot, part of AUT-1 P0 which UI-16 serves) appears nowhere: UI-38 covers TL0→TL1, UI-39 covers TL1 life, and nothing says what the digest or offer looks like at TL2, nor how veto cards interact with the "0 of N" count and "approve all ready" batch (they need no action — batch must not touch them, UI-29/UI-7). Consistent with DEC-8's TL1-now decision, but the deferral is silent. Not blocking: record it (a line in UI-16/UI-29 or a Q-*).

7. [note] APR-2's "founder-selected" half has no owning flow: UI-2 covers digest arrival on cadence; the selection lives only as a UI-12 body mention, and UI-16 (UI-12's home journey) doesn't serve APR-2 — coverage rides on UX-6. No "manage settings" task flow exists (UI-16's flows are offer/veto/kill). Defensible for a settings surface; worth one conscious line. Not blocking.

8. [note] BIL-2 says "deletion honored"; UI-45 designs export, refund, and re-subscribe (memory retained) but no data-deletion affordance — the one dignity element missing from cancel-with-dignity. Not blocking: one state line.

9. [note] PRO-3 (served by UI-2) is never mentioned in UI-28..32; it presumably manifests as a proposed impact post arriving as a normal card with a ReasonLine, which the generic mechanic covers — but the "flags asking-without-reporting" framing deserves one body word so the serves edge is visibly real. Not blocking.

What I attacked and why it held:
- Coverage honesty: ran the project lint (`npm run docs:check` — green, 0 errors); the UX-coverage gap list matches the declared consciously-uncovered set exactly (DS-1..7, EXT-1/3/4, GEN-6, MEM-1, PUB-1/2, STR-3/4 — all genuinely backend-only or self-referential; PUB-1's founder-visible sliver is in fact delivered by UI-26/UI-42 bodies). BIL-3/PUB-4 are P2, correctly outside the report.
- Serves edges, journey by journey, against every requirement statement in product/requirements/*.yaml: UI-1 delivers all of ONB-1..6/INT-1..2/STR-2 through UI-21..27; UI-17 delivers all seven of its list; UI-14/15/18/19/20 check out — the only aspirational aspects found are findings 2, 5, 6, 7, 9.
- Nesting: all 26 flows parent journeys, all 15 screens and 4 touchpoints parent flows, legal per pattern.yaml kinds; shared surfaces (UI-6, UI-9, UI-11, UI-12) homed per the layer's primary-flow rule with body cross-links — held.
- Altitude: journeys stay at arc level (no pixel detail), flows at task level, screens at surface level; no smuggled cross-cutting design — GR-7 correctly went to guardrails, tokens to design/. Held.
- Design-system adherence: UI-6/UI-7 accent usage conforms to DS-2 (Approve as the single accent verb); DS-4/DS-3 correctly not restated (single source of truth); UI-54 explicitly adapts tokens for email. Held except finding 3.
- Sibling coherence: skip-reason ↔ veto-reason explicitly mirrored, confirm-back consistent across UI-29/UI-34, nudge/grace tone consistent across UI-31/UI-32/UI-57. Held except finding 1.
- Cited artifacts exist: design/briefs/ui-6..8, design/mockups/ui-7-inbox/round-1..2, design/design-system/steward/tokens.css — verified on disk.

Why the should-fixes don't force fail: none contradicts a guardrail, hard requirement, or DEC-8 itself; each is a bounded body/state edit (1, 2) or a one-item register cascade already authorized by DEC-8 (3). Apply them in the change that records this verdict per the convergence rule; finding 1 alternatively resolves as a recorded Q-* deferral.
