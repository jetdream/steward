---
kind: narrative
title: Product Vision
status: approved
normative: false
---

# Product Vision v0.2: An AI Communications Manager for Small US Nonprofits

> **Non-normative narrative.** This document carries the WHY — problem, insight, positioning. Normative truth lives in the layered docs: [goals.yaml](goals.yaml), [values.yaml](values.yaml), [guardrails.yaml](guardrails.yaml), [requirements/](requirements/), [scope.md](scope.md). Where this narrative and those files diverge, the layered files win (record the divergence in [inconsistencies.yaml](inconsistencies.yaml)).

**Working name:** *Steward* (Q-1)
**Version:** 0.2 · July 12, 2026 (supersedes v0.1)
**Changelog:** Added the agentic chat as the primary interaction model, the curious-interviewer onboarding, the explicit Posting Strategy, the internal/external content taxonomy with an external radar, four launch channels with per-channel adaptation, manual composition, and the org-photos-first visual policy. Restructured functionality into "Now" (content core) and "Next" (conversion loop) to reflect current scope decisions.

---

## One-line vision

Every small nonprofit gets the communications manager it could never afford: an AI employee that knows the organization, plans and writes its donor-facing content, publishes across channels almost autonomously — and that the founder can simply *talk to*.

## The problem

A nonprofit lives on attention. Its mission survives only if the organization constantly tells the world what it does, why it matters, and why it needs money — and then shows donors what their money achieved. This communication cycle is not marketing garnish; for most small nonprofits it *is* fundraising, and fundraising is oxygen.

Yet the people running small nonprofits are mission experts, not marketers. They fear this work, have no time for it, and no skill in it. The default state of the sector: social accounts exist, hold five to ten stale posts, and quietly go dark — and with them, the mission's visibility.

Everything on the market fails these founders in one of three ways. **Tools stay empty** — schedulers like Buffer require you to live in them, and the work never happens. **AI must be operated** — prompting skill in this audience rounds to zero, and after two failed attempts the assistant is abandoned. **Humans work but don't scale down** — the one reliable solution today is a freelance social media manager at $500–1,000/month, more than most small nonprofits will spend. So the real competitor is doing nothing, and the cost of doing nothing is invisible but fatal.

## The insight

Don't teach nonprofit founders to use AI tools. **Invert the model: make AI behave like the hired human who actually works today.** The freelancer wins not because her posts are better, but because of *how she works*: she shows up on her own, brings finished work, asks good questions, and — decisively — **you can just talk to her.**

Three design consequences define the product:

- **The system owns the context.** Everything knowable is gathered without asking (website, public filings, existing social channels — which also reveal the org's real tone and style), and everything learned is remembered permanently. It never asks for what it can find, and never asks the same thing twice.
- **The system moves first.** It proposes; the founder disposes. There is never a blank page. The founder's job is two verbs: **approve** and **redirect**.
- **The system can be talked to.** One conversational surface, aware of everything — who the org is, what's been posted, what's scheduled, what the strategy says. Ask it anything, tell it anything, change anything, in plain language. This is what finally makes the "hired human" real rather than metaphorical.

## Target audience

**Primary:** founders of small US 501(c)(3) nonprofits — solo founders and teams of 1–5, roughly $50K–$1M annual budget, no marketing or communications staff.

**The persona:** a founder-operator who is deeply expert in the mission and openly averse to self-promotion. Knows they *should* be posting, feels guilty that they aren't, has tried a scheduler or ChatGPT and bounced off. Time-poor, low AI literacy, allergic to anything that must be studied before it's useful. What they want is not a tool — it's for the work to be *done*.

**Go-to-market:** launch vertical-agnostic with a mixed design-partner cohort recruited from warm contacts; choose the flag-planting vertical from cohort data. Positioning gets dramatically stronger one level deeper ("built for animal-welfare nonprofits" ends the search), so the choice is deliberate, not skipped.

**Explicitly not for (now):** larger nonprofits with comms staff, agencies, political organizations, and for-profits.

## Positioning

**Category:** not a social media tool, not an AI writing assistant — an **AI communications manager for nonprofits**. A worker, not software.

**Positioning statement:** For founders of small US nonprofits who know they should be communicating with donors but never manage to, *Steward* is an AI communications manager that learns your organization, plans and writes your content, and publishes it across your channels almost on its own. Unlike schedulers and AI assistants you have to operate, it works — and converses — like an employee who already knows your organization. Your only job is to approve.

**Why "for nonprofits" is a moat, not a label:** donor-lifecycle logic is built in (stewardship-style content — gratitude and impact reporting — is a first-class category, because serving existing donors is how small nonprofits grow fastest); compliance-conservative defaults calm the constant background fear of "breaking a rule"; and the nonprofit calendar (GivingTuesday, year-end giving, cause awareness days) is native.

**Against the alternatives:** versus doing nothing — the mission stops being invisible; versus a freelancer — a fraction of the cost, never quits, already knows nonprofit norms; versus Buffer/Hootsuite + ChatGPT — those are tools you must operate, this is work that arrives finished.

## The value delivered

Consistent public presence without becoming a marketer — regularity, the thing that was impossible, becomes automatic. A visible fundraising story pointed at the highest-ROI lever: tell the mission, show the impact, thank the donors, repeat. Peace of mind from compliance-conservative defaults and an explicit, inspectable strategy. Hours of dreaded work collapse into minutes of approvals and the occasional pleasant conversation. A professional level from day one that a solo founder wouldn't reach alone in one to three years.

## How it works

### Org Memory — the core asset

The system builds a living profile of the organization from whatever exists: the website, IRS/registry data, and — critically — the org's existing social channels, which reveal not just facts but the org's *actual voice, tone, and content style*. From then on it enriches itself continuously: every approval, edit, rejection, uploaded photo, and chat remark becomes permanent knowledge. This memory is what makes near-autonomy possible, and it compounds: every week of use makes the system a better employee of *this specific organization*.

### Lazy onboarding and the curious interviewer

There is no long setup form and no required homework. **Whatever the founder can provide is okay** — a website URL, a social handle, or nothing but ten minutes to chat. The gaps are filled by the **Interviewer**: not a form in disguise, but a genuinely curious conversation partner. It asks warm, inviting, deepening questions — the way a great hire would in their first week — and it listens like a thinking partner: "You mentioned the first family you helped — what happened to them? That's exactly the story donors connect with." Everything it learns lands in Memory and later shows up as better content, better ideas, better timing. The interview never has to finish; it resumes whenever the founder has five minutes, and it never asks the same thing twice.

### The Posting Strategy — an explicit contract, not a black box

The system's editorial judgment is written down where the founder can see and change it: **what to post and what not to post; tone of voice, described and shown through examples; restrictions, compliance rules, and guardrails; specific standing instructions; and channel-specific instructions.** The strategy is auto-drafted from everything ingested and interviewed, approved by the founder, and enforced on every draft. Change it in the editor or just say it in chat ("never mention donor names," "on X, be punchier") — it binds immediately.

### The conversation — one chat that knows everything

A single agentic chat aware of the whole picture: the org's Memory, the Posting Strategy, every past post and every scheduled post on every channel. It's where the interview happens, where ideas get kicked around ("what should we do for GivingTuesday?"), where questions get answered ("what's going out this week?"), and where redirects land ("less formal, more about the kids"). Talking is always an alternative to clicking.

### The rhythm — the founder's entire job

A digest of ready-to-publish posts on the founder's chosen cadence: approve in one tap, edit inline, or skip. Occasional concrete requests, always with a reason — usually for photos, since real org photos are the visual gold standard. Rare plain-language redirects, absorbed permanently. Target: **under 15 minutes per week**, minus any time the founder *chooses* to spend chatting.

## Functionality — Now (the content core)

*Narrative summary — the normative list with priorities and acceptance criteria is [requirements/](requirements/).*

1. **Lazy onboarding + Org Memory.** Start from anything; ingest website and existing socials (facts *and* style); the Interviewer fills gaps conversationally over time; first drafts appear as soon as minimum viable context exists — target: inside the first session.
2. **Posting Strategy.** The explicit, founder-visible, founder-editable editorial contract described above; every generated post complies with it.
3. **Content engine with a two-sided taxonomy.** *Internal content:* the mission (what value, how, why it matters), founder stories, case studies of people and organizations helped, the org's own events (virtual and physical), and the people — employees and volunteers. *External content:* things the org's audience genuinely cares about — related events (local to worldwide), related news, and relevant research — discovered by an external radar and offered as drafts in the org's voice, always with sources. Stewardship content (gratitude, impact reporting) and well-spaced fundraising asks are woven through the mix.
4. **Four channels with per-channel adaptation.** Facebook, Instagram, Threads, and X at launch. One story, adapted per channel: technical requirements (length limits, image requirements) and the strategy's channel-specific instructions. The system posts to a channel only when the post fits that channel; the founder sees each channel variant before it goes.
5. **Approval surface (Ready) + manual composer.** The one-tap digest remains the core; additionally the founder can always compose a post manually — write it, attach a picture, pick channels — and the system handles adaptation, scheduling, and publishing.
6. **Pictures: real first.** Every post carries a picture. At launch, pictures come from the org — uploaded directly or drawn from the media library the system builds and proactively replenishes ("send me three photos from Saturday's cleanup"). AI image generation stays disabled initially; when enabled later, it produces branded graphics and illustrations only — never photorealistic depictions of beneficiaries, animals, staff, or impact scenes.
7. **Proactive manager.** The system initiates: material requests tied to real events, seasonal campaign packages proposed and pre-drafted, and ask-hygiene ("we've asked twice without reporting back — here's the impact post that should come first").
8. **Earned autonomy.** Everything starts founder-approved. Per content category, consistent approvals unlock auto-publish with a veto window, then full autopilot — always offered, never taken. Fundraising asks and external-content posts stay permanently below full autopilot. One kill switch pauses everything.

## Functionality — Next (the conversion loop)

*Narrative summary — the normative deferral order and triggers live in [scope.md](scope.md).*

Deliberately staged after the content core proves itself (autonomy score met, cohort retained): **engagement handling** (comments and DMs, drafted replies, auto-replies to simple ones) → **leads inbox** (warm donors surfaced with context and suggested responses) → **donations integration** (Stripe-powered giving links, donation-triggered stewardship). Then email — the highest-converting nonprofit channel. The vision's endpoint is unchanged: the full donor relationship cycle, from warming up to reporting back.

## Why $150–250/month is an easy yes

The price anchors against humans, not software: a freelancer at $500–1,000/month, an agency at $2,500+, a part-time hire at $1,500+. This is the only option under $500 where the work actually gets done — a $30 scheduler that never gets used costs infinitely more, because its real price is a dead channel. **Pricing:** a single plan at **$199/month**, 30-day money-back guarantee, no free trial. One product, the whole promise.

## Product values and guardrails

Moved to [values.yaml](values.yaml) (VAL-1 … VAL-6, the soft decision compass) plus the platform [guardrails.yaml](guardrails.yaml) (GR-1 … GR-6, the hard rules).

## Success metrics

Moved to [goals.yaml](goals.yaml) (G-1 … G-5 and the north star).

## Open questions

Moved to [open-questions.yaml](open-questions.yaml) (Q-1 … Q-7).