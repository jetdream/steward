---
kind: challenge-record
spec: .spec/specs/pro-proactive-manager.yaml
round: 1
date: 2026-07-19
verdict: pass
by: cortex:architect-challenger (single pass — design-conformance / the-shared-budget key check / implementation-divergence+hidden-assumptions / LRN-19 cross-register sweep + LRN-20/LRN-22)
---

VERDICT: pass

# Proactive Manager (PROS-1..4) — Architect Challenge, round 1

Scope: PROS-1..4 draft, implementing PRO-1..4; the load-bearing new piece is the
shared per-org proactive-interruption budget (PROS-4, DEC-24), which re-pointed
INTS-3→v2 and TOPS-3→v2. Attacked with the four requested lenses plus the
weaponized learnings (LRN-19 sweep, LRN-20 honesty, LRN-22 conform-to-model).

## What I attacked and why it held

- **Single-source ownership / no double ownership (KEY check a).** PROS-4 owns and
  enforces one per-org budget. INTS-3 v2 and TOPS-3 v2 BOTH now read "the rate limit
  is realized via the SHARED PRO-4 budget … draws from the ONE per-org ceiling, NOT
  an independent limit." Coverage re-pinned: INT-3 `against: [INTS-3@2]`, TOP-3
  `against: [TOPS-3@2]`. `docs-check` (cortex engine) green — errors [] warnings [].
  No straggler: an exhaustive ripgrep of rate-limit/cadence/spammy/budget phrasing
  variants across ALL specs + requirements found no surviving independent
  per-capability proactive limit. Reconciliation is complete.
- **Tier-determinism honesty (KEY check b, LRN-20).** "Tiers are deterministic
  (event-date-driven)" is honest: the tier is derived from a push's type + event-date
  presence/proximity (a deterministic comparison), while WHETHER to generate a push
  and its phrasing quality are the LLM parts, held by acceptance + VAL-5. No LLM
  judgment is hidden inside tier assignment. Split matches the MEMS/GENS LRN-20 style.
- **Pull-only exemption (KEY check d).** PROS-4's Discoveries-feed exemption is
  consistent with EXTS-5 ("STRICTLY PULL-ONLY: never badged, counted, or nudged")
  and UXS-8's pull-only-no-badge rule. The feed generates zero interruptions →
  correctly outside the budget.
- **Consumer single-source consults (checks 3/4a).** PROS-1's asked-set + shouldAsk
  path matches MEMS-6 ("PRO-1 material requests … consult this set") and MEMS-5
  class-(a) ("field-only raw material … ask, as a reasoned material request (PRO-1)");
  PRO is a named caller of both. The GEN-4 photo seam matches GENS-4 (library
  suggestions first, then PRO-1 hand-off) — library-first ordering is identical in
  both specs. PROS-3 ask-hygiene ↔ STW-1 + the GEN-1 mix quota is coherent.

## Findings (all non-blocking; no surviving high)

- **[medium] APRS-2 "always-allowed" event-driven channel not reconciled with the new budget (LRN-19).**
  APRS-2 (approved, v1, untouched by this change) declares campaigns + picture-request
  follow-ups (PRO-2/PRO-1) "a separate, always-allowed channel" arriving "ANYTIME."
  PROS-4 now subjects those same HIGH-tier items to a shared hard per-org ceiling
  ("HIGH … may still fire within a hard per-org ceiling, never unbounded"). Survives
  as a reconciliation/cross-reference gap: the hard-ceiling deferral of a supposedly
  "always-allowed" HIGH item is unspecified, and APRS-2 was outside the DEC-24 sweep.
  Refuted as a hard contradiction — APRS-2's "always-allowed" is explicitly scoped to
  "NOT gated by the cadence" (bypass the digest schedule), i.e. it governs TIMING
  while PROS-4 governs VOLUME; the two axes are orthogonal and in the common case
  both let PRO-1/PRO-2 fire promptly. Fix: one cross-reference line in PROS-4 (and/or
  APRS-2) stating the budget bounds volume, APRS-2 bounds timing, and a budget-deferred
  HIGH item is the sole edge where off-cadence delivery yields to the hard ceiling.

- **[medium] budget-vs-hard-ceiling ambiguity + the "never unbounded" ceiling has no dedicated acceptance.**
  PROS-4: "when the budget is spent … a HIGH time-sensitive ask may still fire within
  a hard per-org ceiling" implies ceiling > budget (two numbers). But the acceptance
  tests only "total interruptions stay within the per-org budget," which a HIGH
  overflow would exceed under that reading — so the acceptance can't disambiguate, and
  the "never unbounded" hard ceiling is untested. Not a high: the tier is a
  deterministic counter (not an LLM "never", so LRN-20's un-failable trap does not
  bite), the real anti-stacking teeth ("they do not sum the per-capability limits") IS
  tested, and the fix is one line — either state budget == ceiling (and fix the "may
  still fire when spent" wording) or budget < ceiling and add an acceptance bounding a
  HIGH-only flood by the hard ceiling.

- **[medium] constrained-by omits DM-8, and the "DM-8 for external" tier clause is questionable.**
  PROS data/PROS-4 derive time-sensitivity from "the item's event date (DM-8 for
  external, Memory events for internal)"; DM-2 (internal events) is cited but DM-8
  (ExternalItem) is not in constrained-by. More: external items live in the pull-only,
  EXEMPT Discoveries feed (EXTS-5) and don't generate budgeted pushes, so the "DM-8 for
  external" clause is either spurious or implies an unreconciled budgeted-external-push
  path. Fix: either external event-tied items CAN trigger a budgeted proactive push
  (then add DM-8 to constrained-by and reconcile the EXT-5 exemption) or drop the
  "DM-8 for external" clause and rely on the already-cited DM-2 Memory events.

- **[low] PRO-3 ask-hygiene omitted from the budget's own enumeration/acceptance/DEC-24.**
  PROS-3 declares ask-hygiene "a proactive push (draws from the PROS-4 budget)," but
  PROS-4's consumer list, PROS-4's acceptance, and DEC-24's enumeration all name only
  PRO-1/PRO-2/INT-3/TOP-3. Not an enforcement gap — PROS-4's universal ("A SINGLE
  budget bounds ALL proactive pushes; every push calls admit()") plus PROS-3's own
  acceptance ("the card draws from the shared budget") cover it. Align the enumeration
  + acceptance and assign PRO-3's tier (deferrable/LOW).

- **[low] admit(push, priority) takes a caller-supplied tier (LRN-13).**
  PROS-4 says tiers are deterministic and the manager "OWNS and enforces," yet the
  interface passes `priority` as a caller argument — the tier is then self-declared by
  the consumer rather than derived by the owner from the event-date signal. Benign
  today (trusted internal callers; signatures deferred to code), but to keep tier
  assignment genuinely single-source the manager should DERIVE the tier from the push,
  not trust a passed priority.

- **[low] budget must never suppress a mandatory safety/approval escalation.**
  PROS-4's "bounds ALL proactive pushes … suppressed or deferred when spent" should
  carry a one-line carve-out that GR-3 (sensitive-topic) / GR-8 (taboo) escalations —
  which force human approval regardless of Trust Level — are never budget-gated (they
  are pipeline gates, not Proactive-Manager pushes, but the carve-out removes ambiguity).

- **[low/no-change] governed-by: [GR-1] is correct and sufficient.**
  GR-1 (no outcome promises) is the guardrail binding the Proactive Manager's own
  directly-authored request/proposal text (mirrors TOPS-3's treatment). GR-4 (visuals)
  and GR-5 (external citation) are referenced as rationale/delegated-enforcement —
  photo generation and external-citation enforcement live in GENS (a depends-on),
  which is itself governed-by GR-4/GR-5 — so they are not required in PROS governed-by.
  No change needed; recorded so the omission is a conscious, greppable claim.

## Verdict

No finding survives to high. Single-source ownership, the INTS-3/TOPS-3
reconciliation, the LRN-20 determinism split, and the pull-only exemption all hold
against live text; the graph is green with coverage re-pinned @2. The mediums are
one-line clarification/cross-reference fixes and the lows are notes — non-blocking
under the convergence rule (no surviving high + only one-line-fix mediums/lows ⇒
pass), to be applied in the same change that records this verdict.

VERDICT: pass
