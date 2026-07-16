# Brief: Inbox — the digest stack (UI-7)

**Design Steward's Inbox**, the home screen and the place where 90% of the
founder's non-chat time lives. The founder opens a weekly digest email,
lands here, and must finish reviewing in minutes — the whole product
promises under 15 minutes per week.

## Goal

A finite, calm review stack the founder *finishes* — progress and doneness
are the reward. This is explicitly not a feed: no infinite scroll, no
discovery, a visible end.

## Layout

- Single centered column (~680px) of post cards on canvas white, generous
  vertical rhythm between cards.
- Header: "Your week is ready" (colleague voice) + progress "3 of 5
  reviewed" + a quiet "Approve all" secondary action.
- Each post card (use the design-system post card): org photo 4:3 rounded,
  category chip + target channels, master text, a ReasonLine when
  system-initiated, FitBadge row (fit channels + skipped-with-reason,
  overridable), actions: **Approve** (the accent button), Edit, Skip,
  Redirect… (free-text).
- One card in the stack shown in the awaiting-picture state: written and
  visible, dashed warn-tinted photo slot, "Choose from library" with three
  suggested thumbnails and a reason line.
- Completion state (design it!): when the stack is done — the stewardship
  streak numeral large ("6 · week streak"), "That's everything for this
  week — 5 posts heading out. See you next Tuesday.", plus a reason-line
  preview of what the system does next. Celebration is quiet pride, never
  confetti.

## Content to use

A real-feeling nonprofit (animal shelter or clean-water org): an impact
story, a volunteer-spotlight, an external news item with source citation,
a gratitude post, one awaiting-picture draft.

## Rules that bind

- Batch approve exists but individual Approve stays primary.
- External-content cards always show a source citation.
- Terracotta accent only on Approve and active nav; Inter 500 body; light
  theme; no text over photos; hairlines not shadows for card separation.
