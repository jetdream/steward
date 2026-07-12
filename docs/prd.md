# PRD — "Steward" (working name)
## AI Communications Manager for Small US Nonprofits

**Version:** 0.3 · July 12, 2026
**Status:** Draft for founder review
**Companion doc:** Product Vision v0.2
**Changelog v0.3 (from co-founder discussion):** Lazy onboarding replaces gated onboarding. New modules: Agentic Chat with Interviewer skill (F2) and explicit Posting Strategy (F3). Content taxonomy rebuilt as Internal/External with an External Content Radar (F5). Channels expanded to four: Facebook, Instagram, Threads, X — with per-post channel-fit gating and per-channel adaptation. Manual composer added (F6). Visual policy changed: pictures are uploaded by users at launch; AI image generation ships disabled behind a flag. Delivery plan, UX, data model, risks reworked. Engagement/Leads/Donations remain deferred per v0.2.

---

## 1. Purpose

Build a near-autonomous AI content manager for small US 501(c)(3) nonprofits. The system learns the organization from whatever exists (lazy onboarding + curious interviewer), keeps an explicit founder-editable Posting Strategy, plans and writes content across an internal/external taxonomy, adapts every post per channel, publishes to Facebook, Instagram, Threads, and X, and can be *talked to* through one context-aware chat. The founder approves, redirects, and occasionally chats; the system does the work.

Scope discipline unchanged from v0.2: **content in, content out** — no engagement handling, leads, or donation infrastructure in this release. Constraints unchanged: two technical founders, first paying customer in ≤3 months, built from scratch. Price: $199/month.

## 2. Goals and success metrics

**G1 — Commercial proof:** ≥1 nonprofit paying $199/mo within 90 days of dev start; 5 paying orgs by month 5. Refund rate under the 30-day guarantee <20% in cohort 1.

**G2 — Autonomy proof:** ≥70% of drafts approved without edits by an org's week 8.

**G3 — Effort proof:** median founder time in product <15 min/week after the first week (time voluntarily spent chatting excluded).

**G4 — Consistency proof:** ≥80% of active orgs maintain an unbroken 4-week posting streak.

**North star:** orgs with a *live stewardship rhythm* — an unbroken 4-week streak including at least one impact or gratitude post.

## 3. Non-goals (this release)

**Deferred (return in order, per v0.2):** engagement handling → leads inbox → donations integration; then email channel.

**Newly explicit:** AI image generation ships **disabled** (feature flag); enabling it is a separate decision (§13).

**Unchanged:** CRM, email marketing, grant writing, ad management, website building, event tools, multi-seat roles, video/Reels/Stories, native mobile apps, white-label mode, political or non-US organizations.

**Boundary case retained:** an org may store its existing donation page URL as a plain Memory fact; ask posts include it. Not a donations module.

## 4. Users

**Founder-Operator** (primary): runs a small US 501(c)(3), solo–5 people, ~$50K–$1M budget; mission expert, marketing-averse, low AI literacy. Single account per org.

**Design partners (cohort 1):** 3–5 orgs from warm contacts, mixed verticals, paying full price under the 30-day money-back guarantee.

**Operators (us):** silent QA through the ops console (F12) for cohort 1, dialed down as G2 improves.

## 5. Assumptions and dependencies

1. **Meta app review is the critical path**, now covering FB Pages, Instagram, **and Threads** (`pages_manage_posts`, `instagram_content_publish`, `pages_read_engagement`, `threads_basic`, `threads_content_publish`) plus business verification. Submission starts **week 1**; cohort-1 accounts run in dev mode (admins as testers) until approval. Threads rides the same Meta stack — low marginal cost.
2. **X paid API tier is committed** (write access) — a standing budget line item and a policy-volatility risk we accept, since X is in the launch channel set.
3. **External content discovery, initial implementation: Gemini API with Google Search grounding.** Named upgrade path: Perplexity (AI+search), Tavily/Exa (search) in later versions. Named data sources for later depth: GDELT (events), Google News RSS + newsdata.io (news), arXiv (research).
4. **Public nonprofit data:** IRS EO BMF + Form 990 via ProPublica Nonprofit Explorer API (free); the org's website; existing social channels (facts *and* tone/style signal).
5. Orgs consent at signup to our reading their public web/social presence and connected accounts. Stripe is used for our subscription billing only.

## 6. System concept — the core loop

**Org Memory** (facts, stories, media, rules) and the **Posting Strategy** (explicit editorial contract) feed the **Planner/Content Engine**, which drafts from two wells — *internal* org content and the *external radar* — producing per-channel adapted variants. Drafts flow to the **Approval Inbox** (or originate in the **Composer**), then to the **Publisher** (FB/IG/Threads/X, fit-gated). The **Agentic Chat** sits across everything — it hosts the **Interviewer**, answers questions, takes redirects, and (Phase 2) executes commands. The **Proactive Manager** requests material and proposes campaigns; the **Autonomy System** governs what may publish without approval. Every founder action enriches Memory, so the loop compounds.

---

## 7. Functional requirements

Priorities: **P0** = required for first paying customer (Phase 1, ≤3 months) · **P1** = completes v1 (Phase 2, months 4–5) · **P2** = backlog.

### F1 — Lazy onboarding & Org Memory (P0)

- **ONB-1 (P0)** Zero-homework signup: org name + email is enough to start. EIN optional; when provided (or confidently matched), system verifies 501(c)(3) status and pulls registry data (IRS/ProPublica). Nothing blocks on completeness — **whatever the founder can provide is okay.**
- **ONB-2 (P0)** Source ingestion: website scrape and existing FB/IG/Threads/X account harvest, extracting *facts* (mission, programs, people, events) and *style* (tone of voice, vocabulary, post patterns, imagery style) into Memory. Style findings seed the Posting Strategy (F3).
- **ONB-3 (P0)** Gap-driven flow: the system computes what it's missing and the Interviewer (F2) fills gaps conversationally over time. No setup checklist is ever shown as homework; the product simply gets better as sources and answers arrive.
- **ONB-4 (P0)** Channel connect: OAuth flows for FB Page, Instagram, Threads, X — connectable in any order, any time; publishing to a channel activates when connected.
- **ONB-5 (P0)** "Here's what I know" review: founder sees the assembled profile and corrects it; corrections become permanent rules.
- **ONB-6 (P0)** First proof, lazily: first drafts are generated as soon as minimum viable context exists — target inside the first session (from sources alone, or from the first ten minutes of interview when sources are thin).
- **MEM-1 (P0)** Memory persistence: every approval, edit, rejection, upload, interview answer, and chat remark writes to Memory (facts / stories / styleRules / taboos / people / programs / events, with source + timestamp). Acceptance: a stated correction is never violated in subsequent drafts.
- **MEM-2 (P0)** Never-ask-twice: the system may interrupt only for (a) field-only raw material, (b) genuinely founder-owned decisions, (c) blocking unknowns. All else defaults sensibly with a visible "assumed" note.
- **MEM-3 (P1)** Memory browser inside the Organization page: view, edit, delete what the system knows.

### F2 — Agentic Chat & the Interviewer (P0 core, P1 actions)

- **CHT-1 (P0)** One chat surface with full context awareness: Org Memory, Posting Strategy, **all past and scheduled posts across all channels**, and current requests. Acceptance: "what's going out this week and where?" answered correctly; "what do you know about our volunteer program?" answered from Memory with sources.
- **CHT-2 (P0)** Redirects via chat: plain-language feedback ("less formal," "never name donors," "on X be punchier") is confirmed back and written to Memory or Strategy, binding future drafts immediately.
- **CHT-3 (P1)** Command actions via chat: create a draft, edit a scheduled post, reschedule, pause a channel, trigger a campaign — each executed through the same pipelines as the UI, with confirmation for destructive actions.
- **CHT-4 (P0)** Voice requirement: colleague, never software; every system-initiated message carries a reason.
- **INT-1 (P0)** The Interviewer skill: conducts initial and ongoing info-gathering as a **curious interviewer and thinking partner**, not a form. Friendly, inviting tone; open questions; **deepening follow-ups** that pursue what will later fuel content and ideation ("You mentioned the first family you helped — what happened next? That's the kind of story donors remember").
- **INT-2 (P0)** Interview mechanics: session-resumable; a few questions at a time, never an interrogation; driven by ONB-3's gap model and by content-value heuristics (stories > adjectives); every answer written to Memory; never re-asks (MEM-2); explicitly connects answers to value ("I'll turn this into a founder-story post — you'll see it in your next digest").
- **INT-3 (P1)** Periodic curiosity: after launch weeks, the Interviewer occasionally (rate-limited) probes for fresh material tied to the calendar ("your beach cleanup is Saturday — want me to prep a before/after pair of posts?").

### F3 — Posting Strategy (P0)

- **STR-1 (P0)** Every org has an explicit, versioned **Posting Strategy** document with exactly these sections: **(a)** What to post / what not to post; **(b)** Tone of voice — description and concrete examples; **(c)** Restrictions / compliance / guardrails; **(d)** Specific standing instructions; **(e)** Channel-specific instructions (per FB / IG / Threads / X).
- **STR-2 (P0)** Auto-drafted from ingestion (ONB-2 style findings) + interview answers; presented for founder review; editable in the Strategy page **and** via chat (CHT-2). Edits bind immediately and are versioned with diffs.
- **STR-3 (P0)** Enforcement: every draft is validated against the Strategy before entering any queue; the channel-fit gate (GEN-5) and channel adaptations (GEN-4) consume section (e).
- **STR-4 (P0)** Two-layer guardrails: platform-level rules (non-negotiable: no outcome promises, no tax/legal advice, sensitive-topic escalation, AI-visual policy) + org-level rules (editable, section c). Org rules can only tighten, never loosen, platform rules.

### F4 — Planning & content generation (P0)

- **GEN-1 (P0)** Rolling 4-week calendar per org drawing from the **content taxonomy**:
  - **Internal:** Mission (what value, how, why it matters) · Founder story · Case studies (people/orgs benefited) · Own events, virtual and physical · People (employees & volunteers).
  - **External:** Related events (local → worldwide) · Related news · Related research/articles — supplied by the External Radar (F5).
  - **Overlays woven through the mix:** Impact/Gratitude (stewardship rhythm, ≥1 per 4 weeks — north star), Fundraising Asks (≤25% of mix, include donation URL when provided), Seasonal/Campaign hooks (GivingTuesday, year-end, cause awareness days).
- **GEN-2 (P0)** One story → per-channel variants for every connected channel, adapted for **(i)** technical requirements — character limits (e.g., X's short form vs Threads vs FB/IG captions), image requirements, link handling — and **(ii)** the Strategy's channel-specific instructions.
- **GEN-3 (P0)** Pictures: **every post carries a picture.** Sources at launch: founder upload (per-post or batch) and the media library (harvested + uploaded, tagged by Memory). **AI image generation ships disabled** behind a feature flag; when enabled (separate decision, §13) it produces branded graphics/illustrations only — never photorealistic depictions of beneficiaries, animals, staff, or impact scenes.
- **GEN-4 (P0)** Awaiting-picture state: a draft without an assigned picture is fully written and visible but cannot be scheduled; it triggers a picture request (PRO-1) with suggestions from the library. One-tap attach from library in the Inbox.
- **GEN-5 (P0)** Channel-fit gate: for each draft × channel, the system decides *should this go here at all* (Strategy fit + content type fit + technical fit). Unfit channels are skipped with a visible reason ("skipped X: over policy 'no long stories on X'"). Founder can override per post.
- **GEN-6 (P1)** Performance feedback: per-post metrics (read-only insights) feed the Planner.

### F5 — External Content Radar (P0-lite, P1 depth)

- **EXT-1 (P0)** Radar v0: recurring discovery runs per org using **Gemini API with Google Search grounding**, seeded by the org's cause profile from Memory (topics, geography: local → county → state → national → global). Output: candidate items (events, news, research) with source links and relevance rationale.
- **EXT-2 (P0)** External drafts: selected candidates become drafts in the org's voice with **mandatory source citation** and a clear commentary framing (the org's perspective, not rehashed news). Always subject to the sensitive-topic classifier.
- **EXT-3 (P0)** Autonomy cap: external-content posts are permanently capped at TL1 (never full autopilot) — see AUT-2.
- **EXT-4 (P1)** Source depth: add Google News RSS + newsdata.io (news), GDELT (event streams), arXiv (research) as structured feeds; add Perplexity and/or Tavily/Exa as discovery engines. Per-org controls in Strategy section (a): external topics welcomed/banned.

### F6 — Approval Inbox & Composer (P0)

- **APR-1 (P0)** Inbox: drafts with per-channel variant preview and fit indicators; one-tap Approve (all variants), per-channel toggle, inline Edit (per variant or master), Skip, free-text redirect. Batch approve supported.
- **APR-2 (P0)** Founder-selected cadence: daily / 2–3×week / weekly (default weekly); event-driven items (campaigns, time-sensitive external items, picture-request follow-ups) may arrive anytime.
- **APR-3 (P0)** Learning loop: every edit is diffed; recurring edit patterns are proposed as Strategy/Memory rules ("You've shortened 4 X posts in a row — set 'max 200 chars on X' as a rule?").
- **APR-4 (P0)** Notifications: email (web push P1) for digest-ready and time-sensitive items; deep links.
- **APR-5 (P0)** **Manual composer:** founder writes a post (master text), attaches a picture (upload or library), picks target channels (or accepts the fit-gate's suggestion); system produces channel adaptations for confirmation; then normal scheduling/publishing. Also reachable via chat ("post this photo with a thank-you to Saturday's volunteers") — chat-initiated composition is P0 for creation-with-confirmation, P1 for full command flow (CHT-3).
- **APR-6 (P1)** Quiet accountability: one gentle nudge if a digest sits >72h; never guilt, never spam.

### F7 — Publishing (P0)

- **PUB-1 (P0)** Channels at launch: **Facebook Pages, Instagram feed, Threads, X** — official APIs only, per-channel scheduling at engagement-optimal times. Acceptance: approved variant publishes at scheduled time ±5 min; failures retry and alert operators; founder alerted only if action is needed.
- **PUB-2 (P0)** Per-channel technical profiles maintained as configuration: length limits, media requirements, link behavior, rate limits — consumed by GEN-2/GEN-5 so adaptation and gating stay correct as platforms change.
- **PUB-3 (P0)** Publish log: what went out, where, when, with links and the variant text; visible in Calendar/Published.
- **PUB-4 (P2)** LinkedIn evaluation.

### F8 — Proactive manager (P0)

- **PRO-1 (P0)** Material requests with a reason, prioritizing **pictures** (the scarce resource with generation off): tied to real events from Memory ("The well drilling starts Monday — send 3 photos and one line; I'll turn it into the impact story your donors were promised"). Request → simple upload flow → library + drafts.
- **PRO-2 (P0)** Campaign initiation: seasonal packages (GivingTuesday, year-end) proposed pre-drafted; founder approves once.
- **PRO-3 (P1)** Ask-hygiene: spaces fundraising asks; flags asking-without-reporting and proposes the missing impact post.

### F9 — Stewardship content loop (P0-lite / P1)

- **STW-1 (P0)** Gratitude and impact posts are first-class overlay categories in every org's mix from week 1.
- **STW-2 (P1)** Milestone recaps: at a campaign end date or a founder's one-tap "we hit a milestone," generate a thank-you + impact-recap package and request needed material via PRO-1.

### F10 — Autonomy system (P0 mechanics, P1 promotion)

- **AUT-1 (P0)** Per-category Trust Levels: **TL0** approve-everything (launch state) → **TL1** auto-publish with 24h veto window → **TL2** full autopilot. Categories follow the taxonomy (each internal category, external, overlays).
- **AUT-2 (P1)** Promotion offered, never taken: ≥10 consecutive approvals with <10% edit rate over ≥3 weeks → propose TL1; rejection/edit spikes auto-demote. **Permanent caps at TL1: Fundraising Asks and all External content.**
- **AUT-3 (P0)** Global kill switch pauses all publishing instantly; per-channel pause too.

### F11 — Billing & account (P0)

- **BIL-1 (P0)** Single plan $199/month (Stripe Billing), card at signup, no trial, 30-day money-back honored in one click + one-question exit survey. Refund rate tracked (G1).
- **BIL-2 (P0)** Cancel anytime; publishing stops; data export offered; deletion honored (§10).
- **BIL-3 (P2)** Annual plan ($166/mo equivalent).

### F12 — Internal operations console (P0)

- **OPS-1 (P0)** Operator dashboard: per-org draft QA (silent review before Inbox for cohort 1, with a dial), generation/publish failure queues, interview transcript review, external-radar precision review, account health. Substitutes process for headcount.

---

## 8. UX requirements

Responsive web (desktop + phone browser). Five navigation surfaces plus one action:

1. **Chat** — the conversational front door: interviewer sessions, questions, ideation, redirects; (P1) commands.
2. **Inbox** — approval queue with per-channel variants, fit indicators, awaiting-picture states. Where 90% of non-chat time lives.
3. **Calendar / Published** — planned and published posts across all channels; publish log.
4. **Organization** — two tabs: *Profile & Memory* (what the system knows; MEM-3 browser at P1) and *Posting Strategy* (STR-1 sections, versioned editor).
5. **Settings / Billing** — cadence, notifications, autonomy levels per category, per-channel pause, kill switch, plan.
- **Compose** — an action (button in Inbox/Calendar, or via chat), not a nav item: master text → picture → channels → adapted variants → confirm.

**Voice requirement (product-wide):** colleague, never software; every request carries a reason; no empty states that ask the founder to create from scratch — the system always moves first.

## 9. Data & integrations

**Integrations:** Meta Graph API (FB Pages, Instagram, **Threads**), X API (paid tier), Gemini API with Google Search grounding (external radar v0), Google News RSS / newsdata.io / GDELT / arXiv (P1 feeds), Stripe Billing, transactional email (Postmark/Resend), ProPublica Nonprofit Explorer / IRS EO data, website scraper. (Perplexity / Tavily / Exa: later versions.)

**Core data model (sketch):** Org (incl. optional donationUrl) · MemoryEntry (fact / story / styleRule / taboo / person / program / event; source + timestamps) · StrategyDoc (sections a–e, versioned) · MediaAsset (tags, provenance) · ContentItem (master + ChannelVariant[]; states: draft → awaiting-picture → approved → scheduled → published; per-variant fit verdicts; edit-diff log) · ChatSession/Message (incl. interviewer transcripts) · ExternalItem (source, url, relevance, disposition) · TrustLevel (per category) · PostMetric (P1) · Subscription.

**LLM architecture:** all generation grounded in Memory + Strategy (retrieval, not vibes); Strategy validation + platform guardrails run before anything enters a queue; chat and interviewer share the same Memory read/write layer as generation (one brain, several skills); all model calls logged per org (OPS-1, cost tracking). Target COGS (LLM + search + APIs) <$25/org/month.

## 10. Compliance, privacy, safety

Meta/X/Threads developer-policy compliance (app review, permitted automation only). Charitable-solicitation registration remains the org's responsibility (ToS); the product never gives legal/tax advice and never promises fundraising outcomes. No third-party PII is stored (no engagement features); interview/chat content is org-provided and treated as confidential org data — exported and deleted on request. External content must carry source citations; sensitive-topic classifier forces human approval regardless of Trust Level; platform guardrails are non-negotiable and org rules can only tighten them (STR-4). AI-visual policy per GEN-3 (currently moot — generation disabled).

## 11. Delivery plan (2 engineers, 12 weeks to first revenue)

| Phase | Weeks | Ships | Exit criteria |
|---|---|---|---|
| **P0 — Foundations** | 1–2 | Meta app + business verification submitted **day 1** (FB/IG/Threads permissions); X API tier purchased; skeleton (auth, org, data model); ingestion prototype (site + socials, style extraction); design-partner outreach (5 warm → 3 committed) | Meta review in flight; 3 orgs scheduled |
| **P1a — Brain & first drafts** | 3–6 | Lazy onboarding (ONB-1..6), Memory (MEM-1..2), **Chat v0 + Interviewer** (CHT-1..2, INT-1..2), Posting Strategy (STR-1..4), content engine with taxonomy + adaptation + fit gate (GEN-1..5), Inbox incl. awaiting-picture (APR-1..4), FB/IG publishing in dev mode | Design partner completes a first session ending in real drafts; posts publish to tester pages |
| **P1b — Channels, radar, rails** | 7–10 | Threads + X publishing (PUB-1..3 complete), manual composer (APR-5), External Radar v0 (EXT-1..3, Gemini-grounded), proactive requests + campaigns (PRO-1..2), autonomy TL0 + kill switch (AUT-1, AUT-3), billing (BIL-1..2), ops console (OPS-1) | Full loop end-to-end on all four channels for 3 design partners |
| **P1c — First revenue** | 11–12 | Hardening; Meta review cleared; cohort 1 converts to paid | **≥1 paying org (G1)**; ideally 3–5 |
| **P2 — v1 complete** | 13–20 | Chat command actions (CHT-3), interviewer curiosity (INT-3), radar depth: RSS/newsdata/GDELT/arXiv + engine upgrades (EXT-4), autonomy promotion (AUT-2), milestone recaps (STW-2), ask-hygiene (PRO-3), memory browser (MEM-3), performance feedback (GEN-6), nudges (APR-6) | G2 ≥70%; 5+ paying orgs |
| **Later** | — | Image generation flag-on decision (§13); conversion loop returns: engagement → leads → donations; email channel | Per §13 triggers |

## 12. Risks & mitigations

1. **Scope growth vs 12 weeks (top risk of this revision).** Chat, interviewer, strategy artifact, two extra channels, and a radar were added while the team stayed at two. Mitigations: thin slices are contractual — Chat v0 = interviewer + context Q&A + redirects (no command actions); Radar v0 = Gemini-grounded suggestions only; Threads rides the Meta stack; composer is a single flow. Anything trending over budget slips from P1b to P2 in this order: radar depth → composer polish → X (never the chat/interviewer — it's the product's soul).
2. **Meta app review delays (critical path).** Submit day 1; publishing-only permission set; cohort-1 pages in dev mode via tester roles; manual-publish operator fallback so no partner misses a scheduled post.
3. **Picture bottleneck (new).** With generation off, every post needs a real picture; founders are slow to upload. Mitigations: library seeding from site/socials at ingestion; batch upload flows; PRO-1 requests with reasons and deadlines; awaiting-picture drafts visible (guilt-free but present); Inbox one-tap attach. Metric to watch: % drafts blocked >72h on pictures.
4. **External content accuracy/reputation risk (new).** Mitigations: mandatory citations, commentary framing, sensitive-topic classifier, permanent TL1 cap, per-org topic allow/ban lists in Strategy, operator precision review in cohort 1.
5. **AI quality below the "hired human" bar early.** OPS-1 silent QA; per-category autonomy gating; G2 as the dial.
6. **X API cost/policy volatility.** Accepted as a budget line; feature-flagged; adapter isolation so an X policy change never blocks other channels.
7. **Value-perception risk** (from v0.2, reduced): chat + four channels + radar strengthen the "$199 vs $500–1,000 freelancer" story; positioning stays "your content manager," not "your fundraising platform," until the conversion loop returns.
8. **Two-person bandwidth.** P0 line is the scope; ops console substitutes process for headcount.

## 13. Open questions

1. Product name (working: *Steward*).
2. Co-founder's own nonprofit as design partner #0 (fastest dogfooding path)?
3. **Image-generation flag-on criteria** — proposal: only after picture-bottleneck metric shows real founder pain *and* branded-graphics templates pass cohort review; never photorealistic (GEN-3 guardrail stands).
4. Radar engine upgrade order: Perplexity vs Tavily/Exa first; which structured feeds (GDELT / newsdata.io / arXiv) earn P1 slots per vertical.
5. Conversion-loop re-introduction trigger (unchanged proposal): G2 met *and* cohort retention through month 3.
6. Whether the 30-day guarantee is marketed loudly (conversion lever) or quietly (refund-risk lever) — recommend loudly.
