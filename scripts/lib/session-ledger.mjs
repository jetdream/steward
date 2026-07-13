/**
 * session-ledger — per-session record of which contract IDs the agent has
 * actually loaded (CTX-4, .spec/specs/ctx-context-hooks.yaml).
 *
 * Backed by a small JSON file in the OS temp directory; shape {seen: [ids]}.
 * Safe to delete anytime — the worst case is one extra deny-once roundtrip.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function ledgerPath(sessionId) {
  return join(tmpdir(), `steward-ctx-${sessionId ?? 'default'}.json`);
}

/** IDs already seen this session, as a Set. */
export function readLedger(sessionId) {
  try {
    const data = JSON.parse(readFileSync(ledgerPath(sessionId), 'utf8'));
    return new Set(Array.isArray(data) ? data : data.seen ?? []);
  } catch {
    return new Set();
  }
}

/** Mark IDs as seen this session. */
export function markSeen(sessionId, ids) {
  const seen = readLedger(sessionId);
  for (const id of ids) seen.add(id);
  writeFileSync(ledgerPath(sessionId), JSON.stringify({ seen: [...seen] }));
}
