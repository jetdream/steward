/**
 * @module @backend/autonomy (ARC-20 — the Autonomy System)
 *
 * Governs what may publish WITHOUT founder approval, per content category (AUT-1),
 * and owns the always-on kill switch (AUT-3). P1b active surface: TL0 (launch) +
 * the kill switch; TL1/TL2 + promotion (AUTS-2) are P2, semantics pinned. Autonomy
 * NEVER short-circuits guardrails — a GR-3/GR-8 hold (owned by the pipeline)
 * overrides the level. All logic here is DETERMINISTIC (LRN-20).
 *
 * @implements AUTS-1 v1  (per-category Trust Levels; TL0 launch state + the veto latch gate)
 * @implements AUTS-3 v1  (the kill switch — global + per-channel pause, always reversible)
 *
 * DEFERRED: AUTS-2 promotion/auto-demote + the permanent TL1 caps (EXTS-3) are P2.
 */
import { randomUUID } from "node:crypto";
import type { ChannelPlatform, OrgId, TrustLevelValue, VetoModel } from "@shared";
import { channelVariant, publishControl, trustLevel } from "@shared/db/schema.js";
import { and, eq } from "drizzle-orm";
import type { Database } from "../db/client.js";

/** The global kill-switch scope key (vs a per-channel platform). */
const GLOBAL = "all";

/**
 * The deterministic AUT-1 auto-publish gate. TL0 (launch) NEVER auto-publishes; a
 * guardrail hold (GR-3/GR-8) or a vetoed item NEVER auto-publishes regardless of
 * level (the backstop + veto latch override the level). Pure.
 */
export function canAutoPublish(input: {
  level: TrustLevelValue;
  heldByGuardrail: boolean;
  vetoed: boolean;
}): boolean {
  if (input.heldByGuardrail || input.vetoed) return false;
  return input.level !== "TL0";
}

export interface AutonomyDeps {
  db: Database;
}

export interface Autonomy {
  trustLevelFor(orgId: OrgId, category: string): Promise<TrustLevelValue>;
  setTrustLevel(
    orgId: OrgId,
    category: string,
    level: TrustLevelValue,
    vetoModel?: VetoModel,
  ): Promise<void>;
  killSwitch(orgId: OrgId): Promise<void>;
  pauseChannel(orgId: OrgId, platform: string): Promise<void>;
  resume(orgId: OrgId, scope?: string): Promise<void>;
  isPaused(orgId: OrgId, platform?: string): Promise<boolean>;
}

export function createAutonomy(deps: AutonomyDeps): Autonomy {
  const { db } = deps;

  /** Pause a scope: record the control row + flip in-flight scheduled variants → paused (DM-5). */
  async function pauseScope(orgId: OrgId, scope: string): Promise<void> {
    await db
      .insert(publishControl)
      .values({ id: randomUUID(), orgId, scope })
      .onConflictDoNothing();
    const scoped =
      scope === GLOBAL
        ? eq(channelVariant.orgId, orgId)
        : and(
            eq(channelVariant.orgId, orgId),
            eq(channelVariant.platform, scope as ChannelPlatform),
          );
    await db
      .update(channelVariant)
      .set({ deliveryState: "paused" })
      .where(and(scoped, eq(channelVariant.deliveryState, "scheduled")));
  }

  return {
    async trustLevelFor(orgId, category) {
      const [row] = await db
        .select({ level: trustLevel.level })
        .from(trustLevel)
        .where(and(eq(trustLevel.orgId, orgId), eq(trustLevel.category, category)));
      return row?.level ?? "TL0"; // launch default
    },

    async setTrustLevel(orgId, category, level, vetoModel) {
      await db
        .insert(trustLevel)
        .values({
          id: randomUUID(),
          orgId,
          category,
          level,
          ...(vetoModel ? { vetoModel } : {}),
        })
        .onConflictDoUpdate({
          target: [trustLevel.orgId, trustLevel.category],
          set: { level, updatedAt: new Date(), ...(vetoModel ? { vetoModel } : {}) },
        });
    },

    /** AUT-3: halt ALL publishing instantly (global). */
    killSwitch: (orgId) => pauseScope(orgId, GLOBAL),

    /** AUT-3: halt one channel. */
    pauseChannel: (orgId, platform) => pauseScope(orgId, platform),

    /** Un-pause a scope (default global): clear the control + flip paused → scheduled. */
    async resume(orgId, scope = GLOBAL) {
      await db
        .delete(publishControl)
        .where(and(eq(publishControl.orgId, orgId), eq(publishControl.scope, scope)));
      const scoped =
        scope === GLOBAL
          ? eq(channelVariant.orgId, orgId)
          : and(
              eq(channelVariant.orgId, orgId),
              eq(channelVariant.platform, scope as ChannelPlatform),
            );
      await db
        .update(channelVariant)
        .set({ deliveryState: "scheduled" })
        .where(and(scoped, eq(channelVariant.deliveryState, "paused")));
    },

    /** True if publishing is paused for the org (global kill) or the given channel. */
    async isPaused(orgId, platform) {
      const rows = await db
        .select({ scope: publishControl.scope })
        .from(publishControl)
        .where(eq(publishControl.orgId, orgId));
      const scopes = new Set(rows.map((r) => r.scope));
      return scopes.has(GLOBAL) || (platform ? scopes.has(platform) : false);
    },
  };
}
