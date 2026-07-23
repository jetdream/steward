---
kind: challenge-record
spec: .spec/specs/eval-ai-evaluation.yaml
round: 1
date: 2026-07-23
verdict: pass
by: cortex:architect-challenger (single challenger — tooling spec)
---

# Challenge record — EVS (AI Evaluation & Regression), EVS-1

Reviewed as the Phase-B (B3) delta over the accepted ADR-0009 / ADR-0010 and the
EVAL requirement register. EVS-1 is the ASSURANCE SUBSTRATE: the test runner, the
tiered acceptance harness, and turning on the `@verifies`/`@validates` evidence
markers (realizes EVAL-4).

## Round 1 — PASS (0 high, 1 medium, 1 low)

VERDICT: pass

- **(medium)** The pre-push/CI acceptance harness could silently narrow to
  unit-only when `DATABASE_URL` is absent — a teeth-eroding silent skip. FIX
  APPLIED: in a gating context (`STEWARD_GATE`/`CI`) the harness FAILS LOUDLY
  when the dev-stub integration env is unavailable (never skips); skip-clean is
  allowed only for ad-hoc local runs. Encoded in the integration test + the
  pre-push hook + the CI Postgres service, and pinned in EVS-1 acceptance.
- **(low)** State that the `verified` rung here attests each element's
  DETERMINISTIC / STRUCTURAL acceptance via the keyless dev stub, not LLM /
  embedding output QUALITY (deferred to the catch-rate / champion-challenger
  tier, EVAL-1/2, B6). FIX APPLIED: sentence added to EVS-1 `design`.

## Held under attack
- Design-conformance to ADR-0010 §5/§7 + DEC-41 (tiered gate; keyed LLM eval
  excluded; DEC-3 "harness assumed but absent" gap closed).
- Altitude / over-structure (VAL-6): substrate-only scoping with the dataset /
  scorer / champion-challenger deferred to B6 is honest sequencing (a scorer
  cannot exist before a Skill does), not premature abstraction.
- The per-item `verified` rung: MEMS-1/2/4/5/6 raised to `verified` backed by
  real `@verifies` tests (a realization event, not re-approval); MEMS-3 (VAL
  enforcement, unbuilt) correctly stays `standard`. Per-item assurance is the
  correct mechanism (engine schema + GRP-10; adm-platform-admin precedent).
- Acceptance objectivity: all four EVS-1 clauses are mutation-testable.

Note: runner switched vitest → node:test via tsx after r1 (NodeNext/`.js`
resolution fit + zero new deps); the findings are runner-agnostic.
