#!/usr/bin/env node
/**
 * Claude Code UserPromptSubmit hook: prompt-time ID resolution.
 *
 * Implements: CTX-2 v2, CTX-3 v1 (docs/specs/ctx-context-hooks.yaml).
 * Scans the user's message for registered ID tokens, resolves them against
 * the live docs graph, and prints a compact labeled context block to stdout
 * (which the harness injects into the conversation). Bounded to 8 items per
 * prompt; the session ledger (CTX-4) prevents re-injection. Fails open.
 */

import { readFileSync } from 'node:fs';
import { buildGraph, formatItem, REF_RE } from '../lib/docs-graph.mjs';
import { readLedger, markSeen } from '../lib/session-ledger.mjs';

const MAX_ITEMS = 8; // CTX-3

try {
  const payload = JSON.parse(readFileSync(0, 'utf8'));
  const ids = [...new Set([...(payload.prompt ?? '').matchAll(REF_RE)].map((m) => `${m[1]}-${m[2]}`))];
  if (!ids.length) process.exit(0);

  const { defs, registry } = buildGraph();
  const seen = readLedger(payload.session_id);
  const fresh = ids.filter((id) => registry.has(id.split('-')[0]) && !seen.has(id));
  if (!fresh.length) process.exit(0);

  const known = fresh.filter((id) => defs.has(id));
  const unknown = fresh.filter((id) => !defs.has(id));
  const inject = known.slice(0, MAX_ITEMS);
  const overflow = known.slice(MAX_ITEMS);

  const lines = ['<auto-context source="scripts/hooks/resolve-ids-hook.mjs">',
    'Auto-injected excerpts for IDs mentioned in the prompt; the cited files remain the source of truth.'];
  for (const id of inject) lines.push('', formatItem(id, defs.get(id)));
  if (overflow.length) lines.push('', `Also mentioned (not injected, cap ${MAX_ITEMS}): ${overflow.join(', ')}`);
  if (unknown.length) lines.push('', `Mentioned but not defined anywhere: ${unknown.join(', ')}`);
  lines.push('</auto-context>');
  console.log(lines.join('\n'));

  markSeen(payload.session_id, inject);
} catch {
  // fail open
}
process.exit(0);
