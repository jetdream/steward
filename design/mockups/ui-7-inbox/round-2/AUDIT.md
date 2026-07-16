# Design audit — UI-7 inbox, round 2

Delta audit against the round-2 prompt (14 items) plus a graph re-check.
Both files read in full.

## Verdict

**All 14 round-2 items landed; the screen is stabilization-ready** pending
the two open product calls (draft provenance, skip-with-reason) and the
journey-map pass. Notable quality beyond the ask:

- The interactive frame now plays the whole journey entry → done: approve
  advances the viewport to the next pending card (reduced-motion
  respected), header copy adapts ("One post still needs you — you can
  change anything until it goes out"), and "Approve all **ready**" is
  honest about excluding the photo-blocked draft.
- Inline Edit with the colleague acknowledgment ("Got it — updated. I'll
  keep this in mind for next drafts") and the Redirect confirm-back
  ("Understood: keep adoption posts under 3 sentences… saved to your
  strategy." + Undo) — both APR-3/CHT-2-faithful.
- Per-card variant affordances adapt to channel count ("See the Facebook
  version" / "See all three versions") — resolves round-1 A5.
- Mobile componentized (`Steward Inbox Phone.dc.html`, imported with
  props); `streakWeeks<=1` renders "Your first full week" with no dots.
- Sentence case throughout; token type scale throughout; the chat pill
  uses `var(--elev-raised)`; interactive elements carry ≥44px min-heights;
  the bottom-left block is now founder-name-first (account menu, A7).

## Remaining nits (carry to the next round or implementation)

- Placeholder avatar hex `#c7b8a4` (content stand-in — acceptable, same
  convention as photo placeholders).
- The five posts all render as full-height cards; a 5-item week is ~5
  viewport-heights of scrolling. Fine at this cadence; if cadence "daily"
  produces longer digests, a condensed-card variant may be needed —
  journey-map question, not a screen bug.
- The round-1 "Reviewed this week" settled *section* was replaced by
  settle-in-place + a header note; simpler and acceptable.

## Graph re-check

No guardrail violations; GR-5 citation upgraded (source card + link on the
external item). Bucket C: still empty.
