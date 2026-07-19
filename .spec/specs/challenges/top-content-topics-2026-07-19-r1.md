---
kind: challenge-record
spec: .spec/specs/top-content-topics.yaml
round: 1
date: 2026-07-19
verdict: fail
by: cortex:architect-challenger (single pass, 3 lenses — design-conformance / implementation-divergence / cheaper-alternative + hidden-assumptions)
---

# TOP spec — round 1

New P0 capability (DEC-23). One HIGH + six mediums + three lows.

- **[high] GEN-1 unreconciled.** DEC-23 reshaped STR-1 + EXT-1 to consume the
  agenda but omitted GEN-1 (the LRN-19 straggler pattern); TOPS-4's acceptance
  asserted GEN-1 behavior GEN-1 v3 lacked. Fixed: GEN-1 → v4 (each slot pairs a
  taxonomy TYPE with an agenda SUBJECT, TOP-4), depends += TOP-4, decided-by
  DEC-23, added to DEC-23 binds; G-1/G-2/G-4/G-5 coverage re-pinned GEN-1@4.
- **[medium] DM-13 lacked evolution fields** → v2 (supersededBy + evidence
  pointer + BIL-2/SEC-4 delete).
- **[medium] thin-Memory acceptance vs MEMS-4** → graceful degradation
  (cause-level topics, flag thin, lean on INT; no fabrication).
- **[medium] "never invents" un-failable (LRN-20)** → deterministic
  evidence-pointer guard + a catch-rate test.
- **[medium] declined-topic keying used MEMS-6 bias-to-ask** → deterministic
  canonical-subject keying (exact suppression).
- **[medium] TOP-1↔EXT-1 cold-start unspecified** → COLD START bootstrap in
  the design section.
- **[lows] section-(a) read-through clarity; proposal-text guardrail scoping;
  BIL-2/SEC-4 topic deletion + SEC-4 in constrained-by; stale approval
  headers.** All fixed.

VERDICT: fail
