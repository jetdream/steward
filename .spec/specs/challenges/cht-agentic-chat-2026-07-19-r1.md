---
kind: challenge-record
spec: .spec/specs/cht-agentic-chat.yaml
round: 1
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (single pass — design-conformance / implementation-divergence / cheaper-alternative+hidden-assumptions / cross-cutting-reconciliation LRN-19+LRN-20 sweep)
---

# Architect Challenger — CHT (Agentic Chat) behavior spec, round 1

VERDICT: fail

SPEC: .spec/specs/cht-agentic-chat.yaml (CHTS-1..5, draft → intended approved)

## The surviving high

**CHT declares NO governed-by, but GR-2 binds the chat ANSWER surface (CHTS-1),
and nothing enforces it.** The spec's guardrail-inheritance reasoning — command
actions (CHTS-3) reuse GEN/PUB/AUT "one source of truth for the action logic and
its guardrails," never a parallel path — is sound *for CHTS-3*: those actions
flow through the pipeline whose specs carry the guardrails, and PIPE-1 enforces
"guardrails before queues" at VAL. That reasoning does **not** reach CHTS-1.

Chat answer synthesis is a direct LLM output to the founder that never enters a
queue and therefore never passes the VAL guardrail chain. GR-2 is **product-**
scoped, not content-scoped: "The product and its content never give legal or tax
advice. Charitable-solicitation registration remains the org's responsibility."
That last clause names exactly the question a 501(c)(3) founder-operator asks a
chat "aware of everything" ("do we need to register for solicitation in state X?",
"is this donation language tax-deductible?"). A grounded answer (the org IS a
501c3, per Memory) can extend into advice; CHTS-1's mitigations — grounding +
the honest "I don't know" — are a soft LLM behavior, not a guardrail gate, and a
private conversational answer is invisible in review. So a *conforming*
implementation ships a GR-2 violation with no citation, no gate, no acceptance.

This is not symmetric with INTS's accepted no-governed-by claim: INT only ASKS
questions; CHT ANSWERS them, and answering is precisely the behavior GR-2
constrains. The spec leans on the SKILL/SURFACE symmetry but the answering
surface introduces a guardrail exposure the asking skill does not. STRS proves
the point in reverse — it cites governed-by [GR-1..GR-6, GR-8] because it
enforces those on the DRAFT path; no spec extends GR-2 to the conversational
answer path, so the product's only ungoverned user-facing LLM-output surface is
CHTS-1.

I tried to refute it three ways and it held: (1) "answers are org-grounded, so
tax questions get I-don't-know" — GR-2 is a hard rule, not a grounding property;
a partially-grounded answer can still advise, and the honest-gap is probabilistic.
(2) "guardrails are queue-scoped by design (PIPE-1)" — then GR-2's product-scope
clause is honored NOWHERE, which is worse, not fine. (3) "it's redundant with
VAL-4/the colleague voice" — redundancy is not the issue; a hard guardrail
binding an owned surface with a plausible, review-invisible violation path is
exactly what governed-by exists to make explicit and testable.

Concrete fix: add `governed-by: [GR-2]` (consider GR-3 for sensitive-topic
conversation, weaker — GR-3 is Trust-Level/approval-scoped and doesn't cleanly
bind a non-queued answer), give CHTS-1 an explicit decline-legal/tax-advice
behavior ("I can't give legal or tax advice — that stays with your advisor"),
and add an acceptance clause that a legal/tax question is declined, not answered.
Re-challenge delta-scoped on CHTS-1 + the file-level governed-by.

## Mediums / lows (would not, alone, block)

- **[medium] CHTS-1 acceptance "never a fabricated answer" is an un-failable
  absolute on a probabilistic step (LRN-20).** The *statement* is honest — it
  splits deterministic retrieval from LLM synthesis and says synthesis is "not a
  deterministic guarantee." But the acceptance clause reads as a hard "never,"
  the same overclaim MEMS-3 was forced to rewrite into a catch-rate + GR-8
  backstop and that INTS-1 frames as review-falsifiable. Fix (one line): frame
  the synthesis property as an eval/catch-rate target on a labeled set, mirroring
  MEMS-3(a) and INTS-1, not an absolute.

## Cross-cutting reconciliation — what I attacked and why it HELD

- **(a) CHTS-2 as an enumerated explicit correction channel in MEMS-1 (v2).**
  VERIFIED against live text: MEMS-1 write triggers list "chat remark or
  confirmed redirect (CHT-2)"; ENTRY TYPES enumerates "a CHT confirmed redirect"
  among the explicit correction channels whose input is stored "as a styleRule
  ... or a taboo ... never as a bare fact." CHTS-2's styleRule/taboo-never-bare-
  fact routing matches exactly. Held.
- **(b) CHTS-2 "Strategy projects it (DEC-22, STRS-1 §c is a view)."** VERIFIED
  against STRS-1: section (c) "is NOT persisted in the doc: it is a live VIEW
  composed of the platform guardrails ... and the active Memory rule/taboo
  overlay (MEM-1, MEMS-3) — DEC-22." No second copy. Held.
- **(c) CHTS-5 ONE enrichment loop shared with INT-4 — ownership.** No double-
  claim. CHTS-5 is the "home of the enrichment loop"; INTS-4 calls its
  disposition-triggered asks "the enrichment loop (CHT-5)" and INTS design says
  the loop "is SHARED with chat (CHT-5) ... this spec owns the questioning
  behavior, not the chat surface." Glossary confirms the loop "Spans CHT-5 (the
  leading chat), APR (the disposition), and INT-4." CHT hosts the loop-surface;
  INT consumes the disposition signal and owns the questioning. Consistent. Held.
- **(d) CHTS-3 "same pipelines as UI, never a parallel path" + guardrail
  inheritance.** VERIFIED for command actions: reuse of GEN/PUB/AUT means the
  guardrails live in those specs' governed-by (PIPE-1 "guardrails before
  queues"), so CHT correctly does not restate them for CHTS-3. The inheritance
  holds — for CHTS-3. (The high above is that it does NOT hold for CHTS-1.) Held.
- **(e) SKILL(INT) vs SURFACE(CHT) split against INTS.** Symmetric and clean:
  CHTS "CHT is the conversational SURFACE; INT is the questioning SKILL it hosts";
  INTS "INT is the questioning skill; CHT is the conversational surface ... this
  spec owns the questioning behavior, not the chat surface." Both co-live in
  ARC-13. Held.

## Other lenses

- **Design-conformance (constrained-by).** ADR-0002/0003 accepted; DM-2/3/5/6/7,
  PIPE-1, ARC-13 all resolve to approved architecture and are used in meaning
  (DM-6/7 host the conversation; DM-5 ContentItem + per-variant delivery state
  grounds the schedule answer; ARC-13 is the Chat+Interviewer component). No
  contradiction of VAL-4 (no fabrication), VAL-5 (colleague voice + reason),
  VAL-6/DS-6/R-10 (never-blank). design-scope: cross-cutting is honest (touches
  Memory, Strategy, the GEN/PUB/AUT pipelines, INT). Clean apart from the GR-2
  governed-by omission.
- **Implementation-divergence.** CHTS-4's reason-field gate ("a message
  generated without a reason is not sent") is a deterministic, checkable
  structural gate with an honest LRN-20 split (reason structural, tone eval-held)
  — checkable. CHTS-2 confirm-back-before-bind is a deterministic gate with a
  checkable acceptance. CHTS-1's "held to the same no-fabrication grounding as
  MEMS-4" matches MEMS-4's real text ("Retrieval is grounding, not invention ...
  never fabricates org facts (VAL-4)"); the source superset (Memory+Strategy+
  ContentItem) is fine. Only the acceptance wording overclaims (medium above).
- **Cheaper-alternative / hidden-assumptions.** Nothing over-built: no new
  entity (DM-6/7 host; overlay/asked-set/openings are derived views), the loop is
  explicitly single (shared with INT-4), suggested-openings are computed views.
  The confirm-back, same-pipeline reuse, and shared enrichment loop assumptions
  are all discharged by reuse of already-approved MEMS/INTS/PIPE machinery. No
  surviving hidden-assumption finding beyond the GR-2 gate gap.

A single surviving high forces fail. Fix the GR-2 governance of the answer
surface (and apply the one-line CHTS-1 acceptance tightening in the same change),
then re-challenge delta-scoped.
