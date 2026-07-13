/**
 * docs-graph — shared parser and graph builder for the documentation system.
 *
 * Consumed by scripts/docs-check.mjs (lint) and scripts/hooks/* (Claude Code
 * hooks). Parses the YAML subset defined in docs/CLAUDE.md and builds the ID
 * graph: definitions (register `items:` maps + ADR filenames), references
 * (ID tokens anywhere in any docs file), and per-file metadata.
 *
 * The YAML subset (strict by design — anything outside it is a parse error,
 * which is the guard against YAML's silent-indentation failure mode):
 *   - 2-space indentation, maps of scalars / inline arrays / block scalars /
 *     nested maps; no anchors, no multi-docs, no flow maps.
 *   - block scalars: `|`, `|-`, `>`, `>-` (all preserved as literal text —
 *     consumers only read/regex the text).
 *   - full-line `#` comments outside block scalars; blank lines allowed.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, relative, basename } from 'node:path';

export const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
export const DOCS = join(ROOT, 'docs');

/** ID grammar per docs/CLAUDE.md. */
export const ID_RE = /^[A-Z]{1,4}-\d+$/;
export const REF_RE = /\b([A-Z]{1,4})-(\d+)(?:\s+v(\d+))?\b/g;

/** Compact one-item excerpt used by the injection hooks (CTX-2, CTX-5). */
export function formatItem(id, def) {
  const m = def.meta ?? {};
  const tags = [m.priority, m.flexibility, m.status].filter(Boolean).join(', ');
  const rel = def.file.startsWith(ROOT) ? def.file.slice(ROOT.length + 1) : def.file;
  const head = `${id} v${def.version}${tags ? ` (${tags})` : ''} — ${m.title ?? ''} [${rel}:${def.line}]`;
  const body = m.statement ?? m.rule ?? '';
  return body ? `${head}\n${body.split('\n').map((l) => `  ${l}`).join('\n')}` : head;
}

/** Recursively collect files under a directory by extension. */
export function docFiles(dir = DOCS) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return docFiles(p);
    return /\.(md|yaml)$/.test(e.name) ? [p] : [];
  });
}

const INDENT = 2;

/**
 * Parse the YAML subset. Returns { data, keyLines, errors } where keyLines
 * maps dotted key paths (e.g. "items.STR-3") to 1-based line numbers.
 */
export function parseYamlSubset(text, file = '<text>') {
  const lines = text.split('\n');
  const errors = [];
  const keyLines = new Map();

  function parseMap(start, indent, path) {
    const map = {};
    let i = start;
    while (i < lines.length) {
      const raw = lines[i];
      const trimmed = raw.trim();
      if (trimmed === '' || trimmed.startsWith('#')) { i++; continue; }
      const lineIndent = raw.length - raw.trimStart().length;
      if (lineIndent < indent) break;
      if (lineIndent > indent) {
        errors.push(`${file}:${i + 1} unexpected indentation`);
        i++;
        continue;
      }
      // Key = everything up to the first colon (multi-word keys allowed, e.g.
      // glossary terms); the value may itself contain colons.
      const m = raw.slice(indent).match(/^([^:]+):(?:\s(.*))?$/);
      if (!m) {
        errors.push(`${file}:${i + 1} expected "key:" or "key: value"`);
        i++;
        continue;
      }
      const key = m[1].trim().replace(/^(["'])(.*)\1$/, '$2');
      const rawVal = m[2];
      const keyPath = path ? `${path}.${key}` : key;
      keyLines.set(keyPath, i + 1);
      const val = (rawVal ?? '').trim();

      if (val === '' || val === '|' || val === '|-' || val === '>' || val === '>-') {
        if (val === '') {
          // Nested map (or empty value if nothing deeper follows).
          const child = parseMap(i + 1, indent + INDENT, keyPath);
          map[key] = Object.keys(child.value).length ? child.value : '';
          i = child.next;
        } else {
          // Block scalar: consume lines indented deeper than the key.
          const block = [];
          let j = i + 1;
          for (; j < lines.length; j++) {
            const l = lines[j];
            if (l.trim() === '') { block.push(''); continue; }
            if (l.length - l.trimStart().length <= indent) break;
            block.push(l.slice(indent + INDENT));
          }
          while (block.length && block[block.length - 1] === '') block.pop();
          map[key] = block.join('\n');
          i = j;
        }
      } else if (val.startsWith('[')) {
        if (!val.endsWith(']')) errors.push(`${file}:${i + 1} unterminated inline array`);
        map[key] = val.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean);
        i++;
      } else {
        map[key] = val.replace(/^(["'])(.*)\1$/, '$2');
        i++;
      }
    }
    return { value: map, next: i };
  }

  const { value } = parseMap(0, 0, '');
  return { data: value, keyLines, errors };
}

/**
 * Build the full documentation graph.
 * Returns { files, defs, refs, registry, errors }:
 *   files: Map(absPath -> { rel, kind, data|null, lines, keyLines })
 *   defs:  Map(id -> { version, file, line, meta, kind })
 *   refs:  [{ id, prefix, pin, file, line }]
 */
export function buildGraph() {
  const errors = [];
  const files = new Map();
  const defs = new Map();
  const refs = [];

  // Prefix registry: the docs/CLAUDE.md table is the single source.
  const routerText = readFileSync(join(DOCS, 'CLAUDE.md'), 'utf8');
  const registry = new Set([...routerText.matchAll(/^\|\s*`([A-Z]{1,4})`\s*\|/gm)].map((m) => m[1]));

  for (const file of docFiles()) {
    if (basename(file).startsWith('TEMPLATE')) continue;
    const text = readFileSync(file, 'utf8');
    const lines = text.split('\n');
    const rel = relative(ROOT, file);
    let data = null;
    let keyLines = new Map();

    if (file.endsWith('.yaml')) {
      const parsed = parseYamlSubset(text, rel);
      errors.push(...parsed.errors);
      data = parsed.data;
      keyLines = parsed.keyLines;
      // Definitions: keys of the `items:` map. `v` is the item's version.
      for (const [id, meta] of Object.entries(data.items ?? {})) {
        if (!ID_RE.test(id)) {
          errors.push(`${rel}:${keyLines.get(`items.${id}`)} item key "${id}" is not a valid ID`);
          continue;
        }
        const line = keyLines.get(`items.${id}`);
        if (defs.has(id)) errors.push(`${rel}:${line} duplicate definition of ${id} (first in ${relative(ROOT, defs.get(id).file)})`);
        else defs.set(id, { version: Number(meta?.v), file, line, meta, kind: data.kind });
      }
    }

    // ADR IDs are defined by filenames docs/adr/NNNN-slug.md.
    const adr = relative(DOCS, file).match(/^adr\/(\d{4})-.+\.md$/);
    if (adr) defs.set(`ADR-${adr[1]}`, { version: 1, file, line: 1, meta: null, kind: 'adr' });

    files.set(file, { rel, kind: data?.kind ?? 'markdown', data, lines, keyLines });
  }

  // References: ID tokens anywhere in any file, except an item's own key line.
  for (const [file, { lines }] of files) {
    lines.forEach((text, i) => {
      const keyDef = text.match(/^\s*([A-Z]{1,4}-\d+):\s*$/);
      for (const m of text.matchAll(REF_RE)) {
        const id = `${m[1]}-${m[2]}`;
        if (keyDef && keyDef[1] === id) continue;
        refs.push({ id, prefix: m[1], pin: m[3] ? Number(m[3]) : null, file, line: i + 1 });
      }
    });
  }

  return { files, defs, refs, registry, errors };
}
