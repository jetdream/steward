/**
 * `npm run eval:gate` — the regression gate (EVS-3, ADR-0010 §5). KEYLESS +
 * cheap: NO model call — it verifies the CURRENT `(harnessManifestHash,
 * datasetVersion)` has a PASSING eval on record (runs.json) for every registered
 * Skill. A harness OR dataset bump with no recorded passing eval FAILS — teeth,
 * not discipline (DEC-3). The PROCESS teeth (a fresh eval was recorded) are active
 * now; the QUALITY-regression teeth are DORMANT while champions are keyless
 * dev-stub records (a keyless run doesn't attest LLM quality) and activate on the
 * keyed tier once creds land — hence this is NOT yet wired as a hard CI blocker.
 */
import { harnessManifestHash } from "../harness/manifest.js";
import { gateCheck } from "./score.js";
import { EVAL_SKILLS } from "./skills/index.js";
import { loadRuns } from "./store.js";

const hash = harnessManifestHash();
const targets = EVAL_SKILLS.map((d) => ({ skill: d.skill, datasetVersion: d.datasetVersion }));
const { ok, failures, dormant } = gateCheck(loadRuns(), targets, hash);

if (!ok) {
  console.error(`eval:gate FAIL — harness ${hash}:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`eval:gate ok — harness ${hash} has a passing eval on record for every skill`);
if (dormant.length) {
  console.log(
    `  note: quality-regression teeth DORMANT (keyless champion) for: ${dormant.join(", ")} — activate on the keyed tier`,
  );
}
