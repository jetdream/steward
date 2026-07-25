#!/usr/bin/env node
/**
 * Render MANUAL-EVAL.md from the stories register (DEC-43).
 *
 * The register is the NORMATIVE form of the walkthrough; this makes that a
 * mechanism rather than an assertion. `--check` fails when the committed file is
 * stale, so the human script and the machine script cannot drift.
 *
 *   node scripts/render-manual-eval.mjs           # write
 *   node scripts/render-manual-eval.mjs --check   # verify current (CI/gate)
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

const ROOT = new URL("..", import.meta.url).pathname;
const STORIES_DIR = join(ROOT, ".spec/stories");
const OUT = join(ROOT, "MANUAL-EVAL.md");
const E2E_DIR = join(ROOT, "client/e2e");

/** Every `@validates US-n` marker in the e2e tier → the files that cite it. */
function validationSites() {
  const sites = new Map();
  if (!existsSync(E2E_DIR)) return sites;
  for (const f of readdirSync(E2E_DIR).filter((n) => n.endsWith(".spec.ts"))) {
    const text = readFileSync(join(E2E_DIR, f), "utf8");
    for (const m of text.matchAll(/@validates\s+(US-\d+)/g)) {
      const id = m[1];
      if (!sites.has(id)) sites.set(id, new Set());
      sites.get(id).add(`client/e2e/${f}`);
    }
  }
  return sites;
}

function render() {
  const sites = validationSites();
  const files = readdirSync(STORIES_DIR)
    .filter((n) => n.endsWith(".yaml"))
    .sort();
  const out = [];

  out.push("<!-- GENERATED from .spec/stories/*.yaml — do not edit by hand.");
  out.push("     Change a story, then run `npm run manual-eval`. (DEC-43) -->");
  out.push("");
  out.push("# Steward — manual evaluation");
  out.push("");
  out.push(
    "The walkthrough for a human. Each step is one thing to **do** and one thing to",
    "**observe**; the observation is the story's acceptance sentence, and the same",
    "sentence is asserted automatically by the e2e spec named beside it.",
    "",
    "A step that reads correctly but *feels* wrong is still a finding — the machine",
    "checks that the contract holds, not that the product is good. Route findings",
    "back through the SDLC as spec amendments or `DEC-*` decisions, not as silent",
    "UI tweaks.",
    "",
  );

  for (const file of files) {
    const reg = parse(readFileSync(join(STORIES_DIR, file), "utf8"));
    const items = Object.entries(reg.items ?? {});
    out.push(`## ${reg.title ?? file}`, "");
    let n = 0;
    for (const [id, item] of items) {
      n += 1;
      const cited = sites.get(id);
      out.push(`### ${n}. ${item.title}  <sub>${id}</sub>`, "");
      out.push(`**As** ${String(item.persona ?? "").trim()}`, "");
      out.push(`**Do:** ${String(item.statement ?? "").trim()}`, "");
      out.push(`**You should observe:** ${String(item.acceptance ?? "").trim()}`, "");
      out.push(
        cited
          ? `<sub>Auto-checked by ${[...cited].join(", ")} · serves ${(item.serves ?? []).join(", ")}</sub>`
          : `<sub>⚠ No e2e spec cites ${id} — this step is human-only.</sub>`,
        "",
      );
    }
  }
  return `${out.join("\n").trimEnd()}\n`;
}

const rendered = render();
if (process.argv.includes("--check")) {
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (current !== rendered) {
    console.error("MANUAL-EVAL.md is stale — run `npm run manual-eval` and commit the result.");
    process.exit(1);
  }
  console.log("MANUAL-EVAL.md is current with .spec/stories/");
} else {
  writeFileSync(OUT, rendered);
  console.log(`wrote ${OUT}`);
}
