---
kind: scope
title: Scope and Non-Goals
status: approved
---

# Scope and Non-Goals

This release is **content in, content out**. Scope discipline is a load-bearing constraint: two founders, 12 weeks to first revenue.

## Deferred — returns in this order (the conversion loop)

1. Engagement handling (comments and DMs)
2. Leads inbox
3. Donations integration
4. Email channel

Re-introduction trigger is pending decision Q-5.

## Explicitly disabled at launch

**AI image generation** ships disabled behind a feature flag. Enabling it is a separate decision (Q-3) governed by GR-4.

## Not in this product (unchanged from v0.2)

CRM, email marketing, grant writing, ad management, website building, event tools, multi-seat roles, video/Reels/Stories, native mobile apps, white-label mode, political or non-US organizations. LinkedIn is evaluation-only (PUB-4).

## Boundary cases

- An org may store its existing donation page URL as a plain Memory fact; ask posts and the org news page (quietly — about/footer) may carry it (DEC-9, challenger r2). This is **not** a donations module.
- Reading the org's public web/social presence is in scope (consented at signup, A-5); storing third-party PII is not (no engagement features).
- The **hosted org news page** (NWS-1..6, DEC-9) is in scope and is **not** "website building": one templated, Steward-operated news surface per org — no page builder, no custom pages, no general-purpose sites.
- **Founder-facing messenger bots** (BOT-1..3, DEC-9) are in scope and are **not** the deferred engagement handling: the bots talk to the founder for ingestion and light Q&A; the org's audience comments/DMs remain deferred per the conversion-loop order above.
