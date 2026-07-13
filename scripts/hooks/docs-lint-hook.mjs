#!/usr/bin/env node
/**
 * Claude Code PostToolUse hook (Edit|Write): instant docs lint.
 *
 * Implements: CTX-1 v1 (docs/specs/ctx-context-hooks.yaml).
 * When the edited file belongs to docs/ or scripts/, runs docs-check; on lint
 * errors exits 2 with the error listing on stderr so the harness feeds it
 * straight back to the agent. Fails open (exit 0) on any unexpected problem —
 * tooling bugs must never block work.
 */

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

try {
  const payload = JSON.parse(readFileSync(0, 'utf8'));
  const path = payload.tool_input?.file_path ?? '';
  if (!path.startsWith(`${ROOT}/`) || !/\/(docs|scripts)\//.test(path)) process.exit(0);

  const run = spawnSync(process.execPath, [join(ROOT, 'scripts', 'docs-check.mjs')], { encoding: 'utf8' });
  if (run.status !== 0) {
    // Feed back only errors and cascade lists — not the informational
    // coverage report (CTX-1: "the error listing", anti-pollution).
    const relevant = run.stderr.split('\n').filter((l) => l.startsWith('ERROR') || l.includes('cascade for') || l.startsWith('  ')).join('\n');
    console.error(`docs-check failed after editing ${path} — fix before continuing:\n${relevant.trim()}`);
    process.exit(2); // blocking feedback to the agent
  }
} catch {
  // fail open
}
process.exit(0);
