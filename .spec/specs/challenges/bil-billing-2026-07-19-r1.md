---
kind: challenge-record
spec: .spec/specs/bil-billing.yaml
round: 1
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (single pass — P1b contained spec; design-conformance + implementation-divergence + hidden-assumptions + cheaper-alternative + cross-cutting reconciliation LRN-19/20/22)
---

VERDICT: fail

SPEC: .spec/specs/bil-billing.yaml (BILS-1..3, draft)

## What was attacked and how it held / broke

### design-conformance (constrained-by: ADR-0002, ADR-0003, DM-11, IG-4, SEC-4, EXP-8, EXP-34, EXP-35)
- IG-4 / DM-11 Stripe-behind-port framing: matches live text (IG-4 "Stripe Billing — our subscription only (A-5). BIL-1, BIL-2"; ADR-0003 port principle; DM-11 "Stripe linkage"). HELD.
- SEC-4 hard-delete + SEC-8 news trichotomy + NWSS-1 410: BILS-2 restates the active/tombstoned → org-branded not-here vs deleted → generic 410 split, matching SEC-8 and NWSS-1 verbatim in meaning. HELD.
- governed-by omitted: attacked as a possible dodge (GR-2 no-tax-advice, GR-7 conform). GR-1..GR-8 are all content/publishing/design guardrails; billing BEHAVIOR at this altitude produces no content and no user-facing surface (the EXP-34/EXP-35/EXP-45 UI specs, a lower altitude, will carry GR-7). No hard guardrail governs this spec. Honest omission. HELD.
- design-scope: cross-cutting is honest (touches PUB, NWS, SEC, AUT). HELD (but see HIGH-1 — one governing design element is missing).

### cross-cutting reconciliation (LRN-19/22, verified against live text)
- (a) cancel-stops-publishing vs AUTS-3 → BROKE (HIGH-1 below).
- (b) deletion vs SEC-4 + SEC-8 + NWSS-1 → consistent. HELD.
- (c) export "articles included" vs DEC-10 → BROKE (MEDIUM-1 below).
- (d) DM-11 supports the lifecycle → thin; refund-record location unnamed (LOW-1).

## FINDINGS

- [high] BILS-2 models cancel-stops-publishing as "the AUT-3 halt," but AUT-3 is the reversible in-account autonomy kill switch, not an account-lifecycle stop — the real cancel gate is unspecified and mis-attributed. Survives scrutiny: AUTS-3's live text defines the kill switch as a founder-chrome control that maps to DM-5 scheduled->paused and "resume[s] on un-pause (paused->scheduled)" — a reversible, TL-scoped revocability of EARNED AUTONOMY, explicitly "the always-available revocability that makes earned autonomy safe." A cancelled account needs a DURABLE stop tied to account/subscription state, reversed only by re-subscribe (EXP-35), not by un-pause. Two corroborations that this must be an account-level gate, not AUT-3: (1) EXP-34 (a constrained-by) states "payment failure (grace period ... publishing unaffected during grace)" — publishing gating keyed on subscription lifecycle state, which AUT-3 has no notion of; (2) PUBS-1 / ARC-18 gate publishing only on connection state, scheduled state, and the AUT-3 pause/kill — there is NO subscription/account-status publishing gate anywhere in the spec set, so delegating to AUT-3 papers over a genuine BIL→PUB design gap. As written, an implementer wires cancel to the DM-5 `paused` state, and a cancelled (non-paying) org's publishing can resume on any un-pause and is never gated on subscription status. Concrete fix: specify cancel as a distinct ACCOUNT-LEVEL publishing stop driven by Subscription status (DM-11) — on cancel the subscription ends and the publisher honors account state so no further variant publishes, durable against un-pause, reversed only by re-subscribe; grace period keeps publishing (EXP-34). Drop the "via the AUT-3 halt" attribution in intent/design/interfaces/BILS-2 (the AUT-3 kill switch may share the underlying publisher gate at code level but is a different concept). Because ARC-18/PUBS-1 has no such gate today, route the missing account-state publisher gate as a design edge (add it to PUB/ARC-18, or an ADR) rather than absorbing it silently — add the governing design element to constrained-by.

- [medium] "articles included in export" is cited to DEC-10 three times (design, interfaces, BILS-2), but DEC-10 decides news-site URL strategy / theming depth / URL afterlife (Q-8/Q-10/Q-11) — it says nothing about export contents. Survives scrutiny: Q-11 (resolved by DEC-10) is strictly "news-page URL afterlife on churn"; the "export includes articles" scope actually comes from EXP-35 ("articles are included in the export"). A trace follower lands on the wrong decision. Concrete fix: cite EXP-35 (and/or the export scope) for "articles included"; keep DEC-10 only on the URL-afterlife/410-reservation clause where it is correct.

- [low] The G-1 refund-rate metric requires refunds to be recorded and distinguishable from an ordinary post-window cancel (refund-rate <20% and churn <3% are separate G-1 targets), but the data section says "No new entity" and DM-11's body is just "Stripe linkage" — the refund-record location is unnamed. Not blocking (a `refundedAt`/refund-event field on Subscription is within "field lists live in @shared types"), but BILS-1's "recorded for the G-1 refund-rate metric" should name where the refund is recorded so the metric is queryable.

- [low] Cross-reference straggler (LRN-19 class, not a BILS defect): EXP-35 says article URLs "stay reserved only while the account is active," whereas SEC-8 / NWSS-1 / BILS-2 serve the org-branded not-here page while active OR tombstoned. BILS-2 conforms to SEC-8, so this is an EXP-35-vs-trichotomy phrasing reconciliation to sweep, not a fault in this spec.

## Verdict rationale
One high (cancel-stop mis-modeled as the AUT-3 kill switch, with the real account-level gate unspecified and a hidden BIL→PUB design gap) forces fail. The medium (DEC-10 miscitation) and lows are one-line/one-field fixes that should land with the high's resolution. Re-challenge delta-scoped after BILS-2's cancel mechanism is respecified and the PUB/ARC-18 account gate is routed.
