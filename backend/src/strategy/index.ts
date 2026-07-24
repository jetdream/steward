/**
 * @module @backend/strategy (ARC-14 — the Posting Strategy)
 *
 * Produces the StrategyDoc (DM-3) that grounds generation: the five-section
 * editorial contract. Sections (a/b/d/e) PERSIST and version (STR-2); section (c)
 * restrictions is a live DERIVED view over the platform guardrails (GR-1..GR-6) +
 * the active Memory rule/taboo overlay (DEC-22, MEMS-3) — never stored here.
 *
 * @implements STRS-1 v1  (the five-section doc; getStrategy — c always reflects the live overlay)
 * @implements STRS-2 v1  (auto-draft from Memory grounding; founder edits — a/b/d/e → a version,
 *                          an org rule / a prohibition typed in (a) → a Memory write, semantic routing)
 * @implements STRS-4 v1  (two-layer guardrails rendered in section (c): platform read-only + org overlay)
 *
 * DEFERRED: STRS-3 enforcement (validateDraft at the PIPE-2 VAL stage) is consumed
 * by the GEN pipeline — the soft strategy-fit + the hard channel-fit gate (GENS-5)
 * land with GEN (I9); this module supplies the doc + the derived overlay they read.
 * Real per-channel section (e) targets the launch channels until connected-channel
 * filtering lands with ChannelConnection (ONBS-4).
 */
import type { ChannelInstructions, OrgId, StrategyDoc } from "@shared";
import type { Database } from "../db/client.js";
import { runSkill } from "../harness/runtime.js";
import type { Memory } from "../memory/index.js";
import { applyCorrectionPolicy } from "../memory/write.js";
import type { LlmPort } from "../ports/llm.js";
import * as store from "./store.js";

/** The platform guardrails rendered READ-ONLY in section (c) (STRS-4 platform layer). */
const PLATFORM_GUARDRAILS = [
  "GR-1: no outcome / impact promises",
  "GR-2: no tax or legal advice",
  "GR-3: sensitive topics escalate to human approval",
  "GR-4: AI-generated visuals disabled (policy)",
  "GR-5: external content must be cited",
  "GR-6: official platform APIs only",
] as const;

/** The launch channels section (e) is drafted for (per-connection filtering lands with ONBS-4). */
const LAUNCH_CHANNELS = ["fb", "ig", "threads", "x"] as const;

/** An editable Strategy section (STRS-2). */
export type EditSection = "a" | "b" | "c" | "d" | "e";

/** The assembled five-section view (STRS-1): a/b/d/e persisted, c derived (DEC-22). */
export interface StrategyView {
  /** The current doc version, or null when nothing is drafted yet. */
  version: number | null;
  sectionA: string;
  sectionB: string;
  /** (c) is DERIVED, never stored: platform guardrails (read-only) + the active org overlay. */
  sectionC: { platform: readonly string[]; org: string[] };
  sectionD: string;
  sectionE: ChannelInstructions;
}

/** The outcome of an editSection call — a doc version bump OR a Memory rule write. */
export type EditResult = { routed: "doc"; version: number } | { routed: "memory"; entries: number };

/** Assemble the five-section Strategy view (STRS-1) — c always reflects the LIVE overlay. */
export async function getStrategy(db: Database, orgId: OrgId): Promise<StrategyView> {
  const doc = await store.getCurrentDoc(db, orgId);
  const org = await store.activeOverlay(db, orgId);
  return {
    version: doc?.version ?? null,
    sectionA: doc?.sectionA ?? "",
    sectionB: doc?.sectionB ?? "",
    sectionC: { platform: PLATFORM_GUARDRAILS, org },
    sectionD: doc?.sectionD ?? "",
    sectionE: doc?.sectionE ?? {},
  };
}

/**
 * STRS-2 auto-draft: draft sections (a/b/d/e) from the org's Memory grounding via
 * the `draft-strategy` Skill (ARC-27) and persist them as a new StrategyDoc
 * version. Nothing invented — the grounding is the sole source (VAL-4).
 */
export async function autoDraft(db: Database, port: LlmPort, orgId: OrgId): Promise<StrategyDoc> {
  const grounding = await store.activeGroundingText(db, orgId);
  const draft = await runSkill({ orgId, skillId: "draft-strategy" }, () =>
    port.draftStrategy({ grounding, channels: [...LAUNCH_CHANNELS] }),
  );
  return store.insertVersion(db, orgId, draft);
}

/**
 * STRS-2 founder edit with SEMANTIC routing (not by box): a section (c) edit — or a
 * hard PROHIBITION typed in section (a) — is written to Memory as a rule/taboo (the
 * same MEMS-1 correction-channel classification, no new heuristic; it binds via the
 * (c) overlay, MEMS-3). Every other edit is a soft editorial change → a new
 * StrategyDoc version. Both bind immediately with no approval (STRS-2).
 */
/**
 * The STRS-2 semantic routing decision (pure): a section (c) edit, or a hard
 * PROHIBITION typed in section (a), becomes a Memory rule/taboo — reusing the SAME
 * MEMS-1 correction-channel classification (no new heuristic). Everything else is a
 * soft doc edit. A prohibition can never earn soft-only enforcement by placement.
 */
export function routesToMemory(section: EditSection, text: string): boolean {
  if (section === "c") return true;
  return section === "a" && applyCorrectionPolicy("fact", text, true) === "taboo";
}

export async function editSection(
  deps: { db: Database; memory: Pick<Memory, "write"> },
  orgId: OrgId,
  section: EditSection,
  text: string,
  channel?: string,
): Promise<EditResult> {
  if (routesToMemory(section, text)) {
    const written = await deps.memory.write(text, {
      orgId,
      source: { trigger: "chat", detail: `strategy section (${section}) edit` },
      correctionChannel: true,
    });
    return { routed: "memory", entries: written.length };
  }
  const current = await store.getCurrentDoc(deps.db, orgId);
  const next: store.StrategySections = {
    sectionA: current?.sectionA ?? "",
    sectionB: current?.sectionB ?? "",
    sectionD: current?.sectionD ?? "",
    sectionE: current?.sectionE ?? {},
  };
  if (section === "a") next.sectionA = text;
  else if (section === "b") next.sectionB = text;
  else if (section === "d") next.sectionD = text;
  else if (section === "e") next.sectionE = { ...next.sectionE, [channel ?? "all"]: text };
  const doc = await store.insertVersion(deps.db, orgId, next);
  return { routed: "doc", version: doc.version };
}

/** The @backend/strategy facade (ARC-14) — DI composition root, no import-time singletons. */
export interface StrategyDeps {
  db: Database;
  memory: Pick<Memory, "write">;
  port: LlmPort;
}

export interface Strategy {
  getStrategy(orgId: OrgId): Promise<StrategyView>;
  autoDraft(orgId: OrgId): Promise<StrategyDoc>;
  editSection(
    orgId: OrgId,
    section: EditSection,
    text: string,
    channel?: string,
  ): Promise<EditResult>;
}

export function createStrategy(deps: StrategyDeps): Strategy {
  return {
    getStrategy: (orgId) => getStrategy(deps.db, orgId),
    autoDraft: (orgId) => autoDraft(deps.db, deps.port, orgId),
    editSection: (orgId, section, text, channel) =>
      editSection({ db: deps.db, memory: deps.memory }, orgId, section, text, channel),
  };
}

export type { StrategySections } from "./store.js";
export { listVersions } from "./store.js";
export { LAUNCH_CHANNELS, PLATFORM_GUARDRAILS };
