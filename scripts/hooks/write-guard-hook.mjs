#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook (Edit|Write): write-time contract guard.
 *
 * Implements: CTX-5 v1 (.spec/specs/ctx-context-hooks.yaml).
 * Computes the pending change's contract IDs — IDs referenced in the new
 * content plus IDs cited by @implements headers of the target file — and
 * blocks the call ONCE (exit 2) when any contract was never loaded this
 * session, delivering the resolved excerpts and marking them seen so the
 * consciously re-issued edit passes. Exempt: IDs defined in the target file
 * itself, and IDs defined nowhere (the lint hook owns those). Fails open.
 */

import { readFileSync } from 'node:fs';
import { buildGraph, formatItem, REF_RE, ROOT } from '../lib/docs-graph.mjs';
import { readLedger, markSeen } from '../lib/session-ledger.mjs';

try {
  const payload = JSON.parse(readFileSync(0, 'utf8'));
  const ti = payload.tool_input ?? {};
  const path = ti.file_path ?? '';
  if (!path.startsWith(`${ROOT}/`) || !/\/(\.spec|src|scripts)\//.test(path)) process.exit(0);

  // Contract IDs: referenced in the pending content + governing @implements
  // headers already present in the target file.
  const pending = [ti.new_string, ti.content].filter(Boolean).join('\n');
  let governing = '';
  try { governing = readFileSync(path, 'utf8').split('\n').filter((l) => l.includes('@implements')).join('\n'); } catch { /* new file */ }
  const mentioned = [...new Set([...(pending + '\n' + governing).matchAll(REF_RE)].map((m) => `${m[1]}-${m[2]}`))];
  if (!mentioned.length) process.exit(0);

  const { defs } = buildGraph();
  const seen = readLedger(payload.session_id);
  const missing = mentioned.filter((id) => {
    const d = defs.get(id);
    return d && d.file !== path && !seen.has(id);
  });
  if (!missing.length) process.exit(0);

  markSeen(payload.session_id, missing); // deny-once: the retry passes
  console.error(
    `This change touches contracts not yet loaded in this session. Their current text (source of truth in the cited files):\n\n` +
    missing.map((id) => formatItem(id, defs.get(id))).join('\n\n') +
    `\n\nReview the excerpts against your change and re-issue the edit (it will pass now).`
  );
  process.exit(2); // block this call; feedback goes to the agent
} catch {
  // fail open
}
process.exit(0);
