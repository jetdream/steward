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

- Quiet left rail: wordmark "Steward" in ink (never accent), then five
  destinations — **Inbox** (home, with a count chip when items wait),
  **Calendar**, **Chat**, **Organization**, **Settings** — plus a
  **Compose** action button (secondary style, it is an action, not a place).
- Active nav item marked with the terracotta accent — the only accent in
  the chrome; one accent element beyond it per viewport max (the current
  screen's primary action).
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
