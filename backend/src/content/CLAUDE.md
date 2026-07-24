# backend/src/content/ — the Content Engine (ARC-15 / GEN)

**Purpose.** The hub that turns Memory + Strategy + the editorial agenda + the
Radar into a steady, on-mission publishing rhythm (the GEN capability). It is the
single owner of GENERATION: the planner slot, the founder composer (APRS-5), and
external drafts (PIPE-3) all enter the SAME `generate → VAL → fit` chain —
authorship is never a bypass.

**G1 slice (this module today).** The `generate-draft` Skill — the first HEAVY
Skill on the ARC-27/PIPE-4 agent-runtime substrate, evaluated day-one (ADR-0010).
It is where the previously-deferred PIPE-4 `guardrailChain` substrate comes into
existence.

| File | Role | Spec |
|---|---|---|
| `generate.ts` | `generateDraft` (grounding-in) + the bounded VAL regenerate loop; `draftForSlot` (the MEMS-4 retrieve → generate seam); `assembleGrounding` | `@implements GENS-7 v1` |
| `guardrails.ts` | The VAL chain POLICY (PIPE-2): `resolveOutcome` + `regenerateHint` over the judge's findings — pure, deterministic, no content heuristic | `@implements GENS-7 v1` |
| `store.ts` | DM-5 ContentItem PERSISTENCE (G1b): `persistDraft` (a DraftResult → a durable master row) + `getContentItem` / `listContentItems` (org-scoped, ACC-3) | `@implements GENS-7 v1` |
| `planner.ts` | The GENS-1 rolling planner (G4): the `plan-calendar` pairing Skill + the pure DETERMINISTIC mix-quota engine (`designateAndSchedule`) + the agenda/taxonomy guard (`applyPairingGuard`) | `@implements GENS-1 v1` |
| `engine.ts` | `createContentEngine` — the WIRED loop `planAndDraftCalendar`: agenda → plan → generate → VAL → persist dated ContentItems | `@implements GENS-1 v1` |
| `types.ts` | `ValReport` / `DraftResult` contracts (`ValOutcome` lives in `@shared` — a DM-5 field) | — |

**Persistence (G1b).** `store.ts` completes the `generateDraft → ContentItem`
interface: a generated master becomes a durable DM-5 `content_item` row
(`@shared/db/content.ts`) in editorial state `draft`. An escalated VAL outcome
(GR-3/GR-8) is recorded via `escalated` + `valSummary` (the item still lands in
`draft` — at TL0 every draft needs founder approval; the flag records WHY it can
never auto-advance). MASTER-ONLY for now; the ChannelVariant table + delivery
state land with G2 (a follow-on migration), the awaiting_picture picture gate
with G3.

**Detection is an LLM judgment, never a heuristic (LRN-20 — strict project rule).**
Whether a master violates a guardrail (GR-1 outcome promise, GR-3 sensitive, GR-5
citation, GR-8 semantic taboo) is decided by the **`guardrail-check` Skill** (a
cheap-model structured judge, `port.checkGuardrails`) — **no regex / keyword
matching**. `guardrails.ts` is the pure POLICY over the judge's findings; it makes
no content judgment of its own.

**Tiers (honest split).**
- **Keyed tier** (real detection): the judge reads the master and flags guardrails
  it is confident are breached; uncertainty on a taboo/sensitive topic escalates.
- **Keyless dev stub** (`judged: false`): the judge performs NO content detection.
  The ONLY finding is the STRUCTURAL GR-8 backstop — an active taboo overlay
  *exists* (a count, not a content reading), and a non-model stub cannot
  confidently clear it, so it escalates (a taboo draft is never silently
  auto-passed — MEM-1 / GR-8). The eval treats content catch-rates as dormant when
  `!judged`; only the deterministic POLICY teeth hold on this tier.

**Outcomes (PIPE-2).** `pass` (queue-eligible, subject to the GENS-3 picture gate)
· `regenerate` (a fixable finding → fed back with a hint, bounded by the PIPE-4
`agentPolicy.maxRegenerate`, then escalate) · `escalate` (force human approval
regardless of Trust Level — GR-3 / GR-8).

**The planner (G4 / GENS-1).** `planCalendar` pairs a taxonomy TYPE × an agenda
SUBJECT (the grounded `plan-calendar` LLM Skill) and assigns the overlay
DESIGNATIONS deterministically: `designateAndSchedule` reserves impact/gratitude so
no trailing 28-day window lacks one (seeded from history — STW-1, no
cross-regeneration gap), and asks stay `none` in the base plan (≤25% cap trivially
held; campaign asks are PRO-2). INTERNAL taxonomy types only — external slots need
the Radar (EXT-1), deferred. `engine.ts` WIRES the loop end-to-end
(`planAndDraftCalendar`): plan → generate + VAL-gate + persist each slot as a dated
draft ContentItem (`content_item.scheduledFor`), the org's history seeding the next
run's quota. One call → a month of grounded, guardrailed, scheduled drafts.

**Deferred (each a later Skill + eval on this substrate):** GENS-2 per-channel
adaptation, GENS-3/GENS-4 the picture gate + awaiting-picture state, GENS-5 the
channel-fit gate, GENS-6 performance feedback; the planner's external slot types
(Radar) and its generate-per-slot persistence orchestration.

**Gotcha.** The VAL chain runs on the master AND (per GENS-7 / GENS-2) re-runs
per-variant, so an adaptation cannot smuggle a violation past a master-only VAL.
Any prompt/model change to the `generate-draft` or `guardrail-check` Skill bumps
the harness-manifest hash → the eval gate requires a fresh passing run.

<!-- cortex:folder-context (generated by `cortex context` — do not edit inside) -->
## Folder spec context
_Generated from `.spec/` (references only — the registers are the source of truth). Run `cortex context` to refresh._

**Requirements this folder realizes:**
- GEN-1 — Rolling 4-week calendar (.spec/product/requirements/gen-content-generation.yaml)

**Spec-elements:** GENS-1, GENS-7

**Governed by:**
- GR-1 — No outcome promises (.spec/product/guardrails.yaml)
- GR-2 — No tax or legal advice (.spec/product/guardrails.yaml)
- GR-3 — Sensitive-topic escalation (.spec/product/guardrails.yaml)
- GR-4 — AI-visual policy (.spec/product/guardrails.yaml)
- GR-5 — Mandatory citation of external content (.spec/product/guardrails.yaml)
- GR-8 — Stated-correction enforcement (.spec/product/guardrails.yaml)

**Conventions scope:** backend (see .spec/conventions.yaml)

<!-- /cortex:folder-context -->
