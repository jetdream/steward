---
kind: challenge-record
spec: docs/specs/ctx-context-hooks.yaml
round: 3
date: 2026-07-13
verdict: pass
by: architect-challenger (via general-purpose agent, delta-scoped)
---

# Verbatim verdict

All checks green. docs-check exits 0 with 0 errors (the "not yet specified" list is the informational coverage report, not a failure). Ledger temp files restored (none remain). Everything holds.

VERDICT: pass
SPEC: docs/specs/ctx-context-hooks.yaml
FINDINGS:
- none survived scrutiny.

Delta scope was CTX-6 v1 only (the one new item since r2); the rest of the spec's implementation was re-verified against the hooks and is unchanged from the r2-passed state.

What I attacked on CTX-6 and why it held:

- Rule-vs-implementation exactness (scripts/hooks/intake-hook.mjs): the four normative clauses match the code exactly. Once-per-session via sentinel — `if (readLedger(sid).has(SENTINEL)) exit(0)` then `markSeen(sid,[SENTINEL])` after emitting (line 26/44). Substantive heuristic — `if (trim().length < 40 && !SUBSTANTIVE.test(prompt)) exit(0)` is exactly "fires when length>=40 OR request-verb regex" (line 27), matching the spec's "length or request-verb heuristic". Fail-open — whole body in try/catch, `process.exit(0)` unconditionally at the end (line 45-48). Injects on stdout via `console.log` (line 29). Live runs confirmed all four: substantive fires and writes the sentinel, repeat is silent, a trivial opener stays silent and does NOT write the sentinel (shot preserved), and a later substantive prompt in that same session then fires.

- Sentinel/ID collision (both directions): impossible. REF_RE is `/\b([A-Z]{1,4})-(\d+)(?:\s+v(\d+))?\b/` (scripts/lib/docs-graph.mjs:30) and IDs match `^[A-Z]{1,4}-\d+$`; `__intake_reminder_shown__` (underscores, lowercase, no LETTERS-DIGITS) cannot match, so no real ID can equal it and neither resolve-ids nor write-guard can ever scan it out of a prompt/content. Proven inert as a contract too: a write-guard call citing MEM-1 in a session whose ledger held only the sentinel still blocked (exit 2) on MEM-1 — the sentinel does not satisfy any contract check. The two live happily in the same `{seen:[...]}` set (verified: `{"seen":["__intake_reminder_shown__","MEM-1"]}`).

- Substantive heuristic failure modes: neither matters. "Always-fires" (any prompt >=40 chars) is capped by once-per-session to at most one banner — the code comment states this is a deliberate generous bias (false-positive cost = one banner). "Never-fires" requires an entire session of sub-40-char verb-less prompts, in which case the shot is simply preserved. Both by design.

- Fail-open on garbage / missing session_id: garbage stdin → JSON.parse throws → catch → silent exit 0 (confirmed). Missing session_id → `sid=undefined` → `ledgerPath(undefined)` → the shared `steward-ctx-default.json` (session-ledger.mjs:14), matching the spec's data section; confirmed writing `{"seen":["__intake_reminder_shown__"]}` to the default ledger.

- Second UserPromptSubmit hook interfering with resolve-ids (.claude/settings.json:34-46): no interference. Separate process invocations with separate stdout pipes — both blocks are injected independently, neither corrupts the other. On the ledger they touch disjoint keys (sentinel vs. resolved IDs); a sequenced run produced `{"seen":["DCX-1","__intake_reminder_shown__"]}` with both intact. The only shared-state risk is the read-modify-write race if the harness runs the two hooks truly in parallel — but that is the exact ledger-write race the r2 challenge already evaluated and the data section already prices in ("safe to delete anytime; worst case one extra deny-once roundtrip"); for the sentinel the worst case is one extra banner. Cost class unchanged, bounded, and consistent with the best-effort nature the spec claims — not a new defect.

- Dedup suppressing genuinely different needs: by design. The reminder is a generic protocol pointer, not need-specific; showing it once per session is exactly the LRN-8 anti-residue mandate the spec cites.

- SKILL.md (.claude/skills/change-request/SKILL.md): the six steps mirror docs/CLAUDE.md Phase A (classify → evaluate-first → contradiction/pushback → gap → flexibility → summary+handoff) and it correctly points to the authoritative protocol rather than restating it (altitude-clean). The hook text points at it accurately.

- docs-check green: `0 error(s)`, exit 0 — the new SKILL.md and intake-hook.mjs under governed dirs introduce no lint regression. All steward-ctx-*.json temp files I created were removed (none remain).

Convergence rule: no surviving high and no blocking medium/low ⇒ pass. The spec is correctly `status: draft` (per the note, not a finding); this verdict is the DCX-13 prerequisite for a subsequent flip to approved.
