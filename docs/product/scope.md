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

- An org may store its existing donation page URL as a plain Memory fact; ask posts include it. This is **not** a donations module.
- Reading the org's public web/social presence is in scope (consented at signup, A-5); storing third-party PII is not (no engagement features).
