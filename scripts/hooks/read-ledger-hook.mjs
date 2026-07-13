#!/usr/bin/env node
/**
 * Claude Code PostToolUse hook (Read): session read ledger.
 *
 * Implements: CTX-4 v1 (docs/specs/ctx-context-hooks.yaml).
 * When the agent reads a file, every ID whose DEFINITION lives in that file
 * is marked seen in the session ledger — reading the contract counts; reading
 * a mere reference elsewhere does not. Fails open.
 */

import { readFileSync } from 'node:fs';
import { buildGraph } from '../lib/docs-graph.mjs';
import { markSeen } from '../lib/session-ledger.mjs';

try {
  const payload = JSON.parse(readFileSync(0, 'utf8'));
  const path = payload.tool_input?.file_path ?? '';
  if (!path.endsWith('.yaml') && !path.endsWith('.md')) process.exit(0);

  const { defs } = buildGraph();
  const defined = [...defs.entries()].filter(([, d]) => d.file === path).map(([id]) => id);
  if (defined.length) markSeen(payload.session_id, defined);
} catch {
  // fail open
}
process.exit(0);
