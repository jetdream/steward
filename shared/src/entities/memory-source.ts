/**
 * MemorySource — the provenance stamped on every MemoryEntry write (MEMS-1:
 * "every write carrying its ... source (the triggering event, referenceable for
 * provenance)"). A client-safe value object (Zod, no drizzle) used both as the
 * `source` jsonb column's native type (DM-2, mapped in db/memory.ts) and across
 * the API boundary. VAL-3 "everything logged and visible": no entry lacks a
 * source.
 */
import { z } from "zod";

/**
 * The triggering-event kind behind a write — the enumerated MEMS-1 write
 * triggers plus `dev-seed` (dev/smoke provenance). One value per code path that
 * legitimately mutates Memory; extraction never invents a source.
 */
export const MemoryTrigger = z.enum([
  "onboarding-ingest", // ONBS-2 source ingestion (a website/Meta finding)
  "onboarding-review", // ONBS-5 "here's what I know" correction
  "interview", // INT answer
  "chat", // CHT-2 remark or confirmed redirect
  "approval", // APR bare approval (reinforcement) / approve-with-comment
  "edit", // APR-3 inline edit
  "skip", // APR skip-reason
  "rejection", // APR rejection
  "media-upload", // GEN-3 media upload
  "discovery-triage", // EXT-5 Discoveries triage mark
  "bot", // BOT-1 bot-sent fact/photo (P1)
  "dev-seed", // dev/smoke only
]);
export type MemoryTrigger = z.infer<typeof MemoryTrigger>;

/** Provenance for a single MemoryEntry write. */
export const MemorySource = z.object({
  /** Which enumerated event produced this write (MEMS-1). */
  trigger: MemoryTrigger,
  /**
   * An optional resolvable pointer to the source artifact — e.g. the ingested
   * URL (ONBS-2), a chatMessageId, a ContentItem id. Ingestion entries with NO
   * resolvable pointer are not written (ONBS-2 grounded-extraction guard).
   */
  ref: z.string().min(1).optional(),
  /** Optional human-readable note about the source (e.g. the raw remark). */
  detail: z.string().optional(),
});
export type MemorySource = z.infer<typeof MemorySource>;
