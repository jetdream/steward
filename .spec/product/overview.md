---
kind: narrative
title: System Concept
status: approved
---

# Steward — System Concept

Steward is a near-autonomous AI content manager for small US 501(c)(3) nonprofits. The system learns the organization from whatever exists (lazy onboarding + curious interviewer), keeps an explicit founder-editable Posting Strategy, plans and writes content across an internal/external taxonomy, adapts every post per channel, publishes to Facebook, Instagram, Threads, and X, and can be *talked to* through one context-aware chat. The founder approves, redirects, and occasionally chats; the system does the work.

Scope discipline: **content in, content out** — no engagement handling, leads, or donation infrastructure in this release (see [scope.md](scope.md)). Constraints: two technical founders, first paying customer in ≤3 months, built from scratch. Price: $199/month.

## The core loop

**Org Memory** (facts, stories, media, rules) and the **Posting Strategy** (explicit editorial contract) feed the **Planner/Content Engine**. Grounded in Memory, the system also owns the **Content Topics / editorial agenda** — it proactively identifies *what* the org should talk about and holds a per-topic research strategy; this one shared, founder-editable agenda drives BOTH internal planning and the external radar's discovery (DEC-23). The planner drafts from two wells — *internal* org content and the *external radar* — pairing each slot's content TYPE with an agenda SUBJECT, producing per-channel adapted variants. Drafts flow to the **Ready** (the approval surface) (or originate in the **Composer**), then to the **Publisher** (fit-gated; a cancelled org does not publish). The **Agentic Chat** sits across everything — it hosts the **Interviewer**, answers questions (grounded; declines legal/tax advice, GR-2), takes redirects, and (Phase 2) executes commands. Founder rules and redirects write to **Memory as the single source** — the Strategy's org-rules section is a rendered view of it (DEC-22). The **Proactive Manager** requests material and proposes campaigns and topics within one shared interruption budget (DEC-24); the **Autonomy System** governs what may publish without approval. Every founder action enriches Memory, so the loop compounds.

```mermaid
graph LR
  subgraph Knowledge
    MEM[Org Memory]
    STRAT[Posting Strategy]
  end
  subgraph Sources
    INTQ[Interviewer]
    ING[Source ingestion]
    RADAR[External Radar]
  end
  CHAT[Agentic Chat]
  AGENDA[Content Topics / editorial agenda]
  ENGINE[Planner / Content Engine]
  INBOX[Ready — approvals]
  COMP[Composer]
  PUBLISH[Publisher: FB / IG / Threads / X]
  PROMGR[Proactive Manager]
  AUTO[Autonomy System]

  ING --> MEM
  INTQ --> MEM
  CHAT --- INTQ
  CHAT -->|redirects| MEM
  MEM -->|org-rules view| STRAT
  MEM --> AGENDA
  AGENDA -->|subjects| ENGINE
  AGENDA -->|drives discovery| RADAR
  MEM --> ENGINE
  STRAT --> ENGINE
  RADAR --> ENGINE
  ENGINE -->|drafts, per-channel variants| INBOX
  COMP --> INBOX
  INBOX -->|approved| PUBLISH
  AUTO -.governs.-> PUBLISH
  PROMGR -->|material, campaigns, topic proposals| INBOX
  INBOX -->|approvals, edits, rejections| MEM
  PUBLISH -->|publish log| CHAT
```

The requirement capabilities in [requirements/](requirements/) map onto these blocks; the technical module boundaries live in [../architecture/overview.yaml](../architecture/overview.yaml).
