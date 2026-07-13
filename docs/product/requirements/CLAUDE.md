# requirements/ — Capability Requirement Registers (the WHAT)

One pure-YAML register per capability, named `<prefix>-<slug>.yaml`; the prefix is the ID namespace the file owns (registry in [../../CLAUDE.md](../../CLAUDE.md)). Behavior specs pair by slug in [../../specs/](../../specs/).

Register shape and item grammar are defined once in [../../CLAUDE.md](../../CLAUDE.md): top-level keys (kind/prefix/title/status/serves/intent) + an `items:` map where each entry carries `v`, `priority`, `title`, `statement`, and optional `acceptance` / `flexibility` / `serves` / `depends` / `source`. Priorities live only here — never in specs. EARS-style statements where natural.

| Prefix | Capability | Status |
|---|---|---|
| ONB | [Lazy onboarding](onb-onboarding.yaml) | approved |
| MEM | [Org Memory](mem-org-memory.yaml) | approved |
| CHT | [Agentic chat](cht-agentic-chat.yaml) | approved |
| INT | [Interviewer](int-interviewer.yaml) | approved |
| STR | [Posting Strategy](str-posting-strategy.yaml) | approved |
| GEN | [Content generation](gen-content-generation.yaml) | approved |
| EXT | [External radar](ext-external-radar.yaml) | approved |
| APR | [Approval inbox & composer](apr-approval-inbox.yaml) | approved |
| PUB | [Publishing](pub-publishing.yaml) | approved |
| PRO | [Proactive manager](pro-proactive-manager.yaml) | approved |
| STW | [Stewardship loop](stw-stewardship.yaml) | approved |
| AUT | [Autonomy system](aut-autonomy.yaml) | approved |
| BIL | [Billing & account](bil-billing.yaml) | approved |
| OPS | [Operations console](ops-console.yaml) | approved |
| UX | [App shell & navigation](ux-app-shell.yaml) | approved |

Requirement IDs are carried verbatim from PRD v0.3 (git history); `UX-*` were assigned during decomposition. The PRD's F1 split into ONB + MEM, F2 into CHT + INT — Memory is a core asset consumed by everything, Onboarding is a flow; Chat is a surface, the Interviewer is a skill.
