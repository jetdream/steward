/**
 * The API-contract test for `appRouter` — the seam the founder UI (@client) binds
 * to. It asserts that the procedures the client's domain hooks call EXIST with the
 * expected name and kind, so a rename or an accidentally-dropped router fails here
 * rather than as a runtime 404 in the browser. Pure introspection: no DB, no LLM.
 *
 * It deliberately checks NAMES + kinds, not behaviour — each capability's own
 * unit/integration tests own the behaviour.
 *
 * @verifies GENS-1 v1
 * @verifies TOPS-1 v1
 * @verifies TOPS-4 v1
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { appRouter } from "./router.js";

/** tRPC's flattened procedure map: "router.procedure" → its def (which carries `type`). */
function procedures(): Record<string, { _def: { type: string } }> {
  return (
    appRouter as unknown as { _def: { procedures: Record<string, { _def: { type: string } }> } }
  )._def.procedures;
}

/** The procedures the founder UI depends on, with the kind each hook expects. */
const CONTRACT: Record<string, "query" | "mutation" | "subscription"> = {
  // identity + org (ACCS)
  "auth.me": "query",
  "auth.devLogin": "mutation",
  "auth.logout": "mutation",
  "org.active": "query",
  "org.setActive": "mutation",
  // onboarding + interviewer (ONBS / INTS)
  "onboarding.ingest": "mutation",
  "onboarding.profile": "query",
  "onboarding.correct": "mutation",
  "onboarding.ready": "query",
  "interviewer.nextQuestions": "mutation",
  "interviewer.answer": "mutation",
  // conversation (CHTS) — the confirm-back redirect is two steps by design
  "chat.openings": "query",
  "chat.answer": "mutation",
  "chat.previewRedirect": "query",
  "chat.applyRedirect": "mutation",
  // the editorial agenda + generation (TOPS / GENS)
  "topics.agenda": "query",
  "topics.identify": "mutation",
  "content.planAndDraft": "mutation",
  "content.adapt": "mutation",
  "content.variants": "query",
  // the Ready spine (APRS) — the most-used surface
  "approval.readyStack": "query",
  "approval.approve": "mutation",
  "approval.batchApprove": "mutation",
  "approval.editDraft": "mutation",
  "approval.skip": "mutation",
  "approval.redirect": "mutation",
  "approval.compose": "mutation",
  // the glass wall (UXS-4/5/8)
  "memory.context": "query",
  "strategy.get": "query",
  "strategy.edit": "mutation",
  "radar.discoveries": "query",
  "radar.triage": "mutation",
  "publishing.log": "query",
  // controls + channels (AUTS / ONBS-4)
  "autonomy.killSwitch": "mutation",
  "autonomy.resume": "mutation",
  "autonomy.status": "query",
  "channels.list": "query",
  "channels.connect": "mutation",
  // the rhythm the home shows (STWS)
  "stewardship.status": "query",
  // media (GENS-3/4)
  "media.library": "query",
  "media.upload": "mutation",
  "media.attach": "mutation",
};

test("every procedure the founder UI binds to exists with the expected kind", () => {
  const procs = procedures();
  const missing: string[] = [];
  const wrongKind: string[] = [];
  for (const [path, kind] of Object.entries(CONTRACT)) {
    const proc = procs[path];
    if (!proc) {
      missing.push(path);
      continue;
    }
    if (proc._def.type !== kind) wrongKind.push(`${path}: expected ${kind}, got ${proc._def.type}`);
  }
  assert.deepEqual(
    missing,
    [],
    "procedures the client contract expects but the router does not expose",
  );
  assert.deepEqual(wrongKind, [], "procedures exposed with the wrong kind");
});

test("planAndDraft and the agenda are reachable — the Ready spine can be filled (GENS-1/TOPS-4)", () => {
  const procs = procedures();
  // Before E0 the Ready stack could only be filled via compose/radar; the planner
  // was unreachable from the client. Guard that regression explicitly.
  assert.ok(procs["content.planAndDraft"], "the rolling planner must be callable from the client");
  assert.ok(procs["topics.agenda"], "the editorial agenda must be readable from the client");
});
