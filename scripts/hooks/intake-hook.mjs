#!/usr/bin/env node
/**
 * Claude Code UserPromptSubmit hook: ambient SDLC intake reminder.
 *
 * Implements: CTX-6 v1 (docs/specs/ctx-context-hooks.yaml).
 * On the first substantive prompt of a session, injects a compact reminder of
 * the Phase A intake protocol (docs/CLAUDE.md) so it is in front of the agent
 * at request time. Bounded: shown at most once per session (a sentinel in the
 * session ledger dedupes) and only for a substantive prompt, so a trivial
 * opener does not consume the one shot. Best-effort; fails open.
 */

import { readFileSync } from 'node:fs';
import { readLedger, markSeen } from '../lib/session-ledger.mjs';

const SENTINEL = '__intake_reminder_shown__';
// A prompt is "substantive" if it is long enough or reads like a request —
// deliberately generous; the cost of a false positive is one banner.
const SUBSTANTIVE = /\b(add|change|implement|build|remove|support|refactor|fix|update|create|need|want|should|design|spec|require|make|integrate|migrate|rename|delete|deprecate)\b/i;

try {
  const payload = JSON.parse(readFileSync(0, 'utf8'));
  const prompt = payload.prompt ?? '';
  const sid = payload.session_id;

  if (readLedger(sid).has(SENTINEL)) process.exit(0);          // already shown this session
  if (prompt.trim().length < 40 && !SUBSTANTIVE.test(prompt)) process.exit(0); // trivial opener — save the shot

  console.log(`<sdlc-intake source="scripts/hooks/intake-hook.mjs">
Before acting on a substantive request, run the SDLC intake protocol
(docs/CLAUDE.md Phase A) — the /change-request skill is its runnable form:
  1. Classify: question · bug · new-requirement · change · preference · technical-decision.
  2. Evaluate against the docs FIRST — load goals, principles/guardrails (P-*/GR-*),
     scope, and the relevant requirements/specs by ID before proposing anything.
  3. Contradiction → push back: if it conflicts with a goal/principle/guardrail/scope/
     requirement and the user did not explicitly override, STOP and ask (AskUserQuestion);
     record INC-* + the decision as DEC-*.
  4. Gap → ask, then store the answer (CON-* / A-* / requirement); low-importance → Q-*.
  5. Flexibility → if a one-way-door / brown-phase / scope-foreclosing decision is needed,
     surface it proactively, propose an ADR, get the decision (DEC-*).
Requirement/goal/principle changes need a recorded human decision (decided-by: DEC-x, DCX-16).
</sdlc-intake>`);

  markSeen(sid, [SENTINEL]);
} catch {
  // fail open
}
process.exit(0);
