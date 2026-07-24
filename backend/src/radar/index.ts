/**
 * @module @backend/radar (ARC-16 — the External Content Radar)
 *
 * Agenda-driven, grounded discovery of external items (events/news/research) the
 * org could comment on, gated by the deterministic R-4 source guard. Highest
 * reputation-risk surface (R-4): every emitted candidate carries a provenance-bound,
 * dereferenceable source for the downstream GR-5 citation.
 *
 * @implements EXTS-1 v1  (Radar v0 — agenda-driven grounded discovery + the R-4 guard)
 * @implements EXTS-5 v1  (the read-first Discoveries feed + triage → Memory / saved pool)
 *
 * DEFERRED: EXTS-2 external drafts are the content engine's (GENS, hands a
 * worth-a-post candidate to draft); EXTS-3 the permanent TL1 cap is AUTS-2; EXTS-4
 * source depth (structured feeds) is P1. v0 geography is a broad scope constant
 * (org-specific geography from a Memory geo-fact is a refinement); tuning the TOPS-2
 * per-topic research strategies from triage feedback is the deeper loop (deferred).
 */
import type { ExternalItem, ExternalItemDisposition, OrgId } from "@shared";
import type { Database } from "../db/client.js";
import { runSkill } from "../harness/runtime.js";
import type { Memory } from "../memory/index.js";
import type { LlmPort } from "../ports/llm.js";
import { applyR4Guard } from "./guard.js";
import * as store from "./store.js";

const DISCOVER_COUNT = 8;

/** v0 geography scope (EXTS-1). Org-specific geography from a Memory geo-fact is a refinement. */
const GEOGRAPHY_V0 = "the organization's local community, region, and nation";

/** Default HTTP dereferenceability check (HEAD, short timeout). Injected/faked in tests. */
async function httpDeref(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export interface RadarDeps {
  db: Database;
  memory: Pick<Memory, "write">;
  port: LlmPort;
  /** The editorial agenda to discover against (TOPS) — injected to keep radar decoupled. */
  agendaFor: (orgId: OrgId) => Promise<{ id: string; description: string }[]>;
  /** Dereferenceability check — defaults to a real HTTP HEAD; faked in tests. */
  deref?: (url: string) => Promise<boolean>;
}

export interface Radar {
  discoverRun(orgId: OrgId): Promise<ExternalItem[]>;
  discoveries(orgId: OrgId): Promise<ExternalItem[]>;
  savedPool(orgId: OrgId): Promise<ExternalItem[]>;
  triage(
    orgId: OrgId,
    id: string,
    disposition: ExternalItemDisposition,
  ): Promise<ExternalItem | null>;
}

export function createRadar(deps: RadarDeps): Radar {
  const deref = deps.deref ?? httpDeref;
  return {
    async discoverRun(orgId) {
      const topics = await deps.agendaFor(orgId);
      if (topics.length === 0) return []; // no agenda yet — cold start is seeded upstream (TOPS)
      const { candidates, sources } = await runSkill({ orgId, skillId: "radar-discover" }, () =>
        deps.port.groundedSearch({ topics, geography: GEOGRAPHY_V0, count: DISCOVER_COUNT }),
      );
      const survivors = await applyR4Guard(candidates, sources, deref);
      return store.persistCandidates(deps.db, orgId, survivors);
    },
    discoveries: (orgId) => store.listDiscoveries(deps.db, orgId),
    savedPool: (orgId) => store.savedPool(deps.db, orgId),
    async triage(orgId, id, disposition) {
      const updated = await store.setDisposition(deps.db, orgId, id, disposition);
      if (updated) {
        // EXTS-5: each disposition writes to Memory to tune future discovery (MEMS-1).
        await deps.memory.write(`Discoveries triage — "${updated.title}": ${disposition}`, {
          orgId,
          source: { trigger: "discovery-triage", ref: updated.url, detail: disposition },
          correctionChannel: false,
        });
      }
      return updated;
    },
  };
}

export { applyR4Guard, provenanceBound } from "./guard.js";
