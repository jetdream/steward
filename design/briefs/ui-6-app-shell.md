# Brief: App shell (UI-6)

**Design the application shell for Steward** — an AI communications manager
for small US nonprofits. The founder using it is a mission expert, not a
marketer: time-poor, low AI literacy, allergic to dashboards. The product
behaves like a trusted colleague who brings finished work; the founder's
whole job is two verbs — approve and redirect.

## Goal

A calm navigation frame that gets the founder to their weekly approval in
one glance, keeps "just talk to it" one gesture away everywhere, and never
looks like marketing software.

## Layout — desktop (1280px content cap)

- Quiet left rail: wordmark "Steward" in ink (never accent), then six
  destinations — **Inbox** (home, with a count chip when items wait),
  **Calendar**, **Chat**, **Radar**, **Organization**, **Settings** — plus a
  **Compose** action button (secondary style, it is an action, not a place).
  **Radar** (UX-8) NEVER carries a badge or count — it is a pull-only reading
  surface; the Inbox count chip is the only nav chip.
- Active nav item marked with the terracotta accent — the only accent in
  the chrome; one accent element beyond it per viewport max (the current
  screen's primary action).
- Top chrome (near the account menu): a single **activity affordance** that
  opens the Activity & Notifications center (UI-67). It is NOT a nav item and
  stays silent by default — it shows a count ONLY when something needs the
  founder (a publish failure, a channel needing re-auth). This is the one
  place the shell may raise an actionable count beyond the Inbox chip.
- Docked chat companion: a summonable right-side panel (three-layer
  elevation) present on every surface — the same conversation as the full
  Chat page, narrower. Collapsed state: a quiet pill with the colleague
  avatar "S", never a floating support-widget bubble.
- Content area: canvas white, generous section rhythm, hairline separation
  only.

## Layout — mobile

Bottom tab bar (five destinations, ≥44px targets); Compose as a prominent
action within Inbox/Calendar; chat companion as a slide-up sheet.

## Content to show in the mockup

Inbox selected as home with "3 of 5 reviewed" progress visible; a chat
companion opened showing one colleague message with a reason line; the
count chip on Inbox.

## Rules that bind

- Voice: first-person colleague ("I drafted next week's posts"), every
  system-initiated element carries a one-line reason.
- No empty states anywhere — zero-states narrate what the system is doing.
- Single terracotta accent `#B5502E`; grayscale ink ramp for everything
  else; Inter, body weight 500; light theme only.
- Use the design-system components (post card, approve panel, ReasonLine,
  FitBadge) as-is from the attached design system.
