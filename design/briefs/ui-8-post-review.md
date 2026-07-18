# Brief: Post review / detail (UI-8)

**Design the single-draft review screen** — where a founder opens one draft
from the Inbox to inspect per-channel variants, fix the picture, or edit,
then approves.

## Goal

Full confidence in one glance: what will go out, where, when, and why —
with the approve action always in reach.

## Layout — desktop (2-column, the substrate's detail-page geometry)

- Main column (~58%): the org photo large (rounded 20px), master text,
  then per-channel variant tabs (Facebook / Instagram / Threads / X) —
  each tab shows that channel's adapted text with its technical fit
  (length, image crop). Inline edit affordance per variant and on the
  master. Below: the ReasonLine for why this post exists and an
  AssumedNote if anything was defaulted.
- **News-page variant (DEC-9, UI-8 v3):** when the story is published on the
  org news page, a variant tab holds the LONG-FORM article — headline, hero
  image, Medium-length body — reviewed here (not a social card); its
  donor-visible topic tags (NWS-4) are shown and editable before publish.
- **ArticleLink badge (NWS-5):** social variants that carry the news-page
  link show the ArticleLink badge (the FitBadge sibling) — the length relief
  valve for X/Threads. Never a link to an unpublished article.
- Sticky right rail (~36%): the **approve panel** from the design system —
  three-layer elevation, rounded 20px: "Ready to publish" heading, channel
  rows with scheduled times ("Tue 9:05 am — when your followers are
  around"), the skipped channel with its reason and an override link,
  full-width **Approve** (terracotta), and a colleague-voice footnote.
- X shown as skipped: "skipped X: over policy 'no long stories on X'" —
  visible, overridable.

## Layout — mobile

Single column; the approve panel collapses to a bottom-anchored bar:
schedule summary + Approve button.

## Rules that bind

- One accent action per viewport: Approve. Edit/Skip/Redirect stay quiet.
- Redirect is free text ("make it warmer") — show the affordance near the
  actions; the system confirms back what it understood before saving.
- Every variant is inspectable before publish — nothing hidden; citations
  visible on external content.
- Inter 500 body, terracotta `#B5502E`, light theme, canvas white,
  hairline separation, no text over photos.
