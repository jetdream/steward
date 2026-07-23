/**
 * @module @backend/onboarding (ARC-12)
 *
 * A THIN ORCHESTRATOR over shared services (Memory is the single source,
 * DEC-22) — not a second brain. This SPINE slice delivers the Memory-driven
 * onboarding surfaces:
 *
 * @implements ONBS-3 v1  (the gap model driving the interview — computeGaps)
 * @implements ONBS-5 v1  ("here's what I know" review → permanent rules —
 *                         getProfileForReview / applyCorrection)
 * @implements ONBS-6 v1  (first proof, lazily — minimum-viable-context predicate)
 *
 * DEFERRED to the next increment (external-API bearing, out of the brain-spine
 * slice): ONBS-1 signup + 501(c)(3) verification (ProPublica IG-6 — org creation
 * itself is already the auth signup triple), ONBS-2 source ingestion (scraper
 * IG-7 / Meta IG-1), ONBS-4 channel connect (OAuth). The NON-BLOCKING invariant
 * (ONB-1) holds here: none of these surfaces gates first drafts — only the
 * ONBS-6 predicate does.
 */
import type { MemoryEntry, MemoryEntryView, OrgId } from "@shared";
import { memoryEntry } from "@shared/db/schema.js";
import { and, count, eq, isNull } from "drizzle-orm";
import type { Database } from "../db/client.js";
import type { Memory } from "../memory/index.js";
import { subjectKey } from "../memory/subject-key.js";

/** The enumerable gap categories the interview draws from (ONBS-3). */
export type GapCategory = "identity" | "programs" | "people" | "stories" | "style" | "calendar";

/** One category's coverage in the gap model — a DERIVED view over Memory (ONBS-3). */
export interface Gap {
  category: GapCategory;
  /** True once at least one active entry covers the category. */
  present: boolean;
  /** Why closing it helps — tied to the colleague's curiosity, never homework. */
  why: string;
}

/** Which MemoryEntry kind evidences each gap category, plus the "why it helps". */
const GAP_DEFS: ReadonlyArray<{ category: GapCategory; kind: MemoryEntry["kind"]; why: string }> = [
  {
    category: "identity",
    kind: "fact",
    why: "who you are and what you stand for grounds every post",
  },
  {
    category: "programs",
    kind: "program",
    why: "your programs are what most posts are actually about",
  },
  {
    category: "people",
    kind: "person",
    why: "naming the people lets drafts credit and quote them",
  },
  {
    category: "stories",
    kind: "story",
    why: "concrete stories are what make a post land, not slogans",
  },
  {
    category: "style",
    kind: "styleRule",
    why: "your voice keeps drafts sounding like you, not a template",
  },
  { category: "calendar", kind: "event", why: "upcoming events drive timely, non-generic posts" },
];

/** Drop the server-only embedding — the client-safe MemoryEntry projection. */
function toView(row: MemoryEntry): MemoryEntryView {
  const { embedding: _embedding, ...view } = row;
  return view;
}

/**
 * ONBS-3: compute the gap model as a derived view over Memory coverage. No
 * checklist/homework is implied — the interview (INT) consumes this to drive
 * curiosity; MEMS-6 keys the same taxonomy for never-ask-twice.
 */
export async function computeGaps(db: Database, orgId: OrgId): Promise<Gap[]> {
  const rows = await db
    .select({ kind: memoryEntry.kind, n: count() })
    .from(memoryEntry)
    .where(and(eq(memoryEntry.orgId, orgId), isNull(memoryEntry.supersededAt)))
    .groupBy(memoryEntry.kind);
  const counts = new Map(rows.map((r) => [r.kind, r.n]));
  return GAP_DEFS.map(({ category, kind, why }) => ({
    category,
    present: (counts.get(kind) ?? 0) > 0,
    why,
  }));
}

/**
 * ONBS-5: the assembled "here's what I know" profile — every active entry (each
 * carrying its `assumed` mark for the AssumedNote affordance). Not a gate; an
 * un-reviewed profile still grounds drafts.
 */
export async function getProfileForReview(db: Database, orgId: OrgId): Promise<MemoryEntryView[]> {
  const rows = await db
    .select()
    .from(memoryEntry)
    .where(and(eq(memoryEntry.orgId, orgId), isNull(memoryEntry.supersededAt)))
    .orderBy(memoryEntry.kind, memoryEntry.createdAt);
  return rows.map(toView);
}

/**
 * ONBS-5: a founder correction from the review, written through the ONE write
 * path (MEMS-1) on the EXPLICIT correction channel — a factual fix supersedes
 * the inferred entry; a prohibition becomes an enforced taboo. Same path chat
 * (CHT-2) and approvals (APR-3) use.
 */
export async function applyCorrection(
  memory: Memory,
  orgId: OrgId,
  rawInput: string,
): Promise<MemoryEntryView[]> {
  const written = await memory.write(rawInput, {
    orgId,
    source: { trigger: "onboarding-review", detail: rawInput },
    correctionChannel: true,
  });
  return written.map(toView);
}

/** The result of the ONBS-6 minimum-viable-context evaluation. */
export interface FirstDraftReadiness {
  /** The deterministic predicate outcome (draft QUALITY is the LLM part downstream). */
  ready: boolean;
  hasIdentity: boolean;
  hasProgramOrStory: boolean;
  note: string;
}

/**
 * ONBS-6: the minimum-viable-context predicate, evaluated DETERMINISTICALLY —
 * enough grounded Memory to write on-mission = identity (≥1 fact) AND ≥1
 * program- or story-level fact. It never blocks on completeness (ONB-1).
 *
 * Spine scope: the spec's predicate is `grounded Memory AND a seed Strategy
 * (STR-2)`. The Strategy conjunct is pending the STR vertical, so this returns
 * the Memory half; the seed-Strategy gate is added when STR-2 lands (tracked in
 * the spec's realization note). This never over-reports readiness — it can only
 * become stricter when the Strategy conjunct is added.
 */
export async function readyForFirstDrafts(
  db: Database,
  orgId: OrgId,
): Promise<FirstDraftReadiness> {
  const gaps = await computeGaps(db, orgId);
  const has = (c: GapCategory) => gaps.find((g) => g.category === c)?.present ?? false;
  const hasIdentity = has("identity");
  const hasProgramOrStory = has("programs") || has("stories");
  const ready = hasIdentity && hasProgramOrStory;
  return {
    ready,
    hasIdentity,
    hasProgramOrStory,
    note: ready
      ? "minimum viable context reached — first drafts can generate"
      : "still thin — lean on the interview until identity + one program/story fact exist",
  };
}

/**
 * Helper re-export: the deterministic asked-set / gap key (MEMS-6), so callers
 * that build an interview question can key it consistently with dedup.
 */
export { subjectKey };
