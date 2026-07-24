---
kind: challenge-record
spec: .spec/specs/eval-ai-evaluation.yaml
round: 2
date: 2026-07-24
verdict: pass
by: cortex:architect-challenger (single challenger — tooling spec)
---

# Challenge record — EVS (AI Evaluation & Regression), EVS-2 + EVS-3 (B6)

The B6 delta adding the eval framework proper: EVS-2 (dataset format + runner +
three-mode scorer → EVAL-1) and EVS-3 (champion-vs-challenger regression gate +
manifest-hash enforcement → EVAL-2), over the accepted ADR-0009/0010. (EVS-1, the
assurance substrate, passed at r1 — `eval-ai-evaluation-2026-07-23-r1.md`.)

## Round 2a — FAIL (1 high, 3 medium, 3 low)

VERDICT: fail

- **(high)** Eval runs keyed by `(skill, harnessManifestHash)` dropped the
  `dataset-version` ADR-0010 §5 mandates — a dataset change (e.g. appended
  adversarial cases) would not invalidate a recorded pass → stale green.
- **(medium)** A keyless dev-stub run (prompt-insensitive) could record a
  "passing" champion and green-light a real-quality regression under a
  teeth-not-discipline banner.
- **(medium)** The eval-run/champion STORE location + explicit-promotion step
  were unspecified (silent auto-promotion → baseline drift).
- **(medium)** ADR-0010 §5 delegated tolerance / sample-count / judge-threshold
  to "the eval spec," but EVS neither set nor located them.
- **(low)** SEC-4 "synthetic/de-identified" acceptance was a semantic judgment,
  not structurally testable.
- **(low)** `design` skip-clean was stated unconditionally (contradicting EVS-1
  gating-context fail-loud); **(low)** `interfaces` still said "vitest config."

## Round 2b — FAIL (1 medium)

VERDICT: fail — all of 2a fixed and verified; fresh attack surfaced one:

- **(medium)** EVS-3 called the process gate "teeth, not discipline … active now"
  while `eval:gate` is unwired (`.husky/pre-push` runs only the keyless
  acceptance harness; `eval/CLAUDE.md` admits on-demand-only) — overstating
  enforcement on the exact DEC-3 axis.

## Round 2c — PASS

VERDICT: pass

Fix applied in the recording change: EVS-3 ENFORCEMENT WIRING clause — `eval:gate`
is on-demand, NOT yet a blocking CI/pre-push step (discipline today), becoming a
required CI step when the keyed tier (VERTEX_AI_KEY) is configured; pre-push
enforces only the keyless acceptance harness (EVS-1). Now consistent with
eval/CLAUDE.md.

## Held under attack
- The `(skill, manifestHash, datasetVersion)` key closes the stale-pass hole
  (a dataset-version bump invalidates the prior pass — unit-tested).
- Dormant-quality-teeth framing is honest: keyless = mechanism record, quality
  teeth activate on the keyed tier; the gate reports the dormancy.
- In-repo committed runs store + explicit `npm run eval` promotion + per-skill
  config (`DEFAULT_EVAL_CONFIG`) — no load-bearing invention left.
- `runs.json` carries only scores/metrics, no org content (SEC-4 clean).
- EVAL-3 (trajectory) remains an honest open-questions deferral to GEN; no orphan
  machinery introduced (the cost dimension has a live PIPE-5 consumer).
